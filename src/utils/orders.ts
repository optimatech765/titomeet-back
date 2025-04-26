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
  ticketCode: string;
  ticketType: string;
  userEmail: string;
}

export async function generateTicketPDF(ticket: TicketInfo): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 250]); // Adjusted to match the ticket layout

  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const smallFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Generate QR Code
  const qrDataUrl = await toDataURL(ticket.ticketCode, { margin: 0 });
  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  const qrWidth = 100;
  const qrHeight = 100;

  // Draw a light gray background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.95, 0.95, 0.95),
  });

  // Event Title
  page.drawText('Evènement', {
    x: 40,
    y: height - 50,
    size: 10,
    font: smallFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  page.drawText(ticket.eventName.toUpperCase(), {
    x: 40,
    y: height - 65,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });

  // Location
  page.drawText('Adresse', {
    x: 40,
    y: height - 90,
    size: 10,
    font: smallFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  page.drawText(ticket.location, {
    x: 40,
    y: height - 105,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });

  // Dates
  page.drawText('Date et heure', {
    x: 40,
    y: height - 130,
    size: 10,
    font: smallFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  const startDateStr = `${ticket.startDate.toLocaleString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })} AT ${ticket.startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  const endDateStr = `${ticket.endDate.toLocaleString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })} AT ${ticket.endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

  page.drawText(startDateStr, {
    x: 40,
    y: height - 145,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  page.drawText('TO', {
    x: 40,
    y: height - 165,
    size: 10,
    font: smallFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  page.drawText(endDateStr, {
    x: 40,
    y: height - 180,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });

  // Draw QR Code
  page.drawImage(qrImage, {
    x: width - qrWidth - 40,
    y: height / 2 - qrHeight / 2 + 20,
    width: qrWidth,
    height: qrHeight,
  });

  // Ticket Code under QR
  page.drawText(`#${ticket.ticketCode}`, {
    x: width - qrWidth - 40,
    y: height / 2 - qrHeight / 2,
    size: 10,
    font: smallFont,
    color: rgb(0, 0, 0),
  });

  // Ticket Type
  page.drawText(ticket.ticketType, {
    x: width - qrWidth - 40,
    y: 50,
    size: 10,
    font: smallFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // User Email
  page.drawText(ticket.userEmail.toUpperCase(), {
    x: width - qrWidth - 40,
    y: 35,
    size: 10,
    font: smallFont,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
