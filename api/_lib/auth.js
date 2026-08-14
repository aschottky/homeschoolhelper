import { betterAuth } from 'better-auth'
import { Resend } from 'resend'
import { pool } from './db.js'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const socialProviders = {}
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }
}

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.SITE_URL,
  trustedOrigins: [process.env.SITE_URL, process.env.BETTER_AUTH_URL].filter(Boolean),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.warn('RESEND_API_KEY not set - password reset email not sent. URL:', url)
        return
      }
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'HomeschoolHelper <onboarding@resend.dev>',
        to: user.email,
        subject: 'Reset your HomeschoolHelper password',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #2F5D50;">Reset your password</h2>
            <p>We received a request to reset the password for your HomeschoolHelper account.</p>
            <p style="margin: 24px 0;">
              <a href="${url}" style="background: #2F5D50; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Reset Password</a>
            </p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      })
    },
  },
  socialProviders,
  databaseHooks: {
    user: {
      create: {
        // Replaces the old Supabase handle_new_user() trigger; runs for both
        // email/password and Google signups.
        after: async (user) => {
          await pool.query(
            'insert into profiles (id, email) values ($1, $2) on conflict (id) do nothing',
            [user.id, user.email]
          )
        },
      },
    },
  },
})
