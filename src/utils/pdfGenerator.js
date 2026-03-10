import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FUNCTION_LABELS = {
  ear_ceremony: 'Ear Ceremony (Karnavedha)',
  marriage: 'Marriage / Wedding',
  birthday_party: 'Birthday Party'
};

export function generateBookingPDF(booking) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Background cream
  doc.setFillColor(253, 248, 238);
  doc.rect(0, 0, pageWidth, 297, 'F');

  // Gold top border
  doc.setFillColor(201, 168, 76);
  doc.rect(0, 0, pageWidth, 8, 'F');
  doc.rect(0, 289, pageWidth, 8, 'F');

  // Red accent
  doc.setFillColor(139, 26, 26);
  doc.rect(0, 8, pageWidth, 3, 'F');
  doc.rect(0, 286, pageWidth, 3, 'F');

  // Hall Name Header
  doc.setTextColor(139, 26, 26);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SRI RATHNA MARRIAGE HALL', pageWidth / 2, 30, { align: 'center' });

  doc.setTextColor(201, 168, 76);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('✦ Auspicious Celebrations ✦', pageWidth / 2, 38, { align: 'center' });

  // Divider
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.8);
  doc.line(15, 44, pageWidth - 15, 44);

  // Booking Confirmation Title
  doc.setFillColor(139, 26, 26);
  doc.roundedRect(15, 48, pageWidth - 30, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING CONFIRMATION RECEIPT', pageWidth / 2, 57, { align: 'center' });

  // Booking ID & Date
  doc.setTextColor(100, 60, 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Booking ID: ${booking.id}`, 15, 70);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth - 15, 70, { align: 'right' });

  // Customer Details Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(139, 26, 26);
  doc.text('CUSTOMER DETAILS', 15, 82);
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(15, 84, 80, 84);

  const customerData = [
    ['Customer Name', booking.customerName],
    ['Mobile Number', booking.mobile],
    ['Email Address', booking.email || 'N/A'],
    ['Address', booking.address || 'N/A'],
  ];

  doc.autoTable({
    startY: 87,
    body: customerData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3, textColor: [44, 24, 16] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [92, 61, 46] },
      1: { cellWidth: 120 }
    },
    margin: { left: 15, right: 15 },
  });

  // Function Details Section
  const afterCustomer = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(139, 26, 26);
  doc.text('FUNCTION DETAILS', 15, afterCustomer);
  doc.setDrawColor(201, 168, 76);
  doc.line(15, afterCustomer + 2, 80, afterCustomer + 2);

  const functionData = [
    ['Function Type', FUNCTION_LABELS[booking.functionType] || booking.functionType],
    ['Function Date', new Date(booking.functionDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
    ['Booking Status', 'CONFIRMED ✓'],
  ];

  doc.autoTable({
    startY: afterCustomer + 5,
    body: functionData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3, textColor: [44, 24, 16] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [92, 61, 46] },
      1: { cellWidth: 120 }
    },
    margin: { left: 15, right: 15 },
  });

  // Payment Summary - Highlighted Box
  const afterFunction = doc.lastAutoTable.finalY + 10;
  doc.setFillColor(253, 248, 238);
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(1);
  doc.roundedRect(15, afterFunction, pageWidth - 30, 60, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(139, 26, 26);
  doc.text('PAYMENT SUMMARY', pageWidth / 2, afterFunction + 10, { align: 'center' });

  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.4);
  doc.line(40, afterFunction + 13, pageWidth - 40, afterFunction + 13);

  const paymentRows = [
    ['Total Rent Amount', `₹ ${Number(booking.totalAmount).toLocaleString('en-IN')}`],
    ['Advance Amount Paid', `₹ ${Number(booking.advanceAmount).toLocaleString('en-IN')}`],
    ['Remaining Balance', `₹ ${Number(booking.remainingAmount).toLocaleString('en-IN')}`],
  ];

  doc.autoTable({
    startY: afterFunction + 16,
    body: paymentRows,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 4, textColor: [44, 24, 16] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100, textColor: [92, 61, 46] },
      1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 25, right: 25 },
  });

  // Remaining amount emphasis
  const payY = doc.lastAutoTable.finalY + 2;
  doc.setFillColor(139, 26, 26);
  doc.roundedRect(25, payY, pageWidth - 50, 10, 2, 2, 'F');
  doc.setTextColor(201, 168, 76);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`PLEASE PAY ₹ ${Number(booking.remainingAmount).toLocaleString('en-IN')} ON THE DAY OF FUNCTION`, pageWidth / 2, payY + 7, { align: 'center' });

  // Payment Reference
  if (booking.paymentReference) {
    doc.setTextColor(100, 60, 40);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Reference: ${booking.paymentReference}`, pageWidth / 2, payY + 18, { align: 'center' });
  }

  // Footer
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(15, 268, pageWidth - 15, 268);

  doc.setTextColor(139, 26, 26);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for choosing Sri Rathna Marriage Hall!', pageWidth / 2, 274, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 60, 40);
  doc.setFontSize(8);
  doc.text('For enquiries: Contact Hall Management | This is a computer-generated receipt', pageWidth / 2, 280, { align: 'center' });

  // Watermark
  doc.setTextColor(201, 168, 76);
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.setGState(doc.GState({ opacity: 0.06 }));
  doc.text('SRI RATHNA', pageWidth / 2, 160, { align: 'center', angle: 35 });
  doc.setGState(doc.GState({ opacity: 1 }));

  return doc;
}

export function downloadBookingPDF(booking) {
  const doc = generateBookingPDF(booking);
  doc.save(`SriRathna_Booking_${booking.customerName.replace(/\s+/g, '_')}_${booking.functionDate}.pdf`);
}
