/**
 * SMS delivery adapter.
 *
 * Set environment variables to enable a real provider:
 *   SMS_PROVIDER=fast2sms   + FAST2SMS_API_KEY
 *   SMS_PROVIDER=msg91      + MSG91_AUTHKEY + MSG91_TEMPLATE_ID
 *   SMS_PROVIDER=twilio     + TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM
 *
 * Without configuration the function returns false and the OTP is printed
 * to the server console (safe for local dev / demo mode).
 */

const SMS_PROVIDER = process.env.SMS_PROVIDER

export async function sendOTPViaSMS(phone: string, otp: string): Promise<boolean> {
  const message = `Your FlowVida OTP is ${otp}. Valid for 5 minutes. Do not share this code.`

  try {
    if (SMS_PROVIDER === 'fast2sms') {
      return await sendFast2SMS(phone, message)
    }

    if (SMS_PROVIDER === 'msg91') {
      return await sendMSG91(phone, otp)
    }

    if (SMS_PROVIDER === 'twilio') {
      return await sendTwilio(phone, message)
    }

    // No provider configured
    return false
  } catch (err) {
    console.error('[SMS] Delivery failed:', err)
    return false
  }
}

async function sendFast2SMS(phone: string, message: string): Promise<boolean> {
  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: process.env.FAST2SMS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'otp',
      variables_values: message.match(/\d{6}/)![0],
      numbers: phone,
    }),
  })
  const data = await res.json()
  return data.return === true
}

async function sendMSG91(phone: string, otp: string): Promise<boolean> {
  const res = await fetch('https://api.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: {
      authkey: process.env.MSG91_AUTHKEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: process.env.MSG91_TEMPLATE_ID,
      mobile: `91${phone}`,
      otp,
    }),
  })
  const data = await res.json()
  return data.type === 'success'
}

async function sendTwilio(phone: string, message: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID!
  const token = process.env.TWILIO_AUTH_TOKEN!
  const from = process.env.TWILIO_FROM!

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: from, To: `+91${phone}`, Body: message }),
    }
  )
  return res.ok
}
