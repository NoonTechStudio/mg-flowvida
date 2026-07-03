# 🔑 SaaS Subscription & Razorpay Playbook (v2)
### Battle-tested patterns from Chérie — reuse for Flowvida, Brainmate, and every future subscription SaaS
*Maintained by Zulfi (ZulNaaz) / Meridian Grid*

---

## Why this file exists

Every subscription SaaS built on this stack (Next.js + Supabase + Razorpay) hits the **same problems in the same order** if you start from a blank slate:
1. Razorpay payment shows "already paid" to every new user
2. Trial countdown shows the wrong number of days / doesn't update correctly
3. Users retain access after their trial or subscription expires
4. The webhook never fires, or silently fails
5. The app feels slow / has no offline install
6. Half a day gets lost re-figuring out Supabase and Razorpay account setup from scratch

This file gives Claude Code the exact fix for each — learned the hard way on Chérie — **plus the initial account/dashboard setup steps** so a new project (Flowvida, Brainmate, etc.) can be wired up in one sitting. **Paste this whole file into a new project's `AGENTS.md` / `CLAUDE.md` or reference it directly** — do not let Claude "figure it out fresh" each time.

---

## Part A — One-time Account & Project Setup

Do this section once per new app, before writing any code. Skip straight to Part B if setup is already done.

### A1. Supabase Project Setup

1. **Create the project** — [supabase.com/dashboard](https://supabase.com/dashboard) → New Project → pick org, name it after the app (e.g. `flowvida-prod`), choose region **closest to your users** (Mumbai/Singapore for Indian users), set a strong DB password and save it in your password manager (you'll need it for direct Postgres connections/migrations).
2. **Grab your keys** — Project Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe client-side, RLS-protected)
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**server-only, never expose client-side** — this bypasses RLS)
3. **Auth setup** — Authentication → Providers:
   - Enable Email (and Phone/OTP via MSG91 or similar if the app needs mobile OTP — see the Nivasi setup pattern for DLT-registered SMS if targeting Indian numbers).
   - Authentication → URL Configuration: set `Site URL` to your production domain and add `localhost:3000` plus your Vercel preview domain pattern to Redirect URLs.
4. **Core subscription schema** — run this in SQL Editor (adjust table/column names to the app, but keep this shape — every playbook fix in Part B depends on these columns existing):
```sql
create table public.users (
  id uuid references auth.users(id) primary key,
  name text,
  mobile text,
  subscription_status text default 'trial' check (subscription_status in ('trial','active','expired','cancelled')),
  trial_expires_at timestamptz,
  subscription_expires_at timestamptz,
  payment_intent_id text,          -- last processed Razorpay payment id, used for webhook idempotency
  created_at timestamptz default now()
);

-- Row Level Security: users can read/update only their own row
alter table public.users enable row level security;

create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);
```
5. **Service role bypass note** — RLS policies above intentionally do NOT grant `insert`/webhook-style updates to the client. The webhook route (Part B, §2) uses the `service_role` key, which bypasses RLS entirely — that's by design, since webhooks have no user session to authenticate against.
6. **Install client libraries**:
```bash
npm install @supabase/supabase-js @supabase/ssr
```
7. **Create the client helpers** — `lib/supabase/server.ts` (server components/routes, cookie-based session) and `lib/supabase/service.ts` (service-role client for webhooks only, no cookies). Keep these separate files so it's visually obvious which one is being imported where.

### A2. Razorpay Account Setup

1. **Create/activate the account** — [dashboard.razorpay.com](https://dashboard.razorpay.com) → sign up with the business email. New accounts start in **Test Mode** automatically — you can build the entire flow before KYC completes.
2. **Complete KYC for Live Mode** — Account & Settings → Activate Account. You'll need: business PAN, GST (if applicable — Zulfi's GSTIN can be reused across ventures where the entity matches), bank account for settlements, and business category/website. KYC review typically takes 1–3 working days — start this early, don't leave it for launch week.
3. **Generate API keys** — Account & Settings → API Keys → Generate Test Key (and later Generate Live Key after activation):
   - `Key Id` → `RAZORPAY_KEY_ID`
   - `Key Secret` → `RAZORPAY_KEY_SECRET` (shown once — copy immediately, regenerate if lost)
   - Keep **Test** and **Live** keys in separate `.env` files/Vercel environments — never mix them.
4. **Set up the webhook** (full detail also in Part B §2, doing it here so it's not forgotten during initial setup):
   - Account & Settings → Webhooks → Add New Webhook
   - Webhook URL: `https://yourdomain.com/api/payment/webhook` (use a tunneled URL like ngrok for local testing, then update to production URL before launch)
   - Secret: type a strong custom string (e.g. `flowvida_webhook_2026`) — **this is a secret you invent, not one Razorpay generates.** Copy it immediately, it's shown only once.
   - Active Events: tick `payment.captured` and `payment.failed` at minimum.
   - Save → put the exact secret string into `RAZORPAY_WEBHOOK_SECRET`.
5. **Install the SDK**:
```bash
npm install razorpay
```
6. **Test Mode cards** — Razorpay provides standard test card numbers (e.g. `4111 1111 1111 1111`, any future expiry, any CVV) and test UPI (`success@razorpay`) for full end-to-end checkout testing before going live. Check the current list on Razorpay's test-mode docs since these are occasionally rotated.
7. **Redeploy after every env var change** — Vercel does not hot-reload env vars into running deployments; this applies to both Supabase and Razorpay keys.

---

## Part B — Recurring Fixes (the five failure modes)

### 1. Razorpay — Dynamic Orders, NOT Static Payment Links

#### ❌ The mistake every fresh attempt makes
Using **Razorpay Payment Links** (`rzp.io/rzp/xxxxx`) hardcoded per plan:
```tsx
// WRONG — do not do this
const paymentLink = 'https://rzp.io/rzp/6E6mIZf'
<a href={paymentLink}>Subscribe</a>
```
**Why it breaks:** A Payment Link is a single fixed URL. The MOMENT one person pays through it, Razorpay marks that exact link "PAID" — permanently. Every other user who clicks the same link (because it's hardcoded in your source) sees "Already Paid" and cannot pay.

#### ✅ The correct pattern — create a fresh Order per checkout session

**Step 1 — Backend API route** (`app/api/payment/create-order/route.ts`):
```ts
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

const PLAN_CONFIG = {
  '1mo': { amount: 7900, months: 1 },   // amount in PAISE (₹79 = 7900)
  '3mo': { amount: 19900, months: 3 },
  '6mo': { amount: 37900, months: 6 },
} as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const planId = (body.plan in PLAN_CONFIG ? body.plan : '1mo') as keyof typeof PLAN_CONFIG
  const { amount, months } = PLAN_CONFIG[planId]

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    notes: { user_id: user.id, plan_months: String(months) }, // critical for webhook
  })

  return NextResponse.json({ order_id: order.id, razorpay_key: process.env.RAZORPAY_KEY_ID! })
}
```

**Step 2 — Frontend calls the API, then opens Razorpay Checkout.js inline** (never redirect to an external link):
```tsx
async function handleSubscribe() {
  // Load checkout.js once
  if (typeof (window as any).Razorpay === 'undefined') {
    await new Promise((resolve) => {
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload = resolve
      document.head.appendChild(s)
    })
  }

  const res = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: selectedPlanId }),
  })
  const { order_id, razorpay_key } = await res.json()

  const rzp = new (window as any).Razorpay({
    key: razorpay_key,
    amount: planAmountInPaise,
    currency: 'INR',
    name: 'YourAppName',
    order_id,
    prefill: { contact: `+91${userMobile}`, name: userName },
    theme: { color: '#YOUR_BRAND_COLOR' },
    handler: () => {
      // Payment succeeded client-side. DO NOT activate subscription here —
      // wait for the webhook (server-side, tamper-proof) to do it.
      toast.success('Payment successful! Activating your subscription…')
      setTimeout(() => { window.location.href = '/dashboard' }, 1500)
    },
  })
  rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'))
  rzp.open()
}
```

**Golden rule:** Every checkout session gets its own `order_id`. Never reuse a link or order across users or sessions.

---

### 2. Razorpay Webhook — Signature Verification & Idempotency

#### Setup steps (do this in Razorpay Dashboard every time, for every new app)
Already done once in Part A2 above — repeat only when the domain changes (e.g. moving from a staging URL to production):
1. **Account & Settings → Webhooks → Add New Webhook** (or edit existing)
2. **Webhook URL:** `https://yourdomain.com/api/payment/webhook`
3. **Secret:** a strong custom string you invent (e.g. `flowvida_webhook_2026`). **This is NOT the same as your API key/secret.** Copy it immediately — Razorpay won't show it again.
4. **Active Events:** tick `payment.captured` and `payment.failed` at minimum. Add `payment_link.paid` only if you're also using Payment Links somewhere (e.g. refunds/manual invoices).
5. Save, then put the **exact secret string** (not a URL, not the dashboard link) into `RAZORPAY_WEBHOOK_SECRET` in your `.env` **and** in Vercel → Project → Settings → Environment Variables.
6. **Redeploy** after setting env vars — they don't apply retroactively.

#### ⚠️ Common mistake to check for
We once found `RAZORPAY_WEBHOOK_SECRET` set to the *dashboard URL* (`https://dashboard.razorpay.com/app/webhooks/xxxxx`) instead of the actual secret string. **Always verify this value is the secret text itself, never a URL.**

#### Webhook route — signature check + idempotency (`app/api/payment/webhook/route.ts`)
```ts
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'  // use SERVICE ROLE key here, not anon

export async function POST(request: Request) {
  const rawBody = await request.text()  // MUST read raw text before verifying — do not JSON.parse first
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  const computedHmac = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')

  let isValid = false
  try {
    const expected = Buffer.from(computedHmac, 'hex')
    const received = Buffer.from(signature, 'hex')
    isValid = expected.length > 0 && received.length === expected.length &&
      timingSafeEqual(expected, received)  // constant-time compare, prevents timing attacks
  } catch { isValid = false }

  if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

  const body = JSON.parse(rawBody)
  const supabase = createServiceClient()

  if (body.event === 'payment.captured') {
    const entity = body.payload.payment.entity
    const paymentId: string = entity.id
    const userId: string = entity.notes?.user_id
    const planMonths = parseInt(entity.notes?.plan_months ?? '1', 10) || 1

    if (!userId) return NextResponse.json({ error: 'Missing user_id in notes' }, { status: 400 })

    // IDEMPOTENCY: Razorpay may fire the same webhook event multiple times.
    // Always check you haven't already processed this exact payment ID.
    const { data: existingUser } = await supabase
      .from('users').select('payment_intent_id').eq('id', userId).single()

    if (existingUser?.payment_intent_id !== paymentId) {
      const expiresAt = new Date(Date.now() + planMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
      await supabase.from('users').update({
        subscription_status: 'active',
        subscription_expires_at: expiresAt,
        payment_intent_id: paymentId,
      }).eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}
```

**Non-negotiables:**
- Verify signature with `timingSafeEqual`, never `===` (timing attack surface)
- Use the **service role** Supabase client in webhooks — webhooks have no user session/cookies to authenticate with
- Always check idempotency via `payment_intent_id` before writing — Razorpay retries webhooks on any non-2xx response
- **Test locally with a tunnel** — Razorpay can't reach `localhost`. Use `ngrok http 3000` (or similar), set that tunnel URL as the webhook URL in Test Mode, and switch it to the real domain before going live.

---

### 3. Trial & Subscription Expiry — Calendar Days, Not Hours

#### ❌ The mistake
```ts
// WRONG — Math.ceil with raw millisecond math drifts and confuses users
const days = Math.ceil((expiryDate.getTime() - Date.now()) / (1000*60*60*24))
```
This ties the countdown to the exact hour of registration. A user who signs up at 7 PM sees "3 days left" for almost 3 full days because of rounding, then it jumps oddly. Users don't think in hours — they think in calendar days.

#### ✅ The correct pattern — `lib/trial.ts`
```ts
/**
 * Calendar-day difference between today's midnight and expiry's midnight.
 * Register Jul 1 → expiry stored as Jul 4 00:00:00
 *   Jul 1 → 3   ("3 days left")
 *   Jul 2 → 2   ("2 days left")
 *   Jul 3 → 1   ("expires tonight")
 *   Jul 4 → 0   (BLOCKED)
 */
export function daysRemaining(expiryDateStr: string): number {
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const expiry = new Date(expiryDateStr)
  const expiryMidnight = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate())
  return Math.round((expiryMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Sets trial_expires_at to midnight starting the (N+1)th day —
 * i.e. end of the Nth day. For a 3-day trial: register Jul 1 → expires Jul 4 00:00.
 */
export function trialExpiryDate(trialDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + trialDays)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
```

Use `daysRemaining()` everywhere you display a countdown (dashboard, settings, plans page) — **never inline the millisecond math again.** One function, one source of truth.

#### UX pattern for the last day
When `daysRemaining === 1`, switch the banner from amber to **red** with copy like *"Your free trial expires tonight at midnight"* — creates urgency without being alarmist earlier.

---

### 4. Enforcing the Paywall — Server-Side Gate, Every Request

#### ❌ The mistake
Only checking `if (!user) redirect('/login')` in the dashboard layout. This means once someone logs in with an expired trial, **they have permanent access** — nothing ever re-checks subscription status.

#### ✅ The correct pattern — gate in the dashboard layout (runs server-side, on every navigation)
```tsx
// app/(dashboard)/layout.tsx
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const profile = await getUserProfile(user.id)
  const status = profile?.subscription_status

  if (status === 'trial') {
    const days = profile?.trial_expires_at ? daysRemaining(profile.trial_expires_at) : null
    if (days === null || days <= 0) redirect('/plans')
  } else if (status === 'active') {
    const days = profile?.subscription_expires_at ? daysRemaining(profile.subscription_expires_at) : null
    if (days === null || days <= 0) redirect('/plans')
  } else {
    redirect('/plans')  // no status, expired, or unknown → block
  }

  return <AppShell>{children}</AppShell>
}
```

**Why the layout is the right place:** Next.js layouts run on every navigation within that route group. Putting the check here means every dashboard page automatically inherits the gate — you never have to remember to add it per-page.

---

### 5. Performance — Deduplicate Supabase Calls with React `cache()`

#### The problem
Every tab switch was re-fetching `getUser()` and business profile fresh — once in the layout, once again in the page — doubling round-trips and making navigation feel slow.

#### The fix — `lib/supabase/queries.ts`
```ts
import { cache } from 'react'
import { createClient } from './server'

// React.cache() deduplicates identical calls within a single render pass.
// Calling getUser() in layout.tsx AND page.tsx only hits Supabase once.
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getBusinessProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_profiles').select('id, business_name, category, address')
    .eq('user_id', userId).single()
  return data
})

export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('mobile, name, subscription_status, subscription_expires_at, trial_expires_at')
    .eq('id', userId).single()
  return data
})
```
Import these everywhere instead of calling Supabase directly for auth/profile data. Combine with `loading.tsx` skeleton files per route for instant perceived navigation.

---

### 6. PWA — Installable App with Branded Splash (not black background)

#### ❌ The mistake
Generating app icons directly from a source PNG that has a transparent or black background. When scaled up for splash screens, this produces an ugly black full-screen flash on launch.

#### ✅ The correct pattern
1. Take your **logo mark only** (no background) and composite it onto your **brand color** background at generation time — don't rely on the source file's own background.
2. Generate icons using `sharp`:
```js
const sharp = require('sharp')
const BG = { r: R, g: G, b: B, alpha: 1 }  // your brand color as RGB

async function makeIcon(size) {
  const iconSize = size - Math.round(size * 0.36)  // ~18% padding each side
  const logoBuf = await sharp('logo-mark.png')
    .resize(iconSize, iconSize, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
    .png().toBuffer()

  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png().toFile(`icon-${size}x${size}.png`)
}
```
Generate: 72, 96, 128, 144, 152, 192, 384, 512px.

3. **manifest.json** — set `background_color` to the SAME brand color:
```json
{ "background_color": "#YOUR_BRAND_HEX", "theme_color": "#YOUR_BRAND_HEX", "display": "standalone" }
```

4. **iOS splash screens** — generate one per common device size (iPhone SE → 14 Pro Max, iPad Pro), same brand-color background with the icon centered around 40% height. Wire via Next.js metadata:
```ts
appleWebApp: {
  capable: true,
  statusBarStyle: "black-translucent",  // lets status bar sit ON TOP of splash
  startupImage: [
    { url: "/splash/iphone-14-pro.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
    // ... one entry per device size
  ],
}
```

5. **Install prompt banner** — capture `beforeinstallprompt`, show a native-style bottom sheet, only when not already `display-mode: standalone`.

6. **Service worker** — cache page navigations, explicitly skip `/api/` and `/auth/` routes, provide an `/offline` fallback page. **Remember:** any page with `onClick` or other event handlers must be `'use client'` — Next.js will fail the build otherwise with "Event handlers cannot be passed to Client Component props."

---

## Part C — Environment Variables Checklist

Verify these on every new project (Part A setup should already have produced all of them):

| Variable | Where it comes from | Common mistake |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Typo in project ref (e.g. `qq` vs `gg`) — copy-paste, don't retype |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Confusing with service role key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | Used in webhook/service routes only — NEVER expose client-side |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay → Account & Settings → API Keys | Must match test vs live mode consistently |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay → Account & Settings → Webhooks (you invent this string) | Must be the secret STRING from webhook setup, not a dashboard URL |
| `NEXT_PUBLIC_SITE_URL` | Your domain | Update per environment (localhost → production domain) |

**Always redeploy after changing any environment variable** — Vercel does not hot-reload env vars into running deployments.

---

## Part D — Quick Diagnostic Checklist (paste into any stuck conversation)

When a subscription/payment feature "isn't working," check in this order:
0. Are Supabase and Razorpay both fully set up per Part A — keys copied correctly, webhook secret is the invented string (not a URL), RLS policies in place? → Fix per §A1/A2
1. Is the frontend calling a dynamic `/api/payment/create-order` route, or hitting a static Razorpay link? → Fix per §1
2. Does the webhook secret in `.env`/Vercel match the actual Razorpay webhook secret string (not a URL)? → Fix per §2
3. Is `daysRemaining()` using calendar-day math, or raw millisecond division? → Fix per §3
4. Does the dashboard layout re-check subscription status on every request, or only on login? → Fix per §4
5. Is the same `getUser()`/profile query being called multiple times per navigation? → Fix per §5
6. Are PWA icons generated with a brand-color background, or inheriting a black/transparent source background? → Fix per §6

---

*This file intentionally omits app-specific pricing, plan names, and branding — copy the patterns and account-setup steps, plug in your own numbers, colors, and Supabase/Razorpay project IDs for each of Flowvida, Brainmate, and future apps.*
