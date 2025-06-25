import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

export async function generatePDFBuffer(analysis: { file_name: string; content: string }) {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const content = analysis.content || 'No content provided.'

  const pages: any[] = []
  let page = pdfDoc.addPage([600, 800])
  pages.push(page)
  let { width, height } = page.getSize()

  const margin = 50
  const lineHeight = 14
  const maxLineWidth = width - margin * 2
  const textSize = 12
  let y = height - margin

  // Add document metadata
  pdfDoc.setTitle("DaytaTech AI Analysis")
  pdfDoc.setAuthor("DaytaTech.ai")
  pdfDoc.setSubject("Automated business data insight")

  // Draw header on first page
  page.drawText(`DaytaTech Analysis`, {
    x: margin,
    y,
    size: 20,
    font,
    color: rgb(0, 0.49, 0.77),
  })

  y -= lineHeight * 2
  page.drawText(`File Name: ${analysis.file_name}`, { x: margin, y, size: 14, font })
  y -= lineHeight * 1.5
  page.drawText(`Generated: ${new Date().toLocaleString()}`, { x: margin, y, size: 12, font })

  // Horizontal blue divider line
  y -= lineHeight
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0, 0.49, 0.77),
  })
  y -= lineHeight * 1.5

  // Watermark configuration
  const watermarkText = "Confidential - DaytaTech.ai"
  const watermarkFontSize = 40
  const watermarkColor = rgb(0.8, 0.8, 0.8)

  // Wrap content across pages
  const words = content.split(' ')
  let line = ''

  const drawLine = (text: string) => {
    if (y < margin + lineHeight + 60) {
      page = pdfDoc.addPage([600, 800])
      pages.push(page)
      y = height - margin
      page.drawText('(continued)', { x: margin, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) })
      y -= lineHeight
    }
    page.drawText(text, { x: margin, y, size: textSize, font })
    y -= lineHeight
  }

  for (const word of words) {
    const testLine = `${line} ${word}`.trim()
    const width = font.widthOfTextAtSize(testLine, textSize)
    if (width < maxLineWidth) {
      line = testLine
    } else {
      drawLine(line)
      line = word
    }
  }
  if (line) drawLine(line)

  // Apply watermark and page numbers to all pages
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i]
    p.drawText(watermarkText, {
      x: 150,
      y: 400,
      size: watermarkFontSize,
      font,
      color: watermarkColor,
      rotate: { type: 'degrees', angle: 45 },
      opacity: 0.1,
    })

    p.drawText(`Page ${i + 1} of ${pages.length}`, {
      x: width / 2 - 30,
      y: 10,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })

    // Logo placement
    const logoPath = path.resolve(process.cwd(), 'public/assets/logo-daytatech.png')
    if (fs.existsSync(logoPath)) {
      const imageBytes = fs.readFileSync(logoPath)
      const pngImage = await pdfDoc.embedPng(imageBytes)
      const pngDims = pngImage.scale(0.25)
      const bottomMargin = 20
      p.drawImage(pngImage, {
        x: width - pngDims.width - margin,
        y: bottomMargin,
        width: pngDims.width,
        height: pngDims.height,
      })
    }

    p.drawText("www.daytatech.ai | support@daytatech.ai", {
      x: margin,
      y: 20,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2),
    })
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
