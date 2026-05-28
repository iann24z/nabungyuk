import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  TrendingUp as IncomeIcon,
  Calendar,
  Search,
  Filter,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  Clock,
  QrCode,
  Target,
  User as UserIcon,
  Image as ImageIcon,
  ChevronRight,
  RefreshCw,
  LayoutDashboard,
  Coins,
  BookOpen,
  ArrowRight,
  Compass,
  Briefcase,
  Layers,
  Award,
  AlertCircle,
  Info,
  LogOut,
  Sliders,
  DollarSign,
  Coffee,
  Plane,
  Utensils,
  FileText,
  ShoppingBag
} from "lucide-react";
import SplashScreen from "./components/SplashScreen";
import LandingPage from "./components/LandingPage";
import { User, Kategori, Transaksi, TargetTabungan, DashboardSummary } from "./types";

export default function App() {
  // 1. Initial State Definitions
  const [booted, setBooted] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem("nabung_token"));
  const [user, setUser] = useState<User | null>(null);
  
  // Navigation View: "landing" | "login" | "register" | "dashboard"
  const [view, setView] = useState<"landing" | "login" | "register" | "dashboard">("landing");
  
  // Sub-tab within dashboard structure: "overview" | "budget" | "qris" 
  const [dashTab, setDashTab] = useState<"overview" | "budget" | "qris">("overview");

  // Live Database States
  const [summary, setSummary] = useState<DashboardSummary>({
    activeBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    overallPercent: 0,
    activeTargetsCount: 0,
    overallTargetNominal: 0,
    overallSavedNominal: 0,
  });
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [targets, setTargets] = useState<TargetTabungan[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);

  // Local interactive filter criteria
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPopularCategory, setSelectedPopularCategory] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"semua" | "pemasukan" | "pengeluaran">("semua");

  // Form Modals Toggles
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Form Entry data structures
  const [savingForm, setSavingForm] = useState({
    tipe_transaksi: "pemasukan",
    nominal: "",
    metode_pembayaran: "QRIS NabungYuk",
    catatan: "",
    bukti_transfer: "", // Base64 or mock receipt
    target_id: "",
    nama_penyetor: "",
  });

  const [targetForm, setTargetForm] = useState({
    nama_target: "",
    target_nominal: "",
    deadline: "",
  });

  const [qrisTimestamp, setQrisTimestamp] = useState<number>(Date.now());

  // Authentication Forms
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ nama: "", email: "", password: "", confirmPassword: "" });
  
  // Notice overlays
  const [authError, setAuthError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [simulatedReceiptIndex, setSimulatedReceiptIndex] = useState(0);

  // Default preset mock receipts/proof of transfers for fast simulation click
  const mockReceipts = [
    "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=200", // Standard statement
    "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=200", // Transaction proof screenshot simulation
    "https://images.unsplash.com/photo-1616077168712-fc6c788bc4ee?auto=format&fit=crop&q=80&w=200" // Receipts log mockup
  ];

  // 2. Lifecycle Effects
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Clean trigger toast timeouts helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // REST API: User profile validation
  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setView("dashboard");
      } else {
        // Clear stale token
        localStorage.removeItem("nabung_token");
        setToken(null);
        setView("landing");
      }
    } catch (e) {
      console.error(e);
      setView("landing");
    }
  };

  // REST API: Refresh Dashboard values
  const loadDashboardData = async () => {
    if (!token) return;
    try {
      // 1. Summary details (Balance, target percentages, key highlights)
      const resSum = await fetch("/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resSum.ok) {
        const data = await resSum.json();
        setSummary(data.summary);
        setTargets(data.targets);
      }

      // 2. Transactions ledger list
      let txUrl = "/api/transaksi";
      const params: string[] = [];
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (typeFilter !== "semua") params.push(`tipe=${typeFilter}`);
      if (params.length > 0) {
        txUrl += `?${params.join("&")}`;
      }

      const resTx = await fetch(txUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resTx.ok) {
        const data = await resTx.json();
        setTransactions(data.transaksi);
      }

      // 3. Category presets
      const resCat = await fetch("/api/kategori");
      if (resCat.ok) {
        const data = await resCat.json();
        setKategori(data.kategori);
      }

    } catch (e) {
      console.error("Gagal mendapatkan sinkronisasi backend:", e);
    }
  };

  // Handle Search and Filter changes dynamically
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [searchQuery, typeFilter]);

  // 3. Authentication Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("nabung_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setView("dashboard");
        triggerToast(`Selamat datang kembali, ${data.user.nama}! Sesi login berhasil.`);
      } else {
        setAuthError(data.error || "Email atau password tidak sesuai.");
      }
    } catch (err) {
      setAuthError("Koneksi gagal. Silakan jalankan server.ts kembali.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!registerForm.nama || !registerForm.email || !registerForm.password) {
      setAuthError("Harap lengkapi seluruh formulir registrasi.");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: registerForm.nama,
          email: registerForm.email,
          password: registerForm.password
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("nabung_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setView("dashboard");
        triggerToast(`Registrasi Berhasil! Selamat datang di NabungYuk, ${data.user.nama}!`);
      } else {
        setAuthError(data.error || "Registrasi gagal, periksa isian Anda.");
      }
    } catch (err) {
      setAuthError("Gagal mendaftarkan akun. Silakan coba sesaat lagi.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nabung_token");
    setToken(null);
    setUser(null);
    setView("landing");
    triggerToast("Anda berhasil keluar dari sesi.");
  };

  // 4. Data Transaction Handlers
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const nominalNum = Number(savingForm.nominal);
    if (!nominalNum || nominalNum <= 0) {
      setFormError("Nominal tabungan atau transaksi harus lebih besar dari Rp0.");
      return;
    }

    try {
      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tipe_transaksi: savingForm.tipe_transaksi,
          nominal: nominalNum,
          metode_pembayaran: savingForm.metode_pembayaran,
          catatan: savingForm.catatan,
          bukti_transfer: savingForm.bukti_transfer || null,
          target_id: savingForm.target_id ? Number(savingForm.target_id) : null,
          nama_penyetor: savingForm.nama_penyetor || (user ? user.nama : "")
        })
      });

      const data = await res.json();
      if (res.ok) {
        setIsSavingModalOpen(false);
        // Clear entry
        setSavingForm({
          tipe_transaksi: "pemasukan",
          nominal: "",
          metode_pembayaran: "QRIS NabungYuk",
          catatan: "",
          bukti_transfer: "",
          target_id: "",
          nama_penyetor: ""
        });
        loadDashboardData();
        triggerToast("Transaksi berhasil dicatat!");
      } else {
        setFormError(data.error || "Gagal mencatat transaksi.");
      }
    } catch (err) {
      setFormError("Koneksi gagal saat menyimpan transaksi.");
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const res = await fetch(`/api/transaksi/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        loadDashboardData();
        triggerToast("Transaksi berhasil dihapus");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTransactionStatus = async (id: number, status: "berhasil" | "gagal") => {
    try {
      const res = await fetch(`/api/transaksi/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadDashboardData();
        triggerToast(`Transaksi berhasil disetujui (${status.toUpperCase()})`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Target Handlers
  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const nominalNum = Number(targetForm.target_nominal);
    if (!targetForm.nama_target || !nominalNum || nominalNum <= 0 || !targetForm.deadline) {
      setFormError("Harap lengkapi judul, nominal target, dan tanggal deadline target.");
      return;
    }

    try {
      const res = await fetch("/api/target", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_target: targetForm.nama_target,
          target_nominal: nominalNum,
          deadline: targetForm.deadline
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsTargetModalOpen(false);
        setTargetForm({ nama_target: "", target_nominal: "", deadline: "" });
        loadDashboardData();
        triggerToast(`Target target baru "${data.target.nama_target}" berhasil dibuat!`);
      } else {
        setFormError(data.error || "Gagal membuat target.");
      }
    } catch (e) {
      setFormError("Gagal terhubung dengan server database.");
    }
  };

  const handleDeleteTarget = async (id: number) => {
    try {
      const res = await fetch(`/api/target/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        loadDashboardData();
        triggerToast("Target tabungan berhasil dihapus.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch("/api/qris/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64String })
        });
        const data = await res.json();
        if (res.ok) {
          setQrisTimestamp(Date.now());
          triggerToast("QRAsli berhasil disimpan dan disamakan!");
        } else {
          triggerToast("Gagal: " + (data.error || "Terjadi kesalahan."));
        }
      } catch (err) {
        triggerToast("Gagal mengunggah QRIS.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Fast integration simulator: auto inject mock transfer proofs
  const injectReceipt = () => {
    const nextIndex = (simulatedReceiptIndex + 1) % mockReceipts.length;
    setSimulatedReceiptIndex(nextIndex);
    setSavingForm(prev => ({
      ...prev,
      bukti_transfer: mockReceipts[nextIndex]
    }));
    triggerToast("Bukti Transfer Terpilih untuk simulasi!");
  };

  // Format currency helpers
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Convert categories icon into matching Lucide Component
  const renderCategoryIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName.toLowerCase()) {
      case "plane":
        return <Plane className={className} />;
      case "utensils":
        return <Utensils className={className} />;
      case "file-text":
        return <FileText className={className} />;
      case "coffee":
        return <Coffee className={className} />;
      case "shopping-bag":
        return <ShoppingBag className={className} />;
      case "dollar-sign":
        return <DollarSign className={className} />;
      default:
        return <HelpCircle className={className} />;
    }
  };

  // Filter transactions also depending on popular icon filters from view UI (Screen 1)
  const getFilteredTransactions = () => {
    let list = [...transactions];
    if (selectedPopularCategory) {
      list = list.filter(item => {
        const catName = item.catatan?.toLowerCase() || "";
        const method = item.metode_pembayaran.toLowerCase();
        // Matching rules that mimic popular presets beautifully
        if (selectedPopularCategory === "holiday") return catName.includes("liburan") || catName.includes("raja") || catName.includes("transit");
        if (selectedPopularCategory === "food") return catName.includes("food") || catName.includes("dinner") || catName.includes("pizza") || catName.includes("makan");
        if (selectedPopularCategory === "utilities") return catName.includes("roof") || catName.includes("leak") || catName.includes("layanan") || catName.includes("listrik");
        if (selectedPopularCategory === "coffee") return catName.includes("kopi") || catName.includes("coffee") || catName.includes("starbucks");
        return true;
      });
    }
    return list;
  };

  // Render loading splash screen first
  if (!booted) {
    return <SplashScreen onComplete={() => setBooted(true)} />;
  }

  // Render Landing page when guest visitor
  if (view === "landing" && !token) {
    return (
      <LandingPage
        onStartLogin={() => {
          setLoginForm({ email: "demo@nabungyuk.id", password: "password123" });
          setView("login");
        }}
        onStartRegister={() => setView("register")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#2D1F1B] text-[#FFF7F5] relative flex flex-col items-center">
      
      {/* Background decoration elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#FF8A7A]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#FFD0C7]/5 blur-[120px] pointer-events-none" />

      {/* Floating active Toast Alerts */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] text-[#2B2B2B] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold border border-white/20 animate-bounce duration-500 max-w-sm">
          <CheckCircle className="w-5 h-5 text-[#2D1F1B]" />
          <span className="text-sm font-sans">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* AUTH VIEW (LOGIN SCREEN CARD)                             */}
      {/* ========================================================= */}
      {(view === "login" || view === "register") && (
        <div className="w-full max-w-md min-h-screen px-4 py-8 flex items-center justify-center relative z-10">
          <div className="w-full glass-card-dark border border-white/10 rounded-[36px] p-8 shadow-2xl relative overflow-hidden">
            
            {/* Background design accents */}
            <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-[#FF8A7A]/10 blur-xl" />
            
            <button
              onClick={() => setView("landing")}
              className="text-gray-400 hover:text-white mb-6 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              ← Kembali ke Landing Page
            </button>

            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-[20px] bg-gradient-to-tr from-[#FF8A7A] to-[#FFD0C7] flex items-center justify-center shadow-lg shadow-[#FF8A7A]/20 mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-[#2D1F1B]" />
              </div>
              <h2 className="font-display text-2xl font-extrabold text-white">
                {view === "login" ? "Masuk NabungYuk" : "Daftar Akun Baru"}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {view === "login" ? "Kelola statistik saku tabungan premium" : "Gabung gratis & susun target impian finansial"}
              </p>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-2xl mb-5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Login Template */}
            {view === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Alamat Email</label>
                  <input
                    type="email"
                    required
                    placeholder="demo@nabungyuk.id"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A7A]/40 transition-all font-medium"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Kata Sandi</label>
                    <span className="text-[10px] text-[#FF8A7A] hover:underline cursor-pointer">Lupa?</span>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="password123"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A7A]/40 transition-all"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] text-[#2B2B2B] text-sm font-bold rounded-2xl transition-all shadow-lg shadow-[#FF8A7A]/15 mt-2 hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  Masuk Sekarang
                </button>
              </form>
            )}

            {/* Register Template */}
            {view === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:outline-none focus:border-[#FF8A7A]/40 transition-all"
                    value={registerForm.nama}
                    onChange={(e) => setRegisterForm({ ...registerForm, nama: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Alamat Email</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:outline-none focus:border-[#FF8A7A]/40 transition-all"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Kata Sandi</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 8 karakter"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:outline-none focus:border-[#FF8A7A]/40 transition-all"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Ulangi Kata Sandi</label>
                  <input
                    type="password"
                    required
                    placeholder="Konfirmasi password"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:outline-none focus:border-[#FF8A7A]/40 transition-all"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] text-[#2B2B2B] text-sm font-bold rounded-2xl transition-all shadow-lg mt-2 cursor-pointer"
                >
                  Registrasi Bebas Biaya
                </button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <span className="text-xs text-gray-400">
                {view === "login" ? "Belum memiliki akun?" : "Sudah memiliki akun?"}
              </span>
              <button
                onClick={() => setView(view === "login" ? "register" : "login")}
                className="text-xs text-[#FF8A7A] font-bold hover:underline ml-1 cursor-pointer"
              >
                {view === "login" ? "Daftar Akun Baru" : "Masuk dengan Akun"}
              </button>
            </div>
          </div>
        </div>
      )}      {/* ========================================================= */}
      {/* FULL-STACK WEB DASHBOARD VIEW LOBBY                       */}
      {/* ========================================================= */}
      {view === "dashboard" && user && (
        <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 relative z-10">
          
          {/* Top Header of the Application Dashboard */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF8A7A] to-[#FFD0C7] flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-[#2D1F1B]" />
              </div>
              <div>
                <h1 className="font-display font-black text-2xl text-white tracking-tight leading-none flex items-center gap-2">
                  NabungYuk <span className="text-[10px] bg-[#FF8A7A] text-[#2D1F1B] px-2 py-0.5 rounded-full font-black font-mono">WORKSPACE</span>
                </h1>
                <p className="text-[#FFD0C7]/60 text-xs mt-1">
                  Selamat datang kembali, <strong className="text-white">{user.nama}</strong>. Kelola tabungan dan wujudkan impian finansial Anda.
                </p>
              </div>
            </div>

            {/* Header Actions & Profile */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-3">
                <img
                  src={user.foto_profile || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#FF8A7A] shadow"
                  alt="User avatar"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left hidden sm:block">
                  <span className="text-[9px] text-[#FF8A7A] block font-black uppercase tracking-wider">Premium Member</span>
                  <span className="text-xs font-bold text-white block -mt-0.5">{user.nama}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    loadDashboardData();
                    triggerToast("Data database berhasil disinkronisasi!");
                  }}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white transition-all cursor-pointer"
                  title="Sinkronisasi Ulang Data"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-hover" />
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-red-500/20 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Dashboard Workspace Page Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Statistics & Saving Form (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* PRIMARY BALANCE GRADIENT CARD */}
              <div className="coral-gradient p-8 rounded-[36px] shadow-xl shadow-[#FF8A7A]/15 relative overflow-hidden text-[#2B2B2B]">
                {/* Abstract background blobs for premium aesthetic */}
                <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-white/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-12 -top-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#2D1F1B]/60 leading-none">
                      Sisa Dana Tabungan / Balance Target
                    </span>
                    <h2 className="font-display font-black text-4xl mt-2 tracking-tight">
                      {formatIDR(summary.activeBalance)}
                    </h2>
                  </div>
                  <div className="bg-[#2D1F1B] text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg">
                    {summary.overallPercent}% On Target
                  </div>
                </div>

                {/* Aesthetic Progress Bar */}
                <div className="w-full bg-[#2D1F1B]/10 h-3 rounded-full mt-6 overflow-hidden">
                  <div
                    className="bg-[#2D1F1B] h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(8, summary.overallPercent))}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-3 text-[11px] font-black font-mono text-[#2D1F1B]/95 relative z-10">
                  <span>Target Impian: {formatIDR(summary.overallTargetNominal || 15000000)}</span>
                  <span>Terkumpul: {formatIDR(summary.overallSavedNominal)}</span>
                </div>

                {/* Income / Expense Breakdown */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#2D1F1B]/15">
                  <div>
                    <span className="text-[10px] font-bold text-[#2D1F1B]/60 uppercase tracking-widest block leading-none">Total Setoran</span>
                    <span className="font-display text-xl font-black font-mono block mt-1 text-emerald-800">
                      {formatIDR(summary.totalIncome)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#2D1F1B]/60 uppercase tracking-widest block leading-none">Total Belanja</span>
                    <span className="font-display text-xl font-black font-mono block mt-1 text-red-800">
                      {formatIDR(summary.totalExpenses)}
                    </span>
                  </div>
                </div>
              </div>

              {/* KATEGORI PRIORITAS */}
              <div className="glass-card-dark p-6 rounded-[28px] border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori Prioritas</h3>
                  {selectedPopularCategory && (
                    <button
                      onClick={() => setSelectedPopularCategory(null)}
                      className="text-[11px] text-[#FF8A7A] font-bold hover:underline"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: "Holiday", tag: "holiday", color: "bg-[#FFEAE5]", txt: "text-[#FF8A7A]", icon: "plane" },
                    { name: "Food", tag: "food", color: "bg-orange-100", txt: "text-orange-600", icon: "utensils" },
                    { name: "Utilities", tag: "utilities", color: "bg-blue-100", txt: "text-blue-600", icon: "file-text" },
                    { name: "Coffee", tag: "coffee", color: "bg-amber-100", txt: "text-amber-800", icon: "coffee" }
                  ].map((cat) => (
                    <button
                      key={cat.tag}
                      onClick={() => setSelectedPopularCategory(selectedPopularCategory === cat.tag ? null : cat.tag)}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        selectedPopularCategory === cat.tag
                          ? "bg-[#FF8A7A] text-[#2D1F1B] border border-[#FFD0C7]"
                          : "bg-white/5 hover:bg-white/10 border border-white/5"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full ${cat.color} ${cat.txt} flex items-center justify-center shadow-inner`}>
                        {renderCategoryIcon(cat.icon, "w-4.5 h-4.5")}
                      </div>
                      <span className={`text-xs font-bold mt-2 ${selectedPopularCategory === cat.tag ? "text-[#2D1F1B]" : "text-gray-300"}`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* FORMULIR VERIFIKASI TRANSFER / NABUNG */}
              <div id="formulir-nabung" className="glass-card-dark p-6 rounded-[28px] border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FF8A7A]/10 flex items-center justify-center text-[#FF8A7A]">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-black text-white">Formulir Setoran & Catat Belanja</h3>
                    <p className="text-xs text-gray-400">Sisihkan tabungan Anda atau catat transaksi langsung ke dalam sistem database.</p>
                  </div>
                </div>

                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleAddTransaction} className="space-y-4 text-xs font-medium text-gray-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-1.5 font-bold">Jenis Sesi Transaksi</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSavingForm({ ...savingForm, tipe_transaksi: "pemasukan" })}
                          className={`py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                            savingForm.tipe_transaksi === "pemasukan"
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-extrabold"
                              : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Setoran Tabungan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSavingForm({ ...savingForm, tipe_transaksi: "pengeluaran" })}
                          className={`py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                            savingForm.tipe_transaksi === "pengeluaran"
                              ? "bg-red-500/10 border-red-500/40 text-red-500 font-extrabold"
                              : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>Pengeluaran</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1.5 font-bold">Alokasi Saku Target</label>
                      <select
                        className="w-full p-3.5 bg-[#2D1F1B] border border-white/10 rounded-xl focus:outline-none text-white font-semibold"
                        value={savingForm.target_id}
                        onChange={(e) => setSavingForm({ ...savingForm, target_id: e.target.value })}
                      >
                        <option value="">Saldo Utama (Bebas Belanja)</option>
                        {targets.map((t) => (
                          <option key={t.id} value={t.id} className="bg-[#2D1F1B]">
                            {t.nama_target} ({formatIDR(t.saldo_terkumpul)} / {formatIDR(t.target_nominal)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-1.5 font-bold">Nominal Pembayaran (Rupiah)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold font-mono">Rp</span>
                        <input
                          type="number"
                          placeholder="e.g. 150000"
                          required
                          className="w-full pl-10 pr-4 py-3.5 bg-[#2D1F1B] border border-white/10 rounded-xl focus:outline-none text-white font-extrabold placeholder-gray-600"
                          value={savingForm.nominal}
                          onChange={(e) => setSavingForm({ ...savingForm, nominal: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1.5 font-bold">Metode Transaksi</label>
                      <select
                        className="w-full p-3.5 bg-[#2D1F1B] border border-white/10 rounded-xl text-white font-semibold"
                        value={savingForm.metode_pembayaran}
                        onChange={(e) => setSavingForm({ ...savingForm, metode_pembayaran: e.target.value })}
                      >
                        <option value="QRIS NabungYuk">QRIS NabungYuk (Otomatis)</option>
                        <option value="Transfer BCA">Transfer Bank BCA</option>
                        <option value="Transfer Mandiri">Transfer Bank Mandiri</option>
                        <option value="E-Wallet Shopee/Dana">E-Wallet Shopee or Dana</option>
                        <option value="Tunai">Uang Tunai / Cash</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1.5 font-bold">Catatan / Keterangan Transaksi</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Setoran rutin mingguan / Makan siang bersama rekan"
                      className="w-full p-3.5 bg-[#2D1F1B] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none"
                      value={savingForm.catatan}
                      onChange={(e) => setSavingForm({ ...savingForm, catatan: e.target.value })}
                    />
                  </div>

                  {savingForm.tipe_transaksi === "pemasukan" && (
                    <div>
                      <label className="block text-gray-400 mb-1.5 font-bold flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-[#FF8A7A]" /> Nama Penyetor (Penyetor Tabungan)
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. ${user?.nama || "Iyan Maulana"}`}
                        className="w-full p-3.5 bg-[#2D1F1B] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none"
                        value={savingForm.nama_penyetor}
                        onChange={(e) => setSavingForm({ ...savingForm, nama_penyetor: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Receipt screenshot option */}
                  <div>
                    <label className="block text-gray-400 mb-1.5 font-bold">Unggah Bukti Struk Pembayaran (Verifikasi Otomatis)</label>
                    {savingForm.bukti_transfer ? (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-emerald-300">
                        <div className="flex items-center gap-3">
                          <img
                            src={savingForm.bukti_transfer}
                            className="w-12 h-12 rounded-lg object-cover border border-emerald-500/30"
                            alt="Screenshot"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="block font-bold text-xs">Struk Terpilih</span>
                            <span className="block text-[10px] text-emerald-400/85">Screenshot siap untuk diproses</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSavingForm({ ...savingForm, bukti_transfer: "" })}
                          className="text-[#FF8A7A] hover:underline font-bold text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="border border-dashed border-white/10 p-5 rounded-2xl text-center bg-[#2D1F1B]/20">
                        <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-[11px] text-gray-400 mb-3">Punya tanda bayar atau screenshot struk? Masukkan untuk simulasi.</p>
                        <button
                          type="button"
                          onClick={injectReceipt}
                          className="text-xs bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] text-[#2B2B2B] px-4 py-2 rounded-xl font-bold hover:brightness-110 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Gunakan Gambar Contoh Struk</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] text-[#2B2B2B] font-extrabold text-sm rounded-xl transition-all shadow-lg hover:brightness-110 text-center tracking-wider uppercase cursor-pointer"
                  >
                    Simpan & Catat Transaksi Tabungan
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: QRIS Payment, Targets list, and History Table (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* BRANDED INTERACTIVE QRIS SCAN SUITE */}
              <div className="glass-card-dark p-6 rounded-[28px] border border-white/5 text-center flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#FFD0C7] uppercase tracking-wider block mb-3">Pindai Pembayaran QRIS</span>
                
                <div className="bg-white p-3 rounded-2xl inline-block shadow-xl relative group">
                  <div className="w-32 h-32 bg-gray-50 flex items-center justify-center relative overflow-hidden rounded-xl">
                    <img
                      src={`/api/qris/image?t=${qrisTimestamp}`}
                      alt="QRIS NabungYuk"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <h4 className="font-display font-black text-white text-sm mt-3 leading-none">QRIS NabungYuk Suite</h4>
                <p className="text-[10px] text-gray-400 mt-1.5 max-w-xs leading-normal">
                  Pindai QR ini dari dompet digital Anda untuk mendepositkan sesuka Anda, lalu isi formulir deposit di samping kiri untuk mengkonfirmasi.
                </p>

                {/* UI Action to Upload Custom QRIS */}
                <div className="mt-4 w-full">
                  <label className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-[#FF8A7A] border border-[#FF8A7A]/15 cursor-pointer transition-all">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Unggah/Ganti QRIS Asli</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleQrisUpload}
                    />
                  </label>
                  <p className="text-[9px] text-gray-500 mt-1.5 max-w-[200px] mx-auto leading-tight">
                    Unggah screenshot QRIS asli Anda agar tersimpan di database dan disamakan di seluruh akun.
                  </p>
                </div>
              </div>

              {/* SAVING TARGETS LIST CONTAINER */}
              <div className="glass-card-dark p-6 rounded-[28px] border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4.5 h-4.5 text-[#FF8A7A]" /> Celengan & Rencana Impian
                  </h3>
                  <button
                    onClick={() => setIsTargetModalOpen(true)}
                    className="py-1.5 px-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-[#FF8A7A] border border-[#FF8A7A]/20 cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Target Baru</span>
                  </button>
                </div>

                {targets.length === 0 ? (
                  <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center bg-white/5">
                    <Target className="w-7 h-7 text-[#FF8A7A] mx-auto opacity-30 mb-2" />
                    <h5 className="font-bold text-xs text-gray-300">Belum memiliki saku target</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">Mulai dengan membuat target impian pertama Anda.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                    {targets.map((tgt) => {
                      const pct = tgt.target_nominal > 0 ? Math.round((tgt.saldo_terkumpul / tgt.target_nominal) * 100) : 0;
                      return (
                        <div key={tgt.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl relative group hover:border-white/15 transition-all">
                          
                          <button
                            onClick={() => handleDeleteTarget(tgt.id)}
                            className="absolute top-3.5 right-3.5 p-1.5 text-gray-500 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
                            title="Hapus Target"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-[#FFEAE5] text-[#FF8A7A] flex items-center justify-center font-bold">
                              <Target className="w-4.5 h-4.5" />
                            </div>
                            <div className="space-y-0.5 max-w-[80%]">
                              <h4 className="font-bold text-xs text-white truncate pr-4">{tgt.nama_target}</h4>
                              <span className="text-[9px] text-gray-400 block pb-1">
                                Sisa Waktu s/d {new Date(tgt.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mb-1">
                              <span>Terkumpul: <strong className="text-white">{formatIDR(tgt.saldo_terkumpul)}</strong></span>
                              <span className="text-[#FF8A7A]">{pct}%</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] rounded-full transition-all duration-700"
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center mt-1.5 text-[9px] text-gray-500 font-mono">
                              <span>Rencana Sasaran: {formatIDR(tgt.target_nominal)}</span>
                              <button
                                onClick={() => {
                                  setSavingForm(prev => ({
                                    ...prev,
                                    tipe_transaksi: "pemasukan",
                                    catatan: `Setoran tabungan untuk target ${tgt.nama_target}`,
                                    target_id: String(tgt.id)
                                  }));
                                  triggerToast(`Saku target ${tgt.nama_target} berhasil dipilih!`);
                                  
                                  // Scroll seamlessly into save form
                                  document.getElementById("formulir-nabung")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="text-[#FFD0C7] hover:underline font-bold"
                              >
                                Isi Celengan This
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SAVING HISTORY & TRANSACTIONS RIWAYAT (LEDGER) */}
              <div className="glass-card-dark p-6 rounded-[28px] border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">Aktivitas & Riwayat</h3>
                  <span className="text-[10px] text-[#FF8A7A] font-bold bg-[#FF8A7A]/10 px-2.5 py-0.5 rounded-full">
                    {getFilteredTransactions().length} Catatan
                  </span>
                </div>

                {/* Search query & Filter Select */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white/5 border border-white/5 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-gray-450" />
                    <input
                      type="text"
                      placeholder="Cari transaksi..."
                      className="w-full text-xs bg-transparent border-none focus:outline-none placeholder-gray-500 text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="bg-white/5 border border-white/5 rounded-xl text-xs py-1.5 px-2 text-white focus:outline-none cursor-pointer"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                  >
                    <option value="semua" className="bg-[#2D1F1B]">Semua</option>
                    <option value="pemasukan" className="bg-[#2D1F1B]">Setoran / Masuk</option>
                    <option value="pengeluaran" className="bg-[#2D1F1B]">Pengeluaran / Keluar</option>
                  </select>
                </div>

                {getFilteredTransactions().length === 0 ? (
                  <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center">
                    <HelpCircle className="w-8 h-8 text-[#FF8A7A] mx-auto opacity-35 mb-2" />
                    <h5 className="font-bold text-xs text-gray-300">Belum ada transaksi</h5>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Rincian baru akan muncul ketika Anda mengisi form.</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {getFilteredTransactions().map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-between transition-all group shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 max-w-[70%]">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            tx.tipe_transaksi === "pemasukan"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}>
                            {tx.tipe_transaksi === "pemasukan" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>

                          <div className="max-w-[78%]">
                            <h5 className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                              {tx.catatan || "Suntik Saldo"}
                              {tx.target_id && (
                                <span className="text-[7px] font-bold bg-[#FF8A7A] text-[#2D1F1B] px-1 py-0.2 rounded shrink-0">
                                  Goal
                                </span>
                              )}
                            </h5>
                            <span className="text-[9px] text-gray-450 block mt-0.5 font-mono">
                              {tx.nama_penyetor ? `Penyetor: ${tx.nama_penyetor} • ` : ""}{tx.metode_pembayaran} • {new Date(tx.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-2">
                          <div>
                            <span className={`text-xs font-black font-mono block ${
                              tx.tipe_transaksi === "pemasukan" ? "text-emerald-400" : "text-gray-300"
                            }`}>
                              {tx.tipe_transaksi === "pemasukan" ? "+" : "-"}{formatIDR(tx.nominal)}
                            </span>

                            {/* Verification Pending status */}
                            {tx.bukti_transfer && (
                              <div className="mt-1 flex items-center justify-end gap-1">
                                <span className={`text-[8px] font-extrabold px-1 py-0.5 rounded ${
                                  tx.status === "berhasil"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : tx.status === "pending"
                                    ? "bg-amber-500/20 text-amber-300 animate-pulse"
                                    : "bg-red-500/20 text-red-300"
                                }`}>
                                  {tx.status}
                                </span>
                                {tx.status === "pending" && (
                                  <button
                                    onClick={() => handleUpdateTransactionStatus(tx.id, "berhasil")}
                                    className="text-[9px] text-[#FF8A7A] hover:underline font-bold"
                                    title="Setujui transfer"
                                  >
                                    [Setujui]
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1 hover:bg-white/5 text-gray-500 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* ============================================== */}
          {/* POPUP CREATOR MODAL: ADD GOAL TARGET           */}
          {/* ============================================== */}
          {isTargetModalOpen && (
            <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-white text-[#2B2B2B] rounded-[32px] p-6 shadow-2xl relative border border-gray-150">
                <div className="flex justify-between items-center pb-4 border-b border-gray-150 mb-4">
                  <h3 className="font-display font-extrabold text-[#2D1F1B] text-sm flex items-center gap-1.5">
                    <Target className="w-5 h-5 text-[#FF8A7A]" /> Target Celengan Baru
                  </h3>
                  <button
                    onClick={() => setIsTargetModalOpen(false)}
                    className="text-gray-400 hover:text-black p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddTarget} className="space-y-4 text-xs font-semibold text-gray-600">
                  <div>
                    <label className="block text-gray-500 mb-1">Judul Target Impian</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Beli MacBook Pro / Wisata Bali"
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                      value={targetForm.nama_target}
                      onChange={(e) => setTargetForm({ ...targetForm, nama_target: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">Nominal Target Tabungan (IDR)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 15000000"
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none font-bold"
                      value={targetForm.target_nominal}
                      onChange={(e) => setTargetForm({ ...targetForm, target_nominal: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">Deadline / Tenggat Waktu</label>
                    <input
                      type="date"
                      required
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none font-bold text-gray-700"
                      value={targetForm.deadline}
                      onChange={(e) => setTargetForm({ ...targetForm, deadline: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] text-[#2B2B2B] font-extrabold rounded-xl transition-all shadow-md mt-2 cursor-pointer text-center uppercase"
                  >
                    Buat Saku Target Baru
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
