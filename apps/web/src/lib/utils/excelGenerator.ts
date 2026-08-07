import { formatCurrency } from './currency';
import { formatDate } from './date';
import type { UITransaction } from '../../types';

interface GenerateExcelOptions {
  transactions: UITransaction[];
  brandName?: string;
  userRole?: string;
}

export function generateSalesExcel({
  transactions = [],
  brandName = 'Brand Utama',
  userRole = 'admin'
}: GenerateExcelOptions) {
  const isSuperAdmin = userRole === 'super_admin';
  const completedTx = transactions.filter((t) => t.status === 'completed');
  const totalRevenue = completedTx.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalProfit = completedTx.reduce((acc, t) => acc + (t.profit || 0), 0);

  // Headers
  const headers = isSuperAdmin
    ? ['Kode Transaksi', 'Waktu & Tanggal', 'Nama Penerima', 'Metode Pembayaran', 'Total Belanja (Rp)', 'Profit / Laba (Rp)', 'Status']
    : ['Kode Transaksi', 'Waktu & Tanggal', 'Nama Penerima', 'Metode Pembayaran', 'Total Belanja (Rp)', 'Status'];

  // Rows Data
  const rows = transactions.map((t) => {
    const row = [
      `"${t.id}"`,
      `"${formatDate(t.createdAt)}"`,
      `"${t.recipientName || 'Pembeli Umum'}"`,
      `"${(t.paymentMethod || 'CASH').toUpperCase()}"`,
      t.totalAmount,
    ];

    if (isSuperAdmin) {
      row.push(t.profit || 0);
    }

    row.push(`"${t.status === 'completed' ? 'Selesai' : 'Batal'}"`);
    return row.join(';');
  });

  // Footer Summary Row
  const summaryRow = isSuperAdmin
    ? `"" ; "TOTAL REKAP PENJUALAN (${completedTx.length} NOTA)" ; "" ; "" ; ${totalRevenue} ; ${totalProfit} ; ""`
    : `"" ; "TOTAL REKAP PENJUALAN (${completedTx.length} NOTA)" ; "" ; "" ; ${totalRevenue} ; ""`;

  // UTF-8 BOM prefix for Microsoft Excel compatibility
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows, summaryRow].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const cleanBrand = brandName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Rekap_Penjualan_${cleanBrand}_${dateStr}.csv`;

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
