import { sendEmail, type EmailData } from "./email-service"
import type { Region, UserRole } from "./trial-subscription-system"

export interface EmailContext {
  region: Region
  user: {
    name: string
    email: string
    company?: string
    role?: UserRole
    industry?: string
  }
  metadata?: Record<string, any>
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Regional Email Configuration
export const regionalEmailConfig = {
  nigeria: {
    fromEmail: "noreply@daytatech.ng",
    fromName: "DaytaTech Nigeria",
    supportEmail: "support-ng@daytatech.ai",
    supportPhone: "+234-800-DAYTA-NG",
    currency: "₦",
    timezone: "WAT",
    businessHours: "9 AM - 6 PM WAT",
    colors: {
      primary: "#22c55e", // Green
      secondary: "#fbbf24", // Gold
      accent: "#16a34a",
    },
  },
  america: {
    fromEmail: "noreply@daytatech.com",
    fromName: "DaytaTech America",
    supportEmail: "support-us@daytatech.ai",
    supportPhone: "+1-800-DAYTA-US",
    currency: "$",
    timezone: "EST",
    businessHours: "9 AM - 6 PM EST",
    colors: {
      primary: "#3b82f6", // Blue
      secondary: "#ef4444", // Red
      accent: "#1d4ed8",
    },
  },
}

// Welcome Email Templates
export function generateWelcomeEmail(context: EmailContext): EmailTemplate {
  const config = regionalEmailConfig[context.region] || regionalEmailConfig.america
  const { user } = context

  const regionalContent = {
    nigeria: {
      greeting: `Welcome to DaytaTech Nigeria! 🇳🇬`,
      intro: `We're excited to have you join thousands of Nigerian businesses transforming their data into actionable insights.`,
      localContext: `Whether you're in Lagos, Abuja, Port Harcourt, or anywhere across Nigeria, our AI-powered platform is designed specifically for the Nigerian market.`,
      currency: "₦",
      examples: "Dangote Group, GTBank, and Jumia",
      cta: "Start Your Nigerian Business Analysis",
    },
    america: {
      greeting: `Welcome to DaytaTech! 🇺🇸`,
      intro: `Join Fortune 500 companies and innovative startups using AI to revolutionize their data analysis.`,
      localContext: `From Silicon Valley to Wall Street, our platform powers data-driven decisions across America.`,
      currency: "$",
      examples: "Microsoft, Tesla, and Stripe",
      cta: "Begin Your Data Transformation",
    },
  }

  const content = regionalContent[context.region] || regionalContent.america

  const subject = `${content.greeting} Your 30-Day PRO Trial Starts Now!`

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to DaytaTech</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.accent} 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .welcome-box { background-color: #f8fafc; border-left: 4px solid ${config.colors.primary}; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.accent} 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .feature { text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px; }
        .footer { background-color: #1f2937; color: white; padding: 30px 20px; text-align: center; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; text-align: center; }
        .stat { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 24px; font-weight: bold; color: ${config.colors.primary}; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${content.greeting}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your AI-Powered Data Analysis Journey Begins</p>
        </div>
        
        <div class="content">
            <div class="welcome-box">
                <h2 style="color: ${config.colors.primary}; margin-top: 0;">Hello ${user.name}! 👋</h2>
                <p>${content.intro}</p>
                <p>${content.localContext}</p>
            </div>

            <h3 style="color: #1f2937;">🚀 Your PRO Trial Includes:</h3>
            <div class="features">
                <div class="feature">
                    <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
                    <h4 style="margin: 0 0 10px 0; color: ${config.colors.primary};">Unlimited Analysis</h4>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Upload and analyze unlimited files for 30 days</p>
                </div>
                <div class="feature">
                    <div style="font-size: 24px; margin-bottom: 10px;">🤖</div>
                    <h4 style="margin: 0 0 10px 0; color: ${config.colors.primary};">Claude AI Premium</h4>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Advanced AI insights powered by Claude</p>
                </div>
                <div class="feature">
                    <div style="font-size: 24px; margin-bottom: 10px;">📈</div>
                    <h4 style="margin: 0 0 10px 0; color: ${config.colors.primary};">Industry Analysis</h4>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Tailored insights for ${user.industry || "your industry"}</p>
                </div>
                <div class="feature">
                    <div style="font-size: 24px; margin-bottom: 10px;">📋</div>
                    <h4 style="margin: 0 0 10px 0; color: ${config.colors.primary};">Export Everything</h4>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">PDF, Word, Excel, PowerPoint exports</p>
                </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="https://daytatech.ai/dashboard/${context.region}" class="cta-button">${content.cta}</a>
            </div>

            <div class="stats">
                <div class="stat">
                    <div class="stat-number">30</div>
                    <div style="color: #6b7280; font-size: 14px;">Days Free Trial</div>
                </div>
                <div class="stat">
                    <div class="stat-number">∞</div>
                    <div style="color: #6b7280; font-size: 14px;">Analyses Included</div>
                </div>
                <div class="stat">
                    <div class="stat-number">24/7</div>
                    <div style="color: #6b7280; font-size: 14px;">AI Support</div>
                </div>
            </div>

            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h4 style="color: #92400e; margin: 0 0 10px 0;">💡 Quick Start Tips:</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                    <li>Upload your first dataset (CSV, Excel, or JSON)</li>
                    <li>Try our sample ${context.region === "nigeria" ? "Nigerian business" : "Fortune 500"} datasets</li>
                    <li>Explore industry-specific analysis templates</li>
                    <li>Join our ${context.region === "nigeria" ? "Nigerian Business" : "Data Leaders"} community</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <h3 style="margin: 0 0 20px 0;">Need Help Getting Started?</h3>
            <p style="margin: 0 0 10px 0;">📧 Email: ${config.supportEmail}</p>
            <p style="margin: 0 0 10px 0;">📞 Phone: ${config.supportPhone}</p>
            <p style="margin: 0 0 20px 0;">🕒 Support Hours: ${config.businessHours}</p>
            
            <div style="border-top: 1px solid #374151; padding-top: 20px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                    © 2024 DaytaTech ${context.region === "nigeria" ? "Nigeria" : "America"}. Transform your data, transform your business.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`

  const text = `
${content.greeting}

Hello ${user.name}!

${content.intro}

Your 30-Day PRO Trial Includes:
✅ Unlimited data analysis
✅ Claude AI Premium insights  
✅ Industry-specific analysis
✅ Full export capabilities
✅ Priority support

Get started: https://daytatech.ai/dashboard/${context.region}

Need help?
Email: ${config.supportEmail}
Phone: ${config.supportPhone}
Hours: ${config.businessHours}

Welcome to the future of data analysis!

DaytaTech ${context.region === "nigeria" ? "Nigeria" : "America"} Team
`

  return { subject, html, text }
}

// Security Account Email Templates
export function generateSecurityEmail(
  context: EmailContext & {
    changeType: "password" | "email" | "profile" | "billing"
    ipAddress?: string
    location?: string
  },
): EmailTemplate {
  const config = regionalEmailConfig[context.region] || regionalEmailConfig.america
  const { user, changeType, ipAddress, location } = context

  const changeMessages = {
    password: {
      title: "Password Changed",
      message: "Your account password has been successfully updated.",
      icon: "🔐",
    },
    email: {
      title: "Email Address Updated",
      message: "Your account email address has been changed.",
      icon: "📧",
    },
    profile: {
      title: "Profile Information Updated",
      message: "Your profile information has been modified.",
      icon: "👤",
    },
    billing: {
      title: "Billing Information Updated",
      message: "Your billing and payment information has been changed.",
      icon: "💳",
    },
  }

  const change = changeMessages[changeType]
  const subject = `${change.icon} Security Alert: ${change.title} - DaytaTech ${context.region === "nigeria" ? "Nigeria" : "America"}`

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .security-details { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .action-button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
        .footer { background-color: #1f2937; color: white; padding: 30px 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${change.icon} Security Alert</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Account Security Notification</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h2 style="color: #dc2626; margin-top: 0;">Hello ${user.name},</h2>
                <p style="color: #374151; font-size: 16px;">${change.message}</p>
                <p style="color: #6b7280; font-size: 14px;">
                    <strong>Time:</strong> ${new Date().toLocaleString("en-US", {
                      timeZone: context.region === "nigeria" ? "Africa/Lagos" : "America/New_York",
                    })} ${config.timezone}
                </p>
            </div>

            ${
              ipAddress || location
                ? `
            <div class="security-details">
                <h3 style="color: #374151; margin-top: 0;">Security Details:</h3>
                ${ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : ""}
                ${location ? `<p><strong>Location:</strong> ${location}</p>` : ""}
                <p><strong>Device:</strong> Web Browser</p>
            </div>
            `
                : ""
            }

            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h4 style="color: #92400e; margin: 0 0 10px 0;">🛡️ Security Reminder:</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                    <li>If you made this change, no action is required</li>
                    <li>If you didn't make this change, secure your account immediately</li>
                    <li>Use strong, unique passwords for your account</li>
                    <li>Enable two-factor authentication for extra security</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://daytatech.ai/dashboard/${context.region}/settings" class="action-button">Review Account Settings</a>
                <a href="https://daytatech.ai/support" class="action-button" style="background: #6b7280;">Contact Support</a>
            </div>

            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                If you didn't make this change, please contact our security team immediately.
            </p>
        </div>

        <div class="footer">
            <h3 style="margin: 0 0 20px 0;">Security Questions?</h3>
            <p style="margin: 0 0 10px 0;">📧 Security Team: security@daytatech.ai</p>
            <p style="margin: 0 0 10px 0;">📞 Emergency: ${config.supportPhone}</p>
            <p style="margin: 0 0 20px 0;">🕒 Available: ${config.businessHours}</p>
            
            <div style="border-top: 1px solid #374151; padding-top: 20px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                    © 2024 DaytaTech ${context.region === "nigeria" ? "Nigeria" : "America"}. Your security is our priority.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`

  const text = `
SECURITY ALERT - DaytaTech ${context.region === "nigeria" ? "Nigeria" : "America"}

Hello ${user.name},

${change.message}

Time: ${new Date().toLocaleString()} ${config.timezone}
${ipAddress ? `IP Address: ${ipAddress}` : ""}
${location ? `Location: ${location}` : ""}

If you made this change, no action is required.
If you didn't make this change, please secure your account immediately.

Review your account: https://daytatech.ai/dashboard/${context.region}/settings
Contact support: ${config.supportEmail}

DaytaTech Security Team
`

  return { subject, html, text }
}

// Platform Update Email Templates
export function generatePlatformUpdateEmail(
  context: EmailContext & {
    updateType: "maintenance" | "feature" | "security" | "emergency"
    startTime: string
    endTime: string
    description: string
    affectedServices?: string[]
  },
): EmailTemplate {
  const config = regionalEmailConfig[context.region] || regionalEmailConfig.america
  const { user, updateType, startTime, endTime, description, affectedServices } = context

  const updateMessages = {
    maintenance: {
      title: "Scheduled Maintenance",
      icon: "🔧",
      color: "#3b82f6",
    },
    feature: {
      title: "Platform Enhancement",
      icon: "🚀",
      color: "#10b981",
    },
    security: {
      title: "Security Update",
      icon: "🛡️",
      color: "#f59e0b",
    },
    emergency: {
      title: "Emergency Maintenance",
      icon: "⚠️",
      color: "#ef4444",
    },
  }

  const update = updateMessages[updateType]
  const subject = `${update.icon} ${update.title} - DaytaTech ${context.region === "nigeria" ? "Nigeria" : "America"} Platform`

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Platform Update</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, ${update.color} 0%, ${update.color}dd 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 40px 20px; }
        .update-box { background-color: #f8fafc; border-left: 4px solid ${update.color}; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .timeline { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background-color: #1f2937; color: white; padding: 30px 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${update.icon} ${update.title}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Platform Update Notification</p>
        </div>
        
        <div class="content">
            <div class="update-box">
                <h2 style="color: ${update.color}; margin-top: 0;">Hello ${user.name},</h2>
                <p style="color: #374151; font-size: 16px;">${description}</p>
            </div>

            <div class="timeline">
                <h3 style="color: #374151; margin-top: 0;">📅 Update Schedule:</h3>
                <p><strong>Start Time:</strong> ${new Date(startTime).toLocaleString("en-US", {
                  timeZone: context.region === "nigeria" ? "Africa/Lagos" : "America/New_York",
                })} ${config.timezone}</p>
                <p><strong>End Time:</strong> ${new Date(endTime).toLocaleString("en-US", {
                  timeZone: context.region === "nigeria" ? "Africa/Lagos" : "America/New_York",
                })} ${config.timezone}</p>
                <p><strong>Duration:</strong> ${Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60))} minutes</p>
            </div>

            ${
              affectedServices && affectedServices.length > 0
                ? `
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h4 style="color: #92400e; margin: 0 0 10px 0;">⚠️ Affected Services:</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                    ${affectedServices.map((service) => `<li>${service}</li>`).join("")}
                </ul>
            </div>
            `
                : ""
            }

            <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h4 style="color: #065f46; margin: 0 0 10px 0;">💡 What You Can Do:</h4>
                <ul style="color: #065f46; margin: 0; padding-left: 20px;">
                    <li>Save any work in progress before the maintenance window</li>
                    <li>Plan your analysis tasks around the downtime</li>
                    <li>Check our status page for real-time updates</li>
                    <li>Follow us on social media for quick updates</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://status.daytatech.ai" style="display: inline-block; background: ${update.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px;">Check Status Page</a>
                <a href="https://daytatech.ai/support" style="display: inline-block; background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px;">Contact Support</a>
            </div>
        </div>

        <div class="footer">
            <h3 style="margin: 0 0 20px 0;">Stay Updated</h3>
            <p style="margin: 0 0 10px 0;">📧 Updates: ${config.supportEmail}</p>
            <p style="margin: 0 0 10px 0;">📊 Status: https://status.daytatech.ai</p>
            <p style="margin: 0 0 20px 0;">📞 Support: ${config.supportPhone}</p>
            
            <div style="border-top: 1px solid #374151; padding-top: 20px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                    © 2024 DaytaTech ${context.region === "nigeria" ? "Nigeria" : "America"}. We appreciate your patience.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`

  const text = `
${update.title} - DaytaTech ${context.region === "nigeria" ? "Nigeria" : "America"}

Hello ${user.name},

${description}

SCHEDULE:
Start: ${new Date(startTime).toLocaleString()} ${config.timezone}
End: ${new Date(endTime).toLocaleString()} ${config.timezone}
Duration: ${Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60))} minutes

${
  affectedServices && affectedServices.length > 0
    ? `
AFFECTED SERVICES:
${affectedServices.map((service) => `- ${service}`).join("\n")}
`
    : ""
}

Status updates: https://status.daytatech.ai
Support: ${config.supportEmail}

Thank you for your patience.

DaytaTech Team
`

  return { subject, html, text }
}

// Main Email Workflow Service
export class EmailWorkflowService {
  private static instance: EmailWorkflowService

  static getInstance(): EmailWorkflowService {
    if (!EmailWorkflowService.instance) {
      EmailWorkflowService.instance = new EmailWorkflowService()
    }
    return EmailWorkflowService.instance
  }

  async sendWelcomeEmail(context: EmailContext): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = generateWelcomeEmail(context)
      const config = regionalEmailConfig[context.region] || regionalEmailConfig.america

      const emailData: EmailData = {
        to: context.user.email,
        from: `${config.fromName} <${config.fromEmail}>`,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }

      const result = await sendEmail(emailData)

      // Log email activity
      await this.logEmailActivity({
        type: "welcome",
        region: context.region,
        userId: context.user.email,
        status: result.success ? "sent" : "failed",
        metadata: { template: "welcome", region: context.region },
      })

      return result
    } catch (error) {
      console.error("Welcome email error:", error)
      return { success: false, error: "Failed to send welcome email" }
    }
  }

  async sendSecurityEmail(
    context: EmailContext & {
      changeType: "password" | "email" | "profile" | "billing"
      ipAddress?: string
      location?: string
    },
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = generateSecurityEmail(context)
      const config = regionalEmailConfig[context.region] || regionalEmailConfig.america

      const emailData: EmailData = {
        to: context.user.email,
        from: `${config.fromName} Security <${config.fromEmail}>`,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }

      const result = await sendEmail(emailData)

      // Log security email activity
      await this.logEmailActivity({
        type: "security",
        region: context.region,
        userId: context.user.email,
        status: result.success ? "sent" : "failed",
        metadata: {
          template: "security",
          changeType: context.changeType,
          ipAddress: context.ipAddress,
          region: context.region,
        },
      })

      return result
    } catch (error) {
      console.error("Security email error:", error)
      return { success: false, error: "Failed to send security email" }
    }
  }

  async sendPlatformUpdateEmail(
    context: EmailContext & {
      updateType: "maintenance" | "feature" | "security" | "emergency"
      startTime: string
      endTime: string
      description: string
      affectedServices?: string[]
    },
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = generatePlatformUpdateEmail(context)
      const config = regionalEmailConfig[context.region] || regionalEmailConfig.america

      const emailData: EmailData = {
        to: context.user.email,
        from: `${config.fromName} Updates <${config.fromEmail}>`,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }

      const result = await sendEmail(emailData)

      // Log platform update email activity
      await this.logEmailActivity({
        type: "platform_update",
        region: context.region,
        userId: context.user.email,
        status: result.success ? "sent" : "failed",
        metadata: {
          template: "platform_update",
          updateType: context.updateType,
          startTime: context.startTime,
          endTime: context.endTime,
          region: context.region,
        },
      })

      return result
    } catch (error) {
      console.error("Platform update email error:", error)
      return { success: false, error: "Failed to send platform update email" }
    }
  }

  private async logEmailActivity(activity: {
    type: string
    region: Region
    userId: string
    status: "sent" | "failed" | "bounced" | "opened" | "clicked"
    metadata?: Record<string, any>
  }): Promise<void> {
    try {
      // In a real application, this would log to your database
      console.log("Email Activity Log:", {
        ...activity,
        timestamp: new Date().toISOString(),
      })

      // You could also send this to analytics services
      // await analyticsService.track('email_sent', activity)
    } catch (error) {
      console.error("Failed to log email activity:", error)
    }
  }
}
