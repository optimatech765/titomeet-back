import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { toDataURL } from 'qrcode';
interface TicketInfo {
  eventName: string;
  location: string;
  startDate: Date;
  endDate: Date;
  ticketCode: string;
  ticketType: string;
  userEmail: string;
}

export const getEventUrl = (eventId: string) => {
  return `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`;
};

interface TicketInfo {
  eventName: string;
  location: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  ticketCode: string;
  ticketType: string;
  userEmail: string;
  url: string;
  price?: string;
  organizerName?: string;
  isFree?: boolean;
}

export async function generateTicketPDF(ticket: TicketInfo): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  // Horizontal ticket size (8" x 3.5")
  const page = pdfDoc.addPage([576, 252]); // 8x3.5 inches in points (72ppi)
  const { width, height } = page.getSize();

  // Load fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Color scheme
  const black = rgb(0, 0, 0);
  const white = rgb(1, 1, 1);
  const accentColor = rgb(0.9, 0.1, 0.1); // Bright red

  try {
    // Generate QR Code
    const qrDataUrl = await toDataURL(ticket.url, {
      margin: 1,
      width: 150,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
    const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    // Layout constants
    const margin = 20;
    const qrSize = height - margin * 2;
    const leftSectionWidth = width - qrSize - margin * 2;

    // White background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: white,
    });

    // Left section (event info)
    const leftX = margin;
    let currentY = height - margin;

    // Event title
    const eventTitle = ticket.eventName.toUpperCase();
    page.drawText(eventTitle, {
      x: leftX,
      y: currentY,
      size: 24,
      font: boldFont,
      color: black,
    });
    currentY -= 30;

    // Date
    const dateStr = ticket.startDate.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).replace(/,/g, '');

    page.drawText(dateStr, {
      x: leftX,
      y: currentY,
      size: 16,
      font: boldFont,
      color: black,
    });
    currentY -= 25;

    // Time
    const timeStr = `${ticket.startTime} - ${ticket.endTime}`;
    page.drawText(timeStr, {
      x: leftX,
      y: currentY,
      size: 16,
      font: regularFont,
      color: black,
    });
    currentY -= 30;

    // Address label
    page.drawText('ADDRESS:', {
      x: leftX,
      y: currentY,
      size: 12,
      font: boldFont,
      color: black,
    });
    currentY -= 20;

    // Location
    page.drawText(ticket.location, {
      x: leftX,
      y: currentY,
      size: 14,
      font: regularFont,
      color: black,
    });
    currentY -= 40;

    // Price/Free indicator
    const priceText = ticket.isFree ? 'GRATUIT' : (ticket.price || '');
    if (priceText) {
      const priceWidth = boldFont.widthOfTextAtSize(priceText, 20);
      page.drawText(priceText, {
        x: leftX,
        y: currentY,
        size: 20,
        font: boldFont,
        color: accentColor,
      });
      currentY -= 30;
    }

    // Ticket number
    page.drawText(`TICKET NUMBER: ${ticket.ticketCode}`, {
      x: leftX,
      y: margin + 20,
      size: 12,
      font: regularFont,
      color: black,
    });

    // Right section (QR code)
    const qrX = width - qrSize - margin;
    const qrY = margin;

    // QR code with border
    page.drawRectangle({
      x: qrX - 5,
      y: qrY - 5,
      width: qrSize + 10,
      height: qrSize + 10,
      color: white,
      borderColor: black,
      borderWidth: 2,
    });

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // Border around entire ticket
    page.drawRectangle({
      x: 5,
      y: 5,
      width: width - 10,
      height: height - 10,
      borderColor: black,
      borderWidth: 1,
    });

    // Red accent bar at bottom
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 8,
      color: accentColor,
    });

    const pdfBytes = await pdfDoc.save();
    writeFileSync(join(process.cwd(), 'public', 'ticket3.pdf'), pdfBytes);
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating PDF ticket:', error);
    throw error;
  }
}

// Optional: Function to validate ticket data
export function validateTicketData(ticket: TicketInfo): boolean {
  const required = [
    'eventName',
    'location',
    'startDate',
    'startTime',
    'ticketCode',
    'ticketType',
    'userEmail',
    'url',
  ];
  return required.every((field) => ticket[field as keyof TicketInfo]);
}

// Optional: Function to format ticket for different languages
export function formatTicketText(
  text: string,
  locale: string = 'fr-FR',
): string {
  const translations: Record<string, Record<string, string>> = {
    'fr-FR': {
      event: 'ÉVÉNEMENT',
      location: 'LIEU',
      datetime: 'DATE ET HEURE',
      price: 'PRIX',
      scan: 'SCANNER POUR',
      verification: 'VÉRIFICATION',
      holder: 'TITULAIRE',
      organized_by: 'Organisé par',
    },
    'en-US': {
      event: 'EVENT',
      location: 'LOCATION',
      datetime: 'DATE & TIME',
      price: 'PRICE',
      scan: 'SCAN FOR',
      verification: 'VERIFICATION',
      holder: 'HOLDER',
      organized_by: 'Organized by',
    },
  };

  return translations[locale]?.[text] || text;
}
