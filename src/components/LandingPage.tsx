import { ArrowRight, ShieldCheck, HeartPulse, Sparkles, TrendingUp, Compass } from "lucide-react";

interface LandingProps {
  onStartLogin: () => void;
  onStartRegister: () => void;
}

export default function LandingPage({ onStartLogin, onStartRegister }: LandingProps) {
  return (
    <div className="relative min-h-screen bg-[#2D1F1B] text-[#FFF7F5] overflow-x-hidden">
      {/* Background radial glowing gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-[#FF8A7A]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-20%] w-[500px] h-[500px] rounded-full bg-[#FFD0C7]/5 blur-[120px] pointer-events-none" />

      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#2D1F1B]/95 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF8A7A] to-[#FFD0C7] flex items-center justify-center shadow-md shadow-[#FF8A7A]/10">
              <Sparkles className="w-5 h-5 text-[#2D1F1B]" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Nabung<span className="text-[#FF8A7A]">Yuk</span>
            </span>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={onStartLogin}
              className="text-sm font-medium hover:text-[#FF8A7A] transition-colors cursor-pointer px-3 py-1.5"
            >
              Masuk
            </button>
            <button
              onClick={onStartRegister}
              className="text-sm font-medium bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] hover:brightness-110 text-[#2B2B2B] px-5 py-2.5 rounded-full transition-all shadow-md shadow-[#FF8A7A]/15 hover:scale-105 cursor-pointer font-semibold"
            >
              Registrasi Gratis
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF8A7A]/10 border border-[#FF8A7A]/20 text-xs text-[#FF8A7A] font-semibold tracking-wide w-fit mb-6">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
              <span>Aplikasi Keuangan Premium Suite</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Tabungan Digital <br />Dengan Nuansa <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A7A] via-[#FFD0C7] to-[#FFD0C7]">
                Fintech Elegan
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl mb-10">
              Atur, simpan, dan lipatgandakan sisa dana belanja modalmu lewat dashboard digital NabungYuk. Nikmati desain rounded card yang memukau, ring target interaktif, scanner QRIS, serta pencatatan rincian pengeluaran finansial secara real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStartRegister}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] hover:brightness-110 text-[#2B2B2B] font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-[#FF8A7A]/20 hover:scale-102 cursor-pointer text-base"
              >
                Mulai Menabung Sekarang <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onStartLogin}
                className="flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 font-bold px-6 py-4 rounded-full transition-all cursor-pointer text-base"
              >
                Coba Demo Akun
              </button>
            </div>

            {/* Microstats banner */}
            <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-3 gap-6">
              <div>
                <span className="block text-3xl font-extrabold text-white font-display">12K+</span>
                <span className="text-xs text-gray-400">Pengguna Aktif</span>
              </div>
              <div>
                <span className="block text-3xl font-extrabold text-white font-display">Rp14B+</span>
                <span className="text-xs text-gray-400">Total Saku Terkumpul</span>
              </div>
              <div>
                <span className="block text-3xl font-extrabold text-[#FF8A7A] font-display">99.8%</span>
                <span className="text-xs text-gray-400">Tingkat Kepuasan</span>
              </div>
            </div>
          </div>

          {/* Hero graphic mockup mimicking the target aesthetic */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            {/* Soft backdrop glow behind mockup */}
            <div className="absolute inset-0 bg-[#FF8A7A]/10 blur-[80px] rounded-full pointer-events-none scale-75" />

            {/* Smart mobile container layout based on user's referential screenshot */}
            <div className="w-full max-w-[340px] bg-[#FFF7F5]/85 backdrop-blur-2xl rounded-[40px] p-6 text-[#2B2B2B] shadow-2xl shadow-black/60 border-4 border-[#3E2D28] relative overflow-hidden transition-all duration-500 hover:rotate-2 hover:scale-[1.02]">
              {/* Top speaker notch mockup */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#2D1F1B] rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>

              {/* Header inside mobile screen */}
              <div className="flex justify-between items-center mt-4 mb-5">
                <span className="font-display font-black text-sm text-[#2B2B2B] tracking-tight">NabungYuk</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#FF8A7A] rounded-full animate-ping" />
                  <span className="w-5 h-2 bg-[#FF8A7A]/25 rounded-full" />
                </div>
              </div>

              {/* OVERVIEW Header */}
              <div className="mb-4">
                <span className="text-[10px] text-gray-500 tracking-wider uppercase font-bold">OVERVIEW</span>
                <h3 className="font-display font-extrabold text-xl text-gray-800 leading-none">Keuangan Anda</h3>
              </div>

              {/* Coral Gradient main widget from reference screen 1 */}
              <div className="coral-gradient p-5 rounded-[28px] shadow-lg shadow-[#FF8A7A]/10 mb-4 relative overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-[#2B2B2B]/60 tracking-wider">Sisa Anggaran Tabungan</span>
                <div className="font-display font-extrabold text-2xl text-[#2B2B2B] mt-0.5 leading-none">
                  Rp14.000.000
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#2B2B2B]/10 h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-[#2B2B2B] h-full rounded-full" style={{ width: "70%" }} />
                </div>
                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-[10px] font-bold text-[#2B2B2B]/75">70% Terselamatkan</span>
                  <span className="text-[10px] bg-[#2B2B2B]/10 px-2 py-0.5 rounded-full font-bold">Mei 2026</span>
                </div>
              </div>

              {/* Quick statistics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#2D1F1B] text-[#FFF7F5] p-3 rounded-2xl">
                  <span className="text-[9px] text-gray-400 block">Pemberian Gaji</span>
                  <span className="font-display text-xs font-extrabold text-[#FFD0C7]">Rp95.000K</span>
                </div>
                <div className="bg-[#2D1F1B] text-[#FFF7F5] p-3 rounded-2xl">
                  <span className="text-[9px] text-gray-400 block">Biaya Belanja</span>
                  <span className="font-display text-xs font-extrabold text-red-400">Rp2.400K</span>
                </div>
              </div>

              {/* Popular categories layout */}
              <span className="text-[10px] font-bold text-gray-400 block mb-2">Aktivitas Prioritas</span>
              <div className="flex justify-between gap-2 mb-4">
                {["Liburan", "Makanan", "Layanan", "Kopi"].map((cat, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-[#FFEAE5] flex items-center justify-center border border-[#FF8A7A]/30">
                      <span className="text-xs font-bold text-[#FF8A7A]">{cat[0]}</span>
                    </div>
                    <span className="text-[8px] text-gray-500 font-semibold mt-1">{cat}</span>
                  </div>
                ))}
              </div>

              {/* Transactions list layout preview */}
              <span className="text-[10px] font-bold text-gray-400 block mb-2">Riwayat Tabungan Terbaru</span>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2.5 bg-black/[0.02] rounded-xl border border-black/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">U</span>
                    <div>
                      <span className="block text-[11px] font-semibold text-gray-800">Tambahan Saku Dompet</span>
                      <span className="block text-[8px] text-gray-400">Kategori: Holiday</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 font-mono">+Rp14M</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-black/[0.02] rounded-xl border border-black/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#FF8A7A] flex items-center justify-center text-xs font-bold">U</span>
                    <div>
                      <span className="block text-[11px] font-semibold text-gray-800">Uniqlo flannel shirt</span>
                      <span className="block text-[8px] text-gray-400">Kategori: Shopping</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-600 font-mono">-Rp400K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section Card Grid */}
      <section className="bg-[#251A17] py-20 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Kenapa Memilih Platform NabungYuk?
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Dirancang dengan desain interface berkelas dunia untuk menaikkan antusiasme Anda dalam menyisihkan pemasukan, mencapai impian terkumpul, dan menjaga disiplin dompet keuangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-panel p-8 rounded-3xl transition-all hover:translate-y-[-4px] hover:border-[#FF8A7A]/30">
              <div className="w-12 h-12 rounded-2xl bg-[#FF8A7A]/10 flex items-center justify-center mb-6 border border-[#FF8A7A]/20">
                <ShieldCheck className="w-6 h-6 text-[#FF8A7A]" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">Keamanan Terjamin</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Setiap data transaksi dilindungi enkripsi standard bank. Menggunakan sistem approval bukti transfer digital, meminimalisir manipulasi dan kehilangan riwayat penting.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-8 rounded-3xl transition-all hover:translate-y-[-4px] hover:border-[#FF8A7A]/30">
              <div className="w-12 h-12 rounded-2xl bg-[#FF8A7A]/10 flex items-center justify-center mb-6 border border-[#FF8A7A]/20">
                <TrendingUp className="w-6 h-6 text-[#FF8A7A]" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">Analisis Progres Riil</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Tonton presentasi visual target tabungan terakumulasi lewat meteran grafik radial, persentase goal, serta pemberitahuan waktu jatuh tempo yang atraktif.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-8 rounded-3xl transition-all hover:translate-y-[-4px] hover:border-[#FF8A7A]/30">
              <div className="w-12 h-12 rounded-2xl bg-[#FF8A7A]/10 flex items-center justify-center mb-6 border border-[#FF8A7A]/20">
                <HeartPulse className="w-6 h-6 text-[#FF8A7A]" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">Metode Simpel Premium</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Simpan dana tabungan dalam hitungan detik via scan QRIS otomatis ataupun transfer bank manual. Tambahkan catatan dan unggah bukti transfer langsung dari browser HP Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Mini Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 NabungYuk™ Inc. Semua Hak Dilindungi. Aplikasi Tabungan Fintech Indonesia.</p>
          <span className="block text-xs mt-2 text-gray-600">Built using React 19 + Node Express backend + MySQL ready schema.</span>
        </div>
      </footer>
    </div>
  );
}
