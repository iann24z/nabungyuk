import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = 3000;

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Helper: get user by token (email)
async function getUserByToken(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const email = authHeader.replace("Bearer ", "").trim();
  const { data } = await supabase.from("users").select("*").eq("email", email).single();
  return data;
}

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  const { nama, email, password, foto_profile } = req.body;
  if (!nama || !email || !password)
    return res.status(400).json({ error: "Kolom nama, email, dan password wajib diisi." });

  const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
  if (existing) return res.status(400).json({ error: "Email sudah terdaftar." });

  const { data: user, error } = await supabase.from("users").insert([{
    nama, email: email.toLowerCase(), password,
    foto_profile: foto_profile || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
  }]).select().single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ success: true, token: user.email, user: { id: user.id, nama: user.nama, email: user.email, foto_profile: user.foto_profile } });
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email dan password wajib diisi." });

  const { data: user } = await supabase.from("users").select("*").eq("email", email.toLowerCase()).single();
  if (!user || user.password !== password)
    return res.status(401).json({ error: "Email atau password salah." });

  res.json({ success: true, token: user.email, user: { id: user.id, nama: user.nama, email: user.email, foto_profile: user.foto_profile } });
});

// ME
app.get("/api/auth/me", async (req, res) => {
  const user = await getUserByToken(req);
  if (!user) return res.status(401).json({ error: "Sesi tidak valid." });
  res.json({ success: true, user: { id: user.id, nama: user.nama, email: user.email, foto_profile: user.foto_profile } });
});

// KATEGORI
app.get("/api/kategori", async (req, res) => {
  const { data } = await supabase.from("kategori").select("*");
  res.json({ success: true, kategori: data });
});

// TARGET - GET
app.get("/api/target", async (req, res) => {
  const user = await getUserByToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { data } = await supabase.from("target_tabungan").select("*").eq("user_id", user.id);
  res.json({ success: true, targets: data });
});

// TARGET - CREATE
app.post("/api/target", async (req, res) => {
  const user = await getUserByToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { nama_target, target_nominal, deadline } = req.body;
  if (!nama_target || !target_nominal || !deadline)
    return res.status(400).json({ error: "Semua kolom target wajib diisi." });

  const { data, error } = await supabase.from("target_tabungan").insert([{
    user_id: user.id, nama_target, target_nominal: Number(target_nominal), saldo_terkumpul: 0, deadline
  }]).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ success: true, target: data });
});

// TARGET - DELETE
app.delete("/api/target/:id", async (req, res) => {
  const user = await getUserByToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { error } = await supabase.from("target_tabungan").delete().eq("id", Number(req.params.id)).eq("user_id", user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, message: "Target berhasil dihapus." });
});

// TRANSAKSI - GET
app.get("/api/transaksi", async (req, res) => {
  const user = await getUserByToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  let query = supabase.from("transaksi").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (req.query.tipe) query = query.eq("tipe_transaksi", req.query.tipe as string);
  if (req.query.target_id) query = query.eq("target_id", Number(req.query.target_id));

  const { data } = await query;
  res.json({ success: true, transaksi: data });
});

// TRANSAKSI - CREATE
app.post("/api/transaksi", async (req, res) => {
  const user = await getUserByToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { tipe_transaksi, nominal, metode_pembayaran, catatan, bukti_transfer, target_id, nama_penyetor } = req.body;
  if (!tipe_transaksi || !nominal || !metode_pembayaran)
    return res.status(400).json({ error: "Tipe, nominal, dan metode pembayaran wajib diisi." });

  const isDigitalUpload = metode_pembayaran.toLowerCase().includes("qris") || metode_pembayaran.toLowerCase().includes("transfer");
  const status = isDigitalUpload && bukti_transfer ? "pending" : "berhasil";

  const { data, error } = await supabase.from("transaksi").insert([{
    user_id: user.id, tipe_transaksi, nominal: Number(nominal), metode_pembayaran,
    catatan: catatan || null, bukti_transfer: bukti_transfer || null,
    status, target_id: target_id ? Number(target_id) : null,
    nama_penyetor: tipe_transaksi === "pemasukan" ? (nama_penyetor || user.nama) : null
  }]).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Update saldo target
  if (status === "berhasil" && target_id) {
    const { data: txList } = await supabase.from("transaksi").select("nominal").eq("target_id", Number(target_id)).eq("status", "berhasil").eq("tipe_transaksi", "pemasukan");
    const total = txList?.reduce((sum, t) => sum + t.nominal, 0) || 0;
    await supabase.from("target_tabungan").update({ saldo_terkumpul: total }).eq("id", Number(target_id));
  }

  res.status(201).json({ success: true, transaksi: data });
});

// TRANSAKSI - UPDATE STATUS
app.put("/api/transaksi/:id/status", async (req, res) => {
  const user = await getUserByToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { status } = req.body;
  const { data, error } = await supabase.from("transaksi").update({ status }).eq("id", Number(req.params.id)).eq("user_id", user.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, transaksi: data });
});

// TRANSAKSI - DELETE
app.delete("/api/transaksi/:id", async (req, res) => {
  const user = await getUserByToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { error } = await supabase.from("transaksi").delete().eq("id", Number(req.params.id)).eq("user_id", user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, message: "Transaksi berhasil dihapus." });
});

// DASHBOARD
app.get("/api/dashboard/summary", async (req, res) => {
  const user = await getUserByToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { data: transactions } = await supabase.from("transaksi").select("*").eq("user_id", user.id);
  const { data: targets } = await supabase.from("target_tabungan").select("*").eq("user_id", user.id);

  const totalIncome = transactions?.filter(t => t.tipe_transaksi === "pemasukan" && t.status === "berhasil").reduce((sum, t) => sum + t.nominal, 0) || 0;
  const totalExpenses = transactions?.filter(t => t.tipe_transaksi === "pengeluaran" && t.status === "berhasil").reduce((sum, t) => sum + t.nominal, 0) || 0;
  const activeBalance = totalIncome - totalExpenses;
  const overallTargetNominal = targets?.reduce((sum, t) => sum + t.target_nominal, 0) || 0;
  const overallSavedNominal = targets?.reduce((sum, t) => sum + t.saldo_terkumpul, 0) || 0;
  const overallPercent = overallTargetNominal > 0 ? Math.round((overallSavedNominal / overallTargetNominal) * 100) : 0;

  res.json({
    success: true,
    summary: { activeBalance, totalIncome, totalExpenses, overallPercent, activeTargetsCount: targets?.length || 0, overallTargetNominal, overallSavedNominal },
    transactions: transactions?.slice(0, 10) || [],
    targets: targets || []
  });
});

// QRIS
app.get("/api/qris/image", (req, res) => {
  const defaultPath = path.join(process.cwd(), "src/assets/images/qris_payment_code_1779963413005.png");
  res.sendFile(defaultPath);
});

// START SERVER
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`[NabungYuk] Running at http://localhost:${PORT}`));
}

start().catch(console.error);