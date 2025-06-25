async sendWelcomeEmail(context: EmailContext): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const config = regionalEmailConfig[context.region] || regionalEmailConfig.america
    const { user } = context

    const emailData: EmailData = {
      to: user.email,
      from: `${config.fromName} <${config.fromEmail}>`,
      subject: `Welcome to DaytaTech!`,
      templateName: "Daytatech_Welcome_Email", // uses your saved template
    }

    const result = await sendEmail(emailData)

    // Log email activity
    await this.logEmailActivity({
      type: "welcome",
      region: context.region,
      userId: user.email,
      status: result.success ? "sent" : "failed",
      metadata: {
        template: "Daytatech_Welcome_Email",
        region: context.region,
      },
    })

    return result
  } catch (error) {
    console.error("Welcome email error:", error)
    return { success: false, error: "Failed to send welcome email" }
  }
}
