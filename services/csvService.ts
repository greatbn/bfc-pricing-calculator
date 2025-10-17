import type { EstimateItem } from '../types';

function escapeCsvCell(cell: string | number): string {
  const cellStr = String(cell);
  if (/[",\n\r]/.test(cellStr)) {
    return `"${cellStr.replace(/"/g, '""')}"`;
  }
  return cellStr;
}

function getRenderedDescription(
  item: EstimateItem, 
  t: (key: string, options?: Record<string, string | number>) => string
): string {
    const options = { ...item.descriptionOptions };

    switch (item.descriptionKey) {
        case 'cloud_server.desc':
        case 'cloud_server.desc_hours':
            options.billing = t(`cloud_server.${options.billing}`);
            break;
        
        case 'simple_storage.desc':
            options.type = t(`simple_storage.${options.type}`);
            options.billing = t(`simple_storage.${options.billing}`);
            break;
        
        case 'block_storage.desc':
        case 'block_storage.desc_hours':
            options.billing = t(`block_storage.${options.billing}`);
            options.tier = t(`block_storage.${options.tier}`);
            break;

        case 'snapshot.desc':
            options.tier = t(`block_storage.${options.tier}`);
            break;

        case 'kafka.desc':
        case 'kafka.desc_wan':
            options.tier = t(`kafka.${options.tier}`);
            break;
        
        default:
            break;
    }

    return t(item.descriptionKey, options);
}

export function exportEstimateToCSV(
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
  const headers = [
      t('csv.col_service'), 
      t('csv.col_description'), 
      t('csv.col_quantity'), 
      t('csv.col_unit_price'), 
      t('csv.col_total_price')
  ];
  const rows: string[][] = [];
  const numberLocale = lang === 'vi' ? 'vi-VN' : 'en-US';
  
  const getCycleLabel = (cycle: number) => {
    if (cycle === 1) return t('summary.monthly');
    return t('summary.months_cycle', { count: cycle });
  }

  // Add item rows
  items.forEach(item => {
    rows.push([
      escapeCsvCell(item.service),
      escapeCsvCell(getRenderedDescription(item, t)),
      escapeCsvCell(item.quantity),
      escapeCsvCell(item.price.toLocaleString(numberLocale)),
      escapeCsvCell((item.price * item.quantity * billingCycle).toLocaleString(numberLocale)),
    ]);
  });

  // Add blank row for spacing
  rows.push([]);

  // Add summary rows
  const grandTotalLabel = billingCycle === 1 ? t('csv.grand_total') : t('summary.total_cycle', { duration: getCycleLabel(billingCycle) });
  rows.push(['', '', '', escapeCsvCell(t('csv.subtotal')), escapeCsvCell(subtotal.toLocaleString(numberLocale))]);
  rows.push(['', '', '', escapeCsvCell(t('csv.vat')), escapeCsvCell(vat.toLocaleString(numberLocale))]);
  if (discountPercent > 0) {
    rows.push(['', '', '', escapeCsvCell(t('csv.discount', { percent: discountPercent })), escapeCsvCell(`-${discountAmount.toLocaleString(numberLocale)}`)]);
  }
  rows.push(['', '', '', escapeCsvCell(grandTotalLabel), escapeCsvCell(grandTotal.toLocaleString(numberLocale))]);

  // Combine headers and rows into a single CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create a Blob and trigger download
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for BOM
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Bizfly_Cloud_Cost_Estimate.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
