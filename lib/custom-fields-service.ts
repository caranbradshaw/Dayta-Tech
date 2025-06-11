import { supabase } from "@/lib/supabase"

export interface CustomField {
  id: string
  field_type: "industry" | "role"
  field_value: string
  user_id: string
  usage_count: number
  first_used_at: string
  last_used_at: string
  created_at: string
  updated_at: string
}

export class CustomFieldsService {
  async recordCustomField(
    fieldType: "industry" | "role",
    fieldValue: string,
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Clean and validate the field value
      const cleanValue = fieldValue.trim().toLowerCase()

      if (!cleanValue || cleanValue.length < 2) {
        return { success: false, error: "Field value too short" }
      }

      // Use the simple function to record the field
      const { error } = await supabase.rpc("record_custom_field", {
        p_field_type: fieldType,
        p_field_value: cleanValue,
        p_user_id: userId,
      })

      if (error) {
        console.error("Error recording custom field:", error)
        // If function fails, try direct insert
        const { error: insertError } = await supabase.from("custom_fields").insert({
          field_type: fieldType,
          field_value: cleanValue,
          user_id: userId,
        })

        if (insertError) {
          console.error("Error with direct insert:", insertError)
          return { success: false, error: insertError.message }
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Error in recordCustomField:", error)
      return { success: false, error: "Failed to record custom field" }
    }
  }

  async getPopularCustomFields(
    fieldType: "industry" | "role",
    limit = 10,
  ): Promise<{ success: boolean; data?: string[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("custom_fields")
        .select("field_value, usage_count")
        .eq("field_type", fieldType)
        .order("usage_count", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching popular custom fields:", error)
        return { success: false, error: error.message }
      }

      const popularFields = data?.map((item) => item.field_value) || []
      return { success: true, data: popularFields }
    } catch (error) {
      console.error("Error in getPopularCustomFields:", error)
      return { success: false, error: "Failed to fetch popular custom fields" }
    }
  }

  async getAllCustomFieldsForAI(): Promise<{ success: boolean; data?: CustomField[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .order("usage_count", { ascending: false })

      if (error) {
        console.error("Error fetching all custom fields:", error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error("Error in getAllCustomFieldsForAI:", error)
      return { success: false, error: "Failed to fetch custom fields for AI" }
    }
  }
}

export const customFieldsService = new CustomFieldsService()
