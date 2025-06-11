"use client"

import type React from "react"

import { useState, useRef } from "react"
import { CalendarIcon, Check, Loader2, MousePointerClick, Paperclip, X } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { sendContactEmail, type ContactFormData } from "@/actions/send-email"

export function ContactSalesForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    description: "",
    date: undefined as Date | undefined,
    timeSlot: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, date }))
  }

  const handleTimeSlotChange = (timeSlot: string) => {
    setFormData((prev) => ({ ...prev, timeSlot }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUploadClick = () => {
    // Trigger the hidden file input click event
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!formData.name || !formData.email || !formData.description || !formData.date || !formData.timeSlot) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    // Prepare comprehensive data for submission - include ALL fields
    const submissionData: ContactFormData = {
      name: formData.name,
      email: formData.email,
      company: formData.company || "Not provided", // Ensure empty fields show as "Not provided"
      phone: formData.phone || "Not provided",
      description: formData.description,
      date: formData.date ? format(formData.date, "yyyy-MM-dd") : "",
      timeSlot: formData.timeSlot,
      attachmentName: selectedFile ? selectedFile.name : undefined,
    }

    // Submit the form
    setIsSubmitting(true)
    try {
      // In a real implementation, you would upload the file here
      // For example, using FormData and fetch, or a specialized file upload library

      // For now, we'll just simulate the file upload
      if (selectedFile) {
        // Simulate file upload delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        console.log("File would be uploaded:", selectedFile.name, selectedFile.type, selectedFile.size)
      }

      const result = await sendContactEmail(submissionData)

      if (result.success) {
        toast({
          title: "Request submitted successfully!",
          description:
            "Your information has been sent to our sales team. They will contact you shortly to discuss your needs.",
        })
        onClose()
      } else {
        toast({
          title: "Submission failed",
          description: result.message || "There was an error submitting your request. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Submission error",
        description: "There was an unexpected error. Please try again later.",
        variant: "destructive",
      })
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const timeSlots = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
  ]

  return (
    <Card className="w-full max-w-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Contact Our Sales Team</CardTitle>
          <CardDescription>
            Fill out the form below to discuss your needs, and we'll get back to you shortly.
          </CardDescription>
          <div className="flex justify-center mt-2">
            <div className="animate-bounce bg-purple-100 p-2 rounded-full">
              <MousePointerClick className="h-4 w-4 text-purple-600" />
            </div>
            <span className="sr-only">Scroll down to see more</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input id="company" name="company" value={formData.company} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              How can we help you? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Attachment (Optional)</Label>
            <div className="mt-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
              />

              {selectedFile ? (
                <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <Paperclip className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadClick}
                  className="w-full flex items-center justify-center"
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, Word, Excel, PowerPoint, Text, CSV, ZIP (Max 10MB)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Schedule a Meeting <span className="text-red-500">*</span>
            </Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateChange}
                      initialFocus
                      disabled={(date) => {
                        // Disable past dates, weekends
                        const now = new Date()
                        now.setHours(0, 0, 0, 0)
                        return date < now || date.getDay() === 0 || date.getDay() === 6
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSlot">Preferred Time</Label>
                <Select value={formData.timeSlot} onValueChange={handleTimeSlotChange}>
                  <SelectTrigger id="timeSlot">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <div className="animate-bounce bg-purple-100 p-2 rounded-full">
              <MousePointerClick className="h-4 w-4 text-purple-600" />
            </div>
            <span className="sr-only">Scroll to continue</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
