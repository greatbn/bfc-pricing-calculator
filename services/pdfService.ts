import type { EstimateItem } from '../types';

declare const jspdf: any;

export function exportEstimateToPDF(
  items: EstimateItem[], 
  subtotal: number, 
  vat: number, 
  grandTotal: number,
  billingCycle: number,
  lang: 'en' | 'vi',
  t: (key: string, options?: Record<string, string | number>) => string,
  discountPercent: number,
  discountAmount: number
): void {
  if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
    console.error("jsPDF is not loaded. Please check the script tags in your HTML.");
    alert("Could not generate PDF. A required library is missing.");
    return;
  }
  
  const doc = new jspdf.jsPDF();
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  
  const getCycleLabel = (cycle: number) => {
    if (cycle === 1) return t('summary.monthly');
    return t('summary.months_cycle', { count: cycle });
  }

  doc.setFont('helvetica');

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.header_title'), 20, 20);
  
  doc.setFontSize(18);
  if (billingCycle === 1) {
    doc.text(t('pdf.header_subtitle'), 20, 30);
  } else {
    doc.text(t('pdf.header_subtitle_cycle', { duration: getCycleLabel(billingCycle) }), 20, 30);
  }
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const today = new Date();
  const locale = lang === 'vi' ? 'vi-VN' : 'en-US';
  const dateString = today.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
  doc.text(t('pdf.date', { date: dateString }), 20, 40);
  
  // Table
  const tableColumn = [
    t('pdf.col_service'), 
    t('pdf.col_description'), 
    t('pdf.col_quantity'), 
    t('pdf.col_unit_price'), 
    t('pdf.col_total_price')
  ];
  const tableRows: (string | number)[][] = [];
  const numberLocale = lang === 'vi' ? 'vi-VN' : 'en-US';


  items.forEach(item => {
    const itemData = [
      item.service,
      item.description,
      item.quantity,
      item.price.toLocaleString(numberLocale),
      (item.price * item.quantity * billingCycle).toLocaleString(numberLocale),
    ];
    tableRows.push(itemData);
  });

  (doc as any).autoTable({
    startY: 60,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold'
    },
    styles: {
        cellPadding: 3,
        fontSize: 9,
    },
    columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 15, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY;

  // Totals
  const totalsXLabel = pageWidth - 60;
  const totalsXValue = pageWidth - 20;
  let totalsYStart = finalY + 10;
  const lineSpacing = 7;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  doc.text(t('pdf.subtotal'), totalsXLabel, totalsYStart, { align: 'right' });
  doc.text(`${subtotal.toLocaleString(numberLocale)} VN`, totalsXValue, totalsYStart, { align: 'right' });
  totalsYStart += lineSpacing;
  
  doc.text(t('pdf.vat'), totalsXLabel, totalsYStart, { align: 'right' });
  doc.text(`${vat.toLocaleString(numberLocale)} VN`, totalsXValue, totalsYStart, { align: 'right' });
  totalsYStart += lineSpacing;

  if (discountPercent > 0) {
    doc.setTextColor(0, 150, 0); // Green color for discount
    doc.text(t('pdf.discount', { percent: discountPercent }), totalsXLabel, totalsYStart, { align: 'right' });
    doc.text(`- ${discountAmount.toLocaleString(numberLocale)} VN`, totalsXValue, totalsYStart, { align: 'right' });
    doc.setTextColor(0, 0, 0); // Reset color
    totalsYStart += lineSpacing;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const grandTotalLabel = billingCycle === 1 ? t('pdf.grand_total') : t('summary.total_cycle', { duration: getCycleLabel(billingCycle) });
  doc.text(grandTotalLabel, totalsXLabel, totalsYStart, { align: 'right' });
  doc.text(`${grandTotal.toLocaleString(numberLocale)} VN`, totalsXValue, totalsYStart, { align: 'right' });


  doc.save('Bizfly_Cloud_Cost_Estimate.pdf');
}