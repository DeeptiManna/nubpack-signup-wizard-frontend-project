import { defineConfig } from 'vite'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { randomInt } from 'node:crypto'

const otpStore = new Map()

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > 10_000) reject(new Error('Request body is too large.'))
    })
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch {
        reject(new Error('Invalid request body.'))
      }
    })
    request.on('error', reject)
  })
}

function sendJson(response, status, payload) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

async function sendOtpEmail(email, code, env) {
  const apiKey = env.RESEND_API_KEY
  const fromEmail = env.RESEND_FROM_EMAIL
  if (!apiKey || !fromEmail) {
    throw new Error('Email service is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to .env.')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject: 'Your Nubpack verification code',
      text: `Your Nubpack verification code is ${code}. It expires in 10 minutes.`,
    }),
  })

  if (!response.ok) throw new Error('The verification email could not be sent. Please try again.')
}

function otpApiPlugin(env) {
  return {
    name: 'otp-api',
    configureServer(server) {
      server.middlewares.use('/api/send-otp', async (request, response) => {
        if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed.' })

        try {
          const { email } = await readJson(request)
          const normalizedEmail = String(email || '').trim().toLowerCase()
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return sendJson(response, 400, { error: 'Enter a valid email address.' })
          }

          const code = String(randomInt(1000, 10000))
          await sendOtpEmail(normalizedEmail, code, env)
          otpStore.set(normalizedEmail, { code, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 })
          return sendJson(response, 200, { message: 'Verification code sent.' })
        } catch (error) {
          return sendJson(response, 500, { error: error.message })
        }
      })

      server.middlewares.use('/api/verify-otp', async (request, response) => {
        if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed.' })

        try {
          const { email, code } = await readJson(request)
          const normalizedEmail = String(email || '').trim().toLowerCase()
          const record = otpStore.get(normalizedEmail)
          if (!record) return sendJson(response, 400, { error: 'Request a verification code first.' })
          if (Date.now() > record.expiresAt) {
            otpStore.delete(normalizedEmail)
            return sendJson(response, 400, { error: 'That code has expired. Request a new one.' })
          }
          if (record.attempts >= 5) {
            otpStore.delete(normalizedEmail)
            return sendJson(response, 429, { error: 'Too many incorrect attempts. Request a new code.' })
          }
          if (String(code || '') !== record.code) {
            record.attempts += 1
            return sendJson(response, 400, { error: 'Incorrect verification code.' })
          }

          otpStore.delete(normalizedEmail)
          return sendJson(response, 200, { message: 'Email verified.' })
        } catch (error) {
          return sendJson(response, 400, { error: error.message })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), otpApiPlugin(env)],
  }
})
