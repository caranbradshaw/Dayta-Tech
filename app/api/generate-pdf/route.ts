
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generatePDFBuffer } from '@/lib/pdfBuilder'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { file_name, content, user_id } = body

    if (!file_name || !content || !user_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const pdfBuffer = await generatePDFBuffer({ file_name, content })

    const pdfPath = `analyses/${user_id}/${file_name}-${Date.now()}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('daytatech-pdfs')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError)
      return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 })
    }

    const publicUrl = supabase.storage.from('daytatech-pdfs').getPublicUrl(pdfPath).data.publicUrl
    const { error: insertError } = await supabase.from('analyses').insert({
      user_id,
      file_name,
      content,
      pdf_url: publicUrl,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Error saving analysis:', insertError)
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Saved successfully', pdf_url: publicUrl }, { status: 200 })
  } catch (err) {
    console.error('Unhandled error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
