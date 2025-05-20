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
})

export type ContactFormData = z.infer<typeof formSchema>

export async function sendContactEmail(formData: ContactFormData) {
  try {
    // Validate form data
    const validatedData = formSchema.parse(formData)

    // Format the email content
    const emailText = `
New Sales Inquiry from ${validatedData.name}

Contact Information:
-------------------
Name: ${validatedData.name}
Email: ${validatedData.email}
Company: ${validatedData.company || "Not provided"}
Phone: ${validatedData.phone || "Not provided"}

Inquiry Details:
--------------
${validatedData.description}

Requested Meeting:
----------------
Date: ${validatedData.date}
Time: ${validatedData.timeSlot}
    `

    // Format HTML version
    const emailHtml = `
<h2>New Sales Inquiry from ${validatedData.name}</h2>

<h3>Contact Information:</h3>
<ul>
  <li><strong>Name:</strong> ${validatedData.name}</li>
  <li><strong>Email:</strong> ${validatedData.email}</li>
  <li><strong>Company:</strong> ${validatedData.company || "Not provided"}</li>
  <li><strong>Phone:</strong> ${validatedData.phone || "Not provided"}</li>
</ul>

<h3>Inquiry Details:</h3>
<p>${validatedData.description}</p>

<h3>Requested Meeting:</h3>
<p>
  <strong>Date:</strong> ${validatedData.date}<br>
  <strong>Time:</strong> ${validatedData.timeSlot}
</p>
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
