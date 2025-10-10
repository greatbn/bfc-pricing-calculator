import type { EstimateItem } from '../types';

declare global {
  interface Window {
    jspdf: any;
  }
}

export const exportEstimateToPDF = (items: EstimateItem[], total: number, vat: number, grandTotal: number, aiSummary: string) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Bizfly Cloud", 14, 22);
  doc.setFontSize(16);
  doc.text("Cost Estimate", 14, 30);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 14, 38);

  // AI Summary
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Solution Overview", 14, 50);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(aiSummary, 180);
  doc.text(summaryLines, 14, 56);
  
  const tableStartY = 56 + (summaryLines.length * 5) + 5;

  // Table
  const tableColumn = ["Service", "Description", "Quantity", "Unit Price (VNĐ/Month)", "Total Price (VNĐ/Month)"];
  const tableRows: (string | number)[][] = [];

  items.forEach(item => {
    const row = [
      item.service,
      item.description,
      item.quantity,
      item.price.toLocaleString('vi-VN'),
      (item.price * item.quantity).toLocaleString('vi-VN')
    ];
    tableRows.push(row);
  });

  doc.autoTable({
    startY: tableStartY,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [29, 78, 216] }
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 20;
  const rightAlignX = doc.internal.pageSize.getWidth() - 14;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  
  doc.text("Subtotal:", 140, finalY + 10, { align: 'right' });
  doc.text(`${total.toLocaleString('vi-VN')} VNĐ`, rightAlignX, finalY + 10, { align: 'right' });

  doc.text("VAT (10%):", 140, finalY + 17, { align: 'right' });
  doc.text(`${vat.toLocaleString('vi-VN')} VNĐ`, rightAlignX, finalY + 17, { align: 'right' });

  doc.setFontSize(14);
  doc.text("Grand Total:", 140, finalY + 25, { align: 'right' });
  doc.text(`${grandTotal.toLocaleString('vi-VN')} VNĐ`, rightAlignX, finalY + 25, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.text("This is an estimate and prices are subject to change. All prices are in Vietnamese Dong (VNĐ).", 14, doc.internal.pageSize.getHeight() - 10);
  
  doc.save("Bizfly_Cloud_Estimate.pdf");
};