"use server"

import { z } from "zod"
import { sendEmail } from "@/lib/email-service"

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  attachmentName: z.string().optional(),
})

export type ContactFormData = z.infer<typeof formSchema>

export async function sendContactEmail(formData: ContactFormData) {
  try {
    // Validate form data
    const validatedData = formSchema.parse(formData)

    // Format the email content with all field values
    const emailText = `
New Sales Inquiry from ${validatedData.name}

CONTACT INFORMATION:
===================
Full Name: ${validatedData.name}
Email Address: ${validatedData.email}
Company: ${validatedData.company || "Not provided"}
Phone Number: ${validatedData.phone || "Not provided"}

INQUIRY DETAILS:
===============
Description: ${validatedData.description}

MEETING REQUEST:
===============
Preferred Date: ${validatedData.date}
Preferred Time: ${validatedData.timeSlot}

ADDITIONAL INFORMATION:
======================
${validatedData.attachmentName ? `File Attachment: ${validatedData.attachmentName} (user has file ready to share)` : "No file attachment provided"}

NEXT STEPS:
==========
- Follow up within 24 hours
- Schedule meeting for requested date/time
- ${validatedData.attachmentName ? "Request file attachment via email" : "No file follow-up needed"}
- Prepare demo based on company size and industry

This inquiry was submitted through the DaytaTech.ai contact form.
`

    // Format HTML version with better styling
    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
    New Sales Inquiry from ${validatedData.name}
  </h2>

  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af; margin-top: 0;">Contact Information</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 5px 0; font-weight: bold;">Full Name:</td><td style="padding: 5px 0;">${validatedData.name}</td></tr>
      <tr><td style="padding: 5px 0; font-weight: bold;">Email:</td><td style="padding: 5px 0;"><a href="mailto:${validatedData.email}">${validatedData.email}</a></td></tr>
      <tr><td style="padding: 5px 0; font-weight: bold;">Company:</td><td style="padding: 5px 0;">${validatedData.company || "Not provided"}</td></tr>
      <tr><td style="padding: 5px 0; font-weight: bold;">Phone:</td><td style="padding: 5px 0;">${validatedData.phone || "Not provided"}</td></tr>
    </table>
  </div>

  <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af; margin-top: 0;">Inquiry Details</h3>
    <p style="line-height: 1.6;">${validatedData.description}</p>
  </div>

  <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af; margin-top: 0;">Meeting Request</h3>
    <p><strong>Preferred Date:</strong> ${validatedData.date}</p>
    <p><strong>Preferred Time:</strong> ${validatedData.timeSlot}</p>
  </div>

  ${
    validatedData.attachmentName
      ? `
  <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af; margin-top: 0;">File Attachment</h3>
    <p><strong>File:</strong> ${validatedData.attachmentName}</p>
    <p><em>Note: Follow up with customer to receive the file attachment.</em></p>
  </div>
  `
      : `
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><em>No file attachment provided.</em></p>
  </div>
  `
  }

  <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af; margin-top: 0;">Next Steps</h3>
    <ul style="line-height: 1.6;">
      <li>Follow up within 24 hours</li>
      <li>Schedule meeting for ${validatedData.date} at ${validatedData.timeSlot}</li>
      ${validatedData.attachmentName ? "<li>Request file attachment via email</li>" : "<li>No file follow-up needed</li>"}
      <li>Prepare demo based on company size and industry</li>
    </ul>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="color: #6b7280; font-size: 14px; text-align: center;">
    This inquiry was submitted through the DaytaTech.ai contact form.
  </p>
</div>
`

    // Send the email
    const result = await sendEmail({
      to: "caran@daytatech.ai",
      from: "noreply@daytatech.ai",
      subject: `New Sales Inquiry from ${validatedData.name}`,
      text: emailText,
      html: emailHtml,
    })

    if (result.success) {
      return { success: true, message: "Email sent successfully" }
    } else {
      return { success: false, message: result.message || "Failed to send email" }
    }
  } catch (error) {
    console.error("Error sending email:", error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation error",
        errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
      }
    }
    return { success: false, message: "Failed to send email" }
  }
}
