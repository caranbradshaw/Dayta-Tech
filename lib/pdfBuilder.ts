
import { PDFDocument, rgb } from 'pdf-lib'

export async function generatePDFBuffer(analysis: any) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([600, 400])
  const { width, height } = page.getSize()

  page.drawText(`DaytaTech Analysis`, { x: 50, y: height - 50, size: 20, color: rgb(0, 0, 0.7) })
  page.drawText(`File Name: ${analysis.file_name}`, { x: 50, y: height - 80, size: 14 })
  page.drawText(`Generated: ${new Date().toLocaleString()}`, { x: 50, y: height - 100, size: 12 })

  const content = analysis.content || 'No content provided.'
  page.drawText(content.slice(0, 1000), { x: 50, y: height - 140, size: 10 })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
