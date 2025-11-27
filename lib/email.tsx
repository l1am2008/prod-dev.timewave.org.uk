import nodemailer from "nodemailer"

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  // Check if SMTP is configured
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    console.log("[v0] SMTP not configured, skipping email")
    return null
  }

  if (!transporter) {
    try {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number.parseInt(smtpPort),
        secure: Number.parseInt(smtpPort) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        connectionTimeout: 5000, // 5 seconds
        greetingTimeout: 5000,
        socketTimeout: 10000,
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
        },
      })
      console.log("[v0] SMTP transporter created successfully")
    } catch (error) {
      console.error("[v0] Failed to create SMTP transporter:", error)
      return null
    }
  }

  return transporter
}

export async function sendVerificationEmail(email: string, token: string, username: string) {
  const transport = getTransporter()

  if (!transport) {
    console.log("[v0] Skipping verification email - SMTP not configured")
    return
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3030"
  const verificationUrl = `${appUrl}/verify-email?token=${token}`

  try {
    await transport.sendMail({
      from: `"Timewave Radio" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your Timewave Radio account",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Timewave Radio!</h1>
              </div>
              <div class="content">
                <p>Hi ${username},</p>
                <p>Thank you for registering with Timewave Radio. Please verify your email address to activate your account.</p>
                <p style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                <p>If you didn't create this account, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Timewave Radio. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
    console.log("[v0] Verification email sent successfully to:", email)
  } catch (error) {
    console.error("[v0] Failed to send verification email:", error)
    throw error
  }
}

export async function sendNewsletterEmail(subscribers: string[], subject: string, content: string) {
  const transport = getTransporter()

  if (!transport) {
    console.log("[v0] Skipping newsletter email - SMTP not configured")
    return
  }

  try {
    const mailPromises = subscribers.map((email) =>
      transport.sendMail({
        from: `"Timewave Radio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Timewave Radio Newsletter</h1>
                </div>
                <div class="content">
                  ${content}
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Timewave Radio. All rights reserved.</p>
                  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe">Unsubscribe</a></p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    )

    await Promise.all(mailPromises)
    console.log("[v0] Newsletter sent to", subscribers.length, "subscribers")
  } catch (error) {
    console.error("[v0] Failed to send newsletter:", error)
    throw error
  }
}

export async function sendShowSubmissionEmail(
  adminEmail: string,
  adminName: string,
  showDetails: {
    title: string
    presenterName: string
    dayOfWeek: number
    startTime: string
    endTime: string
    description?: string
  },
) {
  const transport = getTransporter()

  if (!transport) {
    console.log("[v0] Skipping show submission email - SMTP not configured")
    return
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3030"

  try {
    await transport.sendMail({
      from: `"Timewave Radio" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New Show Submission: ${showDetails.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .show-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Show Submission</h1>
              </div>
              <div class="content">
                <p>Hi ${adminName},</p>
                <p>A new show has been submitted and is awaiting your approval.</p>
                <div class="show-details">
                  <h3>${showDetails.title}</h3>
                  <p><strong>Presenter:</strong> ${showDetails.presenterName}</p>
                  <p><strong>Day:</strong> ${days[showDetails.dayOfWeek]}</p>
                  <p><strong>Time:</strong> ${showDetails.startTime} - ${showDetails.endTime}</p>
                  ${showDetails.description ? `<p><strong>Description:</strong> ${showDetails.description}</p>` : ""}
                </div>
                <p style="text-align: center;">
                  <a href="${appUrl}/admin/shows" class="button">Review Shows</a>
                </p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Timewave Radio. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
    console.log("[v0] Show submission email sent to:", adminEmail)
  } catch (error) {
    console.error("[v0] Failed to send show submission email:", error)
  }
}

export async function sendShowApprovalEmail(
  presenterEmail: string,
  presenterName: string,
  showDetails: {
    title: string
    dayOfWeek: number
    startTime: string
    endTime: string
    approved: boolean
    rejectionReason?: string
  },
) {
  const transport = getTransporter()

  if (!transport) {
    console.log("[v0] Skipping show approval email - SMTP not configured")
    return
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  try {
    await transport.sendMail({
      from: `"Timewave Radio" <${process.env.SMTP_USER}>`,
      to: presenterEmail,
      subject: showDetails.approved ? `Show Approved: ${showDetails.title}` : `Show Not Approved: ${showDetails.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: ${showDetails.approved ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .show-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${showDetails.approved ? "Show Approved!" : "Show Not Approved"}</h1>
              </div>
              <div class="content">
                <p>Hi ${presenterName},</p>
                ${
                  showDetails.approved
                    ? `<p>Great news! Your show has been approved and is now live on the schedule.</p>`
                    : `<p>Your show submission has not been approved at this time.</p>`
                }
                <div class="show-details">
                  <h3>${showDetails.title}</h3>
                  <p><strong>Day:</strong> ${days[showDetails.dayOfWeek]}</p>
                  <p><strong>Time:</strong> ${showDetails.startTime} - ${showDetails.endTime}</p>
                  ${
                    !showDetails.approved && showDetails.rejectionReason
                      ? `<p><strong>Reason:</strong> ${showDetails.rejectionReason}</p>`
                      : ""
                  }
                </div>
                ${
                  showDetails.approved
                    ? `<p>Listeners can now see your show on the schedule. We look forward to your broadcast!</p>`
                    : `<p>If you have questions about this decision, please contact an administrator.</p>`
                }
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Timewave Radio. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
    console.log("[v0] Show approval email sent to:", presenterEmail)
  } catch (error) {
    console.error("[v0] Failed to send show approval email:", error)
  }
}
