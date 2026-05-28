export interface User {
  id: number;
  nama: string;
  email: string;
  foto_profile: string | null;
}

export interface Kategori {
  id: number;
  nama_kategori: string;
  icon: string;
}

export interface Transaksi {
  id: number;
  user_id: number;
  tipe_transaksi: "pemasukan" | "pengeluaran";
  nominal: number;
  metode_pembayaran: string;
  catatan: string | null;
  bukti_transfer: string | null;
  status: "pending" | "berhasil" | "gagal";
  target_id: number | null;
  created_at: string;
  nama_penyetor?: string | null;
}

export interface TargetTabungan {
  id: number;
  user_id: number;
  nama_target: string;
  target_nominal: number;
  saldo_terkumpul: number;
  deadline: string;
  created_at: string;
}

export interface DashboardSummary {
  activeBalance: number;
  totalIncome: number;
  totalExpenses: number;
  overallPercent: number;
  activeTargetsCount: number;
  overallTargetNominal: number;
  overallSavedNominal: number;
}
