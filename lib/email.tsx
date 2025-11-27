import nodemailer from "nodemailer"

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  from: "website@timewave.uk",
})

export async function sendVerificationEmail(email: string, token: string, username: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  await transporter.sendMail({
    from: '"Timewave Radio" <website@timewave.uk>',
    to: email,
    subject: "Verify your Timewave Radio account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to Timewave Radio, ${username}!</h1>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy this link into your browser:</p>
        <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: '"Timewave Radio" <website@timewave.uk>',
    to: email,
    subject: "Reset your Timewave Radio password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy this link into your browser:</p>
        <p style="color: #666; font-size: 14px;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          If you didn't request this, please ignore this email. The link will expire in 1 hour.
        </p>
      </div>
    `,
  })
}

export async function sendNewsletterEmail(emails: string[], subject: string, content: string) {
  await transporter.sendMail({
    from: '"Timewave Radio" <website@timewave.uk>',
    bcc: emails,
    subject,
    html: content,
  })
}
