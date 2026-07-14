/**
 * One-time seed: imports all services from the Absolute Beauty menu.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-menu.ts
 *
 * It targets the FIRST tenant found in the database.
 * Existing services with the same name are SKIPPED (no duplicates).
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MENU_SERVICES = [
  // ── HAIR CUT ────────────────────────────────────────────────────────────
  { name: 'Basic Hair Cut',                category: 'HAIR_CUT',       price: 300,   durationMinutes: 30,  color: '#ec4899' },
  { name: 'Advance Hair Cut',              category: 'HAIR_CUT',       price: 400,   durationMinutes: 45,  color: '#ec4899' },
  { name: 'Creative Hair Cut',             category: 'HAIR_CUT',       price: 500,   durationMinutes: 60,  color: '#ec4899' },
  { name: 'Hair Wash (Shampoo & Conditioner)', category: 'HAIR_CUT',   price: 250,   durationMinutes: 30,  color: '#ec4899' },
  { name: 'Hair Wash & Blow Dry',          category: 'HAIR_CUT',       price: 350,   durationMinutes: 45,  color: '#ec4899' },
  // ── HAIR STYLING ────────────────────────────────────────────────────────
  { name: 'Blow Dry & Styling',            category: 'HAIR_STYLING',   price: 250,   durationMinutes: 30,  color: '#f472b6' },
  { name: 'Hair Ironing',                  category: 'HAIR_STYLING',   price: 500,   durationMinutes: 45,  color: '#f472b6' },
  { name: 'Tongs & Curl',                  category: 'HAIR_STYLING',   price: 500,   durationMinutes: 45,  color: '#f472b6' },
  // ── HAIR COLOUR ─────────────────────────────────────────────────────────
  { name: 'Root Touchup (Basic)',           category: 'HAIR_COLOUR',    price: 600,   durationMinutes: 60,  color: '#e11d48' },
  { name: 'Root Touchup (Advance)',         category: 'HAIR_COLOUR',    price: 800,   durationMinutes: 75,  color: '#e11d48' },
  { name: 'Root Touchup (Premium)',         category: 'HAIR_COLOUR',    price: 1000,  durationMinutes: 90,  color: '#e11d48' },
  { name: 'Global Hair Colour',            category: 'HAIR_COLOUR',    price: 2000,  durationMinutes: 120, color: '#e11d48' },
  { name: 'Highlights',                    category: 'HAIR_COLOUR',    price: 2000,  durationMinutes: 120, color: '#e11d48' },
  { name: 'Balayage Highlights',           category: 'HAIR_COLOUR',    price: 2500,  durationMinutes: 150, color: '#e11d48' },
  // ── HAIR TREATMENT ──────────────────────────────────────────────────────
  { name: 'Hair Straightening',            category: 'HAIR_TREATMENT', price: 6000,  durationMinutes: 240, color: '#be185d' },
  { name: 'Hair Smoothing',                category: 'HAIR_TREATMENT', price: 5000,  durationMinutes: 210, color: '#be185d' },
  { name: 'Keratin Treatment',             category: 'HAIR_TREATMENT', price: 4500,  durationMinutes: 210, color: '#be185d' },
  { name: 'Botox Hair Treatment',          category: 'HAIR_TREATMENT', price: 5000,  durationMinutes: 210, color: '#be185d' },
  // ── HAIR SPA ────────────────────────────────────────────────────────────
  { name: 'Hair Spa',                      category: 'HAIR_SPA',       price: 1000,  durationMinutes: 60,  color: '#db2777' },
  { name: 'Keratin Spa',                   category: 'HAIR_SPA',       price: 1500,  durationMinutes: 75,  color: '#db2777' },
  // ── SCALP TREATMENT ─────────────────────────────────────────────────────
  { name: 'Scalp Scrub (Dandruff)',        category: 'SCALP_TREATMENT',price: 500,   durationMinutes: 45,  color: '#9d174d' },
  { name: 'Mud Spa',                       category: 'SCALP_TREATMENT',price: 1000,  durationMinutes: 60,  color: '#9d174d' },
  // ── WAXING ──────────────────────────────────────────────────────────────
  { name: 'Sugar Wax – Hand',              category: 'WAXING',         price: 100,   durationMinutes: 20,  color: '#d97706' },
  { name: 'Sugar Wax – Half Legs',         category: 'WAXING',         price: 150,   durationMinutes: 20,  color: '#d97706' },
  { name: 'Sugar Wax – Full Legs',         category: 'WAXING',         price: 300,   durationMinutes: 30,  color: '#d97706' },
  { name: 'Sugar Wax – Under Arms',        category: 'WAXING',         price: 50,    durationMinutes: 15,  color: '#d97706' },
  { name: 'Roller Wax – Hand',             category: 'WAXING',         price: 350,   durationMinutes: 25,  color: '#b45309' },
  { name: 'Roller Wax – Half Legs',        category: 'WAXING',         price: 350,   durationMinutes: 25,  color: '#b45309' },
  { name: 'Roller Wax – Full Legs',        category: 'WAXING',         price: 700,   durationMinutes: 40,  color: '#b45309' },
  { name: 'Roller Wax – Under Arms',       category: 'WAXING',         price: 100,   durationMinutes: 15,  color: '#b45309' },
  { name: 'Lipo Wax – Hand',               category: 'WAXING',         price: 300,   durationMinutes: 25,  color: '#92400e' },
  { name: 'Lipo Wax – Half Legs',          category: 'WAXING',         price: 300,   durationMinutes: 25,  color: '#92400e' },
  { name: 'Lipo Wax – Full Legs',          category: 'WAXING',         price: 600,   durationMinutes: 40,  color: '#92400e' },
  { name: 'Lipo Wax – Under Arms',         category: 'WAXING',         price: 80,    durationMinutes: 15,  color: '#92400e' },
  { name: 'Sugar Full Body Wax',           category: 'WAXING',         price: 1000,  durationMinutes: 60,  color: '#d97706' },
  { name: 'Lipo Full Body Wax',            category: 'WAXING',         price: 2000,  durationMinutes: 90,  color: '#b45309' },
  { name: 'Roller Full Body Wax',          category: 'WAXING',         price: 2300,  durationMinutes: 90,  color: '#92400e' },
  // ── THREADING ───────────────────────────────────────────────────────────
  { name: 'Eye Brow Threading',            category: 'THREADING',      price: 60,    durationMinutes: 10,  color: '#f59e0b' },
  { name: 'Fore Head Threading',           category: 'THREADING',      price: 40,    durationMinutes: 10,  color: '#f59e0b' },
  { name: 'Upper Lips Threading',          category: 'THREADING',      price: 20,    durationMinutes: 10,  color: '#f59e0b' },
  { name: 'Chin Threading',               category: 'THREADING',      price: 20,    durationMinutes: 10,  color: '#f59e0b' },
  { name: 'Brazilian Face Wax',            category: 'THREADING',      price: 450,   durationMinutes: 30,  color: '#f59e0b' },
  { name: 'Sugar Face Wax',               category: 'THREADING',      price: 150,   durationMinutes: 20,  color: '#f59e0b' },
  // ── FACIAL ──────────────────────────────────────────────────────────────
  { name: 'D-Tan',                         category: 'FACIAL',         price: 350,   durationMinutes: 30,  color: '#f97316' },
  { name: 'Skin Polishing',                category: 'FACIAL',         price: 500,   durationMinutes: 45,  color: '#f97316' },
  { name: 'Clean-up Normal',               category: 'FACIAL',         price: 500,   durationMinutes: 45,  color: '#f97316' },
  { name: 'Advance Clean-up',              category: 'FACIAL',         price: 1000,  durationMinutes: 60,  color: '#f97316' },
  { name: 'Basic Facial',                  category: 'FACIAL',         price: 1000,  durationMinutes: 60,  color: '#ea580c' },
  { name: 'Insta Facial',                  category: 'FACIAL',         price: 1200,  durationMinutes: 60,  color: '#ea580c' },
  { name: 'Glow Dermi Facial',             category: 'FACIAL',         price: 1400,  durationMinutes: 75,  color: '#ea580c' },
  { name: 'Gold Seal Facial',              category: 'FACIAL',         price: 1600,  durationMinutes: 90,  color: '#ea580c' },
  { name: 'For Layers Facial',             category: 'FACIAL',         price: 2300,  durationMinutes: 90,  color: '#ea580c' },
  { name: 'Pyuzer Vita Facial',            category: 'FACIAL',         price: 2500,  durationMinutes: 90,  color: '#ea580c' },
  { name: 'Dermo Spa Facial',              category: 'FACIAL',         price: 2800,  durationMinutes: 105, color: '#ea580c' },
  { name: 'Deep Pigmentation Treatment',   category: 'FACIAL',         price: 1500,  durationMinutes: 60,  color: '#c2410c' },
  { name: 'Acne Treatment',               category: 'FACIAL',         price: 1500,  durationMinutes: 60,  color: '#c2410c' },
  // ── NAILS ───────────────────────────────────────────────────────────────
  { name: 'Normal Pedicure',               category: 'NAILS',          price: 500,   durationMinutes: 45,  color: '#7c3aed' },
  { name: 'Normal Manicure',               category: 'NAILS',          price: 450,   durationMinutes: 45,  color: '#7c3aed' },
  { name: 'Lotus Pedicure',               category: 'NAILS',          price: 650,   durationMinutes: 60,  color: '#7c3aed' },
  { name: 'Lotus Manicure',               category: 'NAILS',          price: 550,   durationMinutes: 60,  color: '#7c3aed' },
  { name: 'Crystal Pedicure',             category: 'NAILS',          price: 1000,  durationMinutes: 75,  color: '#6d28d9' },
  { name: 'Crystal Manicure',             category: 'NAILS',          price: 700,   durationMinutes: 60,  color: '#6d28d9' },
  { name: 'Gel Nail Polish',               category: 'NAILS',          price: 500,   durationMinutes: 45,  color: '#7c3aed' },
  { name: 'Semi Nail Extension (Temporary)',category: 'NAILS',         price: 1000,  durationMinutes: 60,  color: '#6d28d9' },
  { name: 'Acrylic / Gel Nail Extension', category: 'NAILS',          price: 2000,  durationMinutes: 90,  color: '#5b21b6' },
  { name: 'Nail Art',                      category: 'NAILS',          price: 50,    durationMinutes: 15,  color: '#7c3aed' },
  // ── MASSAGE ─────────────────────────────────────────────────────────────
  { name: 'Cream Massage',                 category: 'MASSAGE',        price: 2000,  durationMinutes: 60,  color: '#059669' },
  { name: 'Oil Massage',                   category: 'MASSAGE',        price: 2500,  durationMinutes: 75,  color: '#059669' },
  { name: 'Head Oil Massage',              category: 'MASSAGE',        price: 250,   durationMinutes: 30,  color: '#059669' },
  // ── MEN'S ───────────────────────────────────────────────────────────────
  { name: "Men's Hair Cut",                category: 'MENS',           price: 200,   durationMinutes: 20,  color: '#0284c7' },
  { name: "Men's Beard",                   category: 'MENS',           price: 100,   durationMinutes: 15,  color: '#0284c7' },
  { name: "Men's Styling",                 category: 'MENS',           price: 50,    durationMinutes: 10,  color: '#0284c7' },
  { name: 'Hair Extension (Permanent)',    category: 'MENS',           price: 15000, durationMinutes: 180, color: '#0369a1' },
  { name: "Men's Hair Extension",          category: 'MENS',           price: 10000, durationMinutes: 180, color: '#0369a1' },
]

async function main() {
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) {
    console.error('❌ No tenant found. Register a parlor first.')
    process.exit(1)
  }

  console.log(`\n🌱 Seeding services for: ${tenant.businessName} (${tenant.id})\n`)

  // Get existing service names to avoid duplicates
  const existing = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    select: { name: true },
  })
  const existingNames = new Set(existing.map(s => s.name.toLowerCase()))

  let added = 0
  let skipped = 0

  for (const svc of MENU_SERVICES) {
    if (existingNames.has(svc.name.toLowerCase())) {
      console.log(`  ⏭  Skipped (exists): ${svc.name}`)
      skipped++
      continue
    }
    await prisma.service.create({
      data: { tenantId: tenant.id, ...svc } as any,
    })
    console.log(`  ✅ Added: ${svc.name} — ₹${svc.price}`)
    added++
  }

  console.log(`\n✨ Done! ${added} services added, ${skipped} skipped.\n`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
