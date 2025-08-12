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
}

export async function generateTicketPDF(ticket: TicketInfo): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([700, 300]); // Increased size for better layout
  const { width, height } = page.getSize();

  // Load fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const lightFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Colors
  const primaryColor = rgb(0.2, 0.4, 0.8); // Blue
  const secondaryColor = rgb(0.3, 0.3, 0.3); // Dark gray
  const lightGray = rgb(0.9, 0.9, 0.9);
  const white = rgb(1, 1, 1);
  const accentColor = rgb(0.8, 0.2, 0.4); // Red accent

  try {
    // Load and embed logo
    let logoImage;

    try {
      const jpgUrl = 'https://titomeet.vercel.app/_next/image?url=%2Fimg%2Flogo.png&w=48&q=75';
      const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer())

      logoImage = await pdfDoc.embedJpg(jpgImageBytes)
    } catch (logoError) {
      console.warn('Logo file not found or invalid, skipping logo');
    }

    // Generate QR Code with better options
    const qrDataUrl = await toDataURL(ticket.url, {
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    // Layout constants
    const margin = 30;
    const qrSize = 120;
    const logoSize = 40;
    const contentWidth = width - qrSize - margin * 3;

    // Background with gradient effect (simulated with rectangles)
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: white,
    });

    // Header background
    page.drawRectangle({
      x: 0,
      y: height - 80,
      width,
      height: 80,
      color: primaryColor,
    });

    // Accent stripe
    page.drawRectangle({
      x: 0,
      y: height - 85,
      width,
      height: 5,
      color: accentColor,
    });

    // Main content background
    page.drawRectangle({
      x: margin,
      y: margin,
      width: contentWidth,
      height: height - 120,
      color: lightGray,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    // QR Code background
    page.drawRectangle({
      x: width - qrSize - margin,
      y: height - qrSize - margin - 20,
      width: qrSize,
      height: qrSize + 60,
      color: white,
      borderColor: primaryColor,
      borderWidth: 2,
    });

    // Draw logo in header (if available)
    if (logoImage) {
      page.drawImage(logoImage, {
        x: margin,
        y: height - logoSize - 20,
        width: logoSize,
        height: logoSize,
      });
    }

    // App name/title in header
    page.drawText('TITOMEET', {
      // Replace with your app name
      x: logoImage ? margin + logoSize + 15 : margin,
      y: height - 35,
      size: 16,
      font: boldFont,
      color: white,
    });

    // Ticket type badge
    const badgeWidth = 80;
    page.drawRectangle({
      x: width - badgeWidth - margin - 10,
      y: height - 50,
      width: badgeWidth,
      height: 25,
      color: accentColor,
    });

    page.drawText(ticket.ticketType.toUpperCase(), {
      x: width - badgeWidth - margin - 5,
      y: height - 42,
      size: 10,
      font: boldFont,
      color: white,
    });

    // Event title
    page.drawText('ÉVÉNEMENT', {
      x: margin + 15,
      y: height - 110,
      size: 10,
      font: regularFont,
      color: secondaryColor,
    });

    // Split long event names
    const eventName = ticket.eventName.toUpperCase();
    const maxEventNameLength = 40;
    const eventLines =
      eventName.length > maxEventNameLength
        ? [
          eventName.substring(0, maxEventNameLength),
          eventName.substring(maxEventNameLength),
        ]
        : [eventName];

    eventLines.forEach((line, index) => {
      page.drawText(line, {
        x: margin + 15,
        y: height - 125 - index * 15,
        size: 18,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
    });

    // Location section
    const locationY = height - 170;
    page.drawText('📍 LIEU', {
      x: margin + 15,
      y: locationY,
      size: 10,
      font: regularFont,
      color: secondaryColor,
    });

    page.drawText(ticket.location, {
      x: margin + 15,
      y: locationY - 15,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Date and time section
    const dateY = locationY - 45;
    page.drawText('🗓️ DATE ET HEURE', {
      x: margin + 15,
      y: dateY,
      size: 10,
      font: regularFont,
      color: secondaryColor,
    });

    const startDateStr = ticket.startDate.toLocaleString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    page.drawText(`${startDateStr} à ${ticket.startTime}`, {
      x: margin + 15,
      y: dateY - 15,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    if (ticket.startDate.toDateString() !== ticket.endDate.toDateString()) {
      const endDateStr = ticket.endDate.toLocaleString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      page.drawText(`au ${endDateStr} à ${ticket.endTime}`, {
        x: margin + 15,
        y: dateY - 30,
        size: 12,
        font: regularFont,
        color: secondaryColor,
      });
    }

    // Price (if available)
    if (ticket.price) {
      page.drawText('💰 PRIX', {
        x: margin + 15,
        y: dateY - 60,
        size: 10,
        font: regularFont,
        color: secondaryColor,
      });

      page.drawText(ticket.price, {
        x: margin + 15,
        y: dateY - 75,
        size: 16,
        font: boldFont,
        color: accentColor,
      });
    }

    // Draw QR Code
    page.drawImage(qrImage, {
      x: width - qrSize - margin + 10,
      y: height - qrSize - margin - 10,
      width: qrSize - 20,
      height: qrSize - 20,
    });

    // QR Code label
    page.drawText('SCANNER POUR', {
      x: width - qrSize - margin + 15,
      y: height - qrSize - margin - 25,
      size: 8,
      font: regularFont,
      color: secondaryColor,
    });

    page.drawText('VÉRIFICATION', {
      x: width - qrSize - margin + 15,
      y: height - qrSize - margin - 35,
      size: 8,
      font: regularFont,
      color: secondaryColor,
    });

    // Ticket code
    page.drawRectangle({
      x: width - qrSize - margin,
      y: 60,
      width: qrSize,
      height: 25,
      color: rgb(0, 0, 0),
    });

    page.drawText(`#${ticket.ticketCode}`, {
      x: width - qrSize - margin + 10,
      y: 68,
      size: 12,
      font: boldFont,
      color: white,
    });

    // User information
    page.drawText('TITULAIRE', {
      x: width - qrSize - margin,
      y: 45,
      size: 8,
      font: regularFont,
      color: secondaryColor,
    });

    page.drawText(ticket.userEmail.toLowerCase(), {
      x: width - qrSize - margin,
      y: 32,
      size: 9,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Footer with organizer info (if available)
    if (ticket.organizerName) {
      page.drawText(`Organisé par: ${ticket.organizerName}`, {
        x: margin,
        y: 15,
        size: 8,
        font: lightFont,
        color: secondaryColor,
      });
    }

    // Decorative elements
    // Corner decorations
    const cornerSize = 20;
    // Top-left corner
    page.drawRectangle({
      x: margin,
      y: height - 100,
      width: cornerSize,
      height: 3,
      color: accentColor,
    });
    page.drawRectangle({
      x: margin,
      y: height - 100,
      width: 3,
      height: cornerSize,
      color: accentColor,
    });

    // Bottom-right corner
    page.drawRectangle({
      x: contentWidth + margin - cornerSize,
      y: margin + 17,
      width: cornerSize,
      height: 3,
      color: accentColor,
    });
    page.drawRectangle({
      x: contentWidth + margin - 3,
      y: margin,
      width: 3,
      height: cornerSize,
      color: accentColor,
    });

    const pdfBytes = await pdfDoc.save();
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
