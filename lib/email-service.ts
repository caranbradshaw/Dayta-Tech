// This is a mock email service for demonstration purposes
// In a real application, you would use a service like SendGrid, Nodemailer, etc.

export interface EmailData {
  to: string
  from: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail(data: EmailData): Promise<{ success: boolean; message?: string }> {
  // In a real application, this would be an API call to an email service
  console.log("SENDING EMAIL:")
  console.log("To:", data.to)
  console.log("From:", data.from)
  console.log("Subject:", data.subject)
  console.log("Body:", data.text)

  // Simulate a successful API call
  await new Promise((resolve) => setTimeout(resolve, 800))

  // For demonstration, we'll always return success
  // In a real application, you would handle errors from the email service
  return { success: true }
}
