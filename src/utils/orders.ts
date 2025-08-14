import { existsSync, readFileSync, writeFileSync } from 'fs';
import path, { join } from 'path';
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
  return `${process.env.FRONTEND_URL}/events/${eventId}`;
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
  orderId: string;
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
  const gray = rgb(0.3, 0.3, 0.3);
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
    const qrSize = 150; //height - margin * 2;
    const logoWidth = 100;
    const logoHeight = 40;

    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoImage = await pdfDoc.embedPng(readFileSync(logoPath));

    const TICKET_NAME = `ticket-${new Date().getTime()}.pdf`;

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

    page.drawImage(logoImage, {
      x: margin,
      y: 210,
      width: logoWidth,
      height: logoHeight,
    });

    currentY -= logoHeight;

    // Event title
    const eventTitle = ticket.eventName.toUpperCase();
    page.drawText(eventTitle, {
      x: leftX,
      y: currentY,
      size: 14,
      font: boldFont,
      color: black,
    });

    currentY -= 30;

    // Address label
    page.drawText('ADRESSE:', {
      x: leftX,
      y: currentY,
      size: 8,
      font: boldFont,
      color: gray,
    });

    currentY -= 15;

    // Location
    page.drawText(ticket.location, {
      x: leftX,
      y: currentY,
      size: 12,
      font: regularFont,
      color: black,
    });

    currentY -= 30;

    // Address label
    page.drawText('DATE ET HEURE:', {
      x: leftX,
      y: currentY,
      size: 8,
      font: boldFont,
      color: gray,
    });

    currentY -= 15;

    // Date
    const dateStr = ticket.startDate
      .toLocaleString('fr-FR', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      .replace(/,/g, '');

    const formattedStartDate = dateStr + ' à ' + ticket.startTime;

    page.drawText(formattedStartDate, {
      x: leftX,
      y: currentY,
      size: 14,
      font: boldFont,
      color: black,
    });

    currentY -= 15;

    //
    const isManyDays = ticket.startDate.getDate() !== ticket.endDate.getDate();
    if (isManyDays) {
      page.drawText('AU', {
        x: leftX,
        y: currentY,
        size: 8,
        font: boldFont,
        color: gray,
      });

      currentY -= 15;

      const endStr = ticket.endDate
        .toLocaleString('fr-FR', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        .replace(/,/g, '');

      const formattedEndDate = endStr + ' à ' + ticket.endTime;

      page.drawText(formattedEndDate, {
        x: leftX,
        y: currentY,
        size: 14,
        font: boldFont,
        color: black,
      });
    }

    currentY -= 40;

    // Price/Free indicator
    const priceText = ticket.isFree ? 'GRATUIT' : ticket.price || '';
    if (priceText) {
      page.drawText(priceText, {
        x: leftX,
        y: currentY,
        size: 20,
        font: boldFont,
        color: accentColor,
      });
      //currentY -= 30;
    }

    // Right section (QR code)
    const qrX = width - qrSize - margin;
    let qrY = height - qrSize - margin;
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

    qrY -= 30;

    const orderIdText = `#${ticket.orderId}`;
    const orderIdTextWidth = regularFont.widthOfTextAtSize(orderIdText, 12);

    page.drawText(orderIdText, {
      x: qrX + (qrSize / 2 - orderIdTextWidth / 2),
      y: qrY,
      size: 12,
      font: regularFont,
      color: black,
    });

    qrY -= 20;

    //seat number
    const seatNumberText = `1 PLACE`;
    const seatNumberTextWidth = regularFont.widthOfTextAtSize(
      seatNumberText,
      12,
    );

    page.drawText(seatNumberText, {
      x: qrX + (qrSize / 2 - seatNumberTextWidth / 2),
      y: qrY,
      size: 12,
      font: regularFont,
      color: black,
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
    writeFileSync(join(process.cwd(), 'public', TICKET_NAME), pdfBytes);
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
