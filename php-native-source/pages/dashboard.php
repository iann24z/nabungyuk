<?php
/**
 * Dashboard Screen PHP Native Source Code
 * NabungYuk - Aplikasi Tabungan Digital Modern
 */
require_once '../config/database.php';
require_once '../config/auth.php';

checkAuth(); // Secure authentication gate

$user_id = $_SESSION['user_id'];

try {
    // 1. Calculate active total income
    $stmtIncome = $conn->prepare("SELECT SUM(nominal) AS total FROM transaksi WHERE user_id = :user_id AND tipe_transaksi = 'pemasukan' AND status = 'berhasil'");
    $stmtIncome->execute(['user_id' => $user_id]);
    $totalIncome = $stmtIncome->fetch()['total'] ?? 0;

    // 2. Calculate active total expenses
    $stmtExpense = $conn->prepare("SELECT SUM(nominal) AS total FROM transaksi WHERE user_id = :user_id AND tipe_transaksi = 'pengeluaran' AND status = 'berhasil'");
    $stmtExpense->execute(['user_id' => $user_id]);
    $totalExpenses = $stmtExpense->fetch()['total'] ?? 0;

    // Sisa Saldo
    $activeBalance = $totalIncome - $totalExpenses;

    // Get active targets count
    $stmtTargetsCount = $conn->prepare("SELECT COUNT(*) AS total FROM target_tabungan WHERE user_id = :user_id");
    $stmtTargetsCount->execute(['user_id' => $user_id]);
    $activeTargetsCount = $stmtTargetsCount->fetch()['total'] ?? 0;

    // 3. Fetch latest 5 transactions
    $stmtTx = $conn->prepare("SELECT * FROM transaksi WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 5");
    $stmtTx->execute(['user_id' => $user_id]);
    $transactions = $stmtTx->fetchAll();

    // 4. Fetch targets progress for progress bar
    $stmtTg = $conn->prepare("SELECT * FROM target_tabungan WHERE user_id = :user_id ORDER BY created_at DESC");
    $stmtTg->execute(['user_id' => $user_id]);
    $targets = $stmtTg->fetchAll();

} catch (PDOException $e) {
    die("Gagal memuat dashboard: " . $e->getMessage());
}

include '../includes/header.php';
?>

<!-- Header Top Banner -->
<div class="px-6 pt-8 pb-4 flex justify-between items-center bg-[#2D1F1B]">
    <div>
        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Selamat Pagi,</span>
        <h3 class="font-display font-black text-xl text-white"><?php echo htmlspecialchars($_SESSION['nama']); ?></h3>
    </div>
    <div class="relative">
        <img src="<?php echo htmlspecialchars($_SESSION['foto_profile'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'); ?>" 
             class="w-10 h-10 rounded-full object-cover border-2 border-[#FF8A7A]" alt="User Avatar">
        <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border border-[#2D1F1B]"></span>
    </div>
</div>

<!-- Main Body Scroll Context -->
<div class="px-6 py-4 space-y-6 pb-28">

    <!-- Primary Coral Balance Card -->
    <div class="coral-gradient p-6 rounded-[32px] shadow-lg shadow-[#FF8A7A]/10 relative overflow-hidden">
        <span class="text-[10px] font-bold text-[#201512]/60 uppercase tracking-widest block leading-none">Sisa Dana Tabungan</span>
        <h2 class="font-display font-black text-3xl mt-2 text-gray-900 leading-none">
            Rp<?php echo number_format($activeBalance, 0, ',', '.'); ?>
        </h2>
        
        <div class="w-full bg-[#201512]/10 h-2 rounded-full mt-4 overflow-hidden">
            <div class="bg-gray-900 h-full rounded-full" style="width: 70%"></div>
        </div>
        <div class="flex justify-between items-center mt-2.5 text-[9px] font-bold text-[#201512]/80">
            <span>Disiplin Tabungan</span>
            <span>Est. 70% Berhasil</span>
        </div>
    </div>

    <!-- Stats summary boxes -->
    <div class="grid grid-cols-2 gap-4">
        <!-- Pemasukan -->
        <div class="bg-[#342420] border border-white/5 p-4 rounded-3xl flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <i data-lucide="arrow-down-left" class="w-4 h-4"></i>
            </div>
            <div>
                <span class="text-[9px] text-gray-400 block font-bold leading-none">Total Masuk</span>
                <span class="font-display text-xs font-bold text-white block mt-1 font-mono">
                    Rp<?php echo number_format($totalIncome, 0, ',', '.'); ?>
                </span>
            </div>
        </div>
        <!-- Pengeluaran -->
        <div class="bg-[#342420] border border-white/5 p-4 rounded-3xl flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
            </div>
            <div>
                <span class="text-[9px] text-gray-400 block font-bold leading-none">Belanja</span>
                <span class="font-display text-xs font-bold text-red-400 block mt-1 font-mono">
                    Rp<?php echo number_format($totalExpenses, 0, ',', '.'); ?>
                </span>
            </div>
        </div>
    </div>

    <!-- Quick Action / Popular categories section -->
    <div>
        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest pb-3">Kategori Prioritas</h4>
        <div class="grid grid-cols-4 gap-2 text-center text-xs">
            <div class="p-2.5 bg-white/5 border border-white/5 rounded-2xl">
                <div class="w-8 h-8 rounded-full bg-[#FFEAE5] text-[#FF8A7A] flex items-center justify-center mx-auto">
                    <i data-lucide="plane" class="w-4 h-4"></i>
                </div>
                <span class="text-[9px] text-gray-400 font-bold block mt-2">Holiday</span>
            </div>
            <div class="p-2.5 bg-white/5 border border-white/5 rounded-2xl">
                <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                    <i data-lucide="utensils" class="w-4 h-4"></i>
                </div>
                <span class="text-[9px] text-gray-400 font-bold block mt-2">Food</span>
            </div>
            <div class="p-2.5 bg-white/5 border border-white/5 rounded-2xl">
                <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    <i data-lucide="file-text" class="w-4 h-4"></i>
                </div>
                <span class="text-[9px] text-gray-400 font-bold block mt-2">Service</span>
            </div>
            <div class="p-2.5 bg-white/5 border border-white/5 rounded-2xl">
                <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <i data-lucide="coffee" class="w-4 h-4"></i>
                </div>
                <span class="text-[9px] text-gray-400 font-bold block mt-2">Coffee</span>
            </div>
        </div>
    </div>

    <!-- Ledger Transaction History List -->
    <div>
        <div class="flex justify-between items-center mb-3">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest">Riwayat Setoran</h4>
            <a href="transaksi.php" class="text-[10px] text-[#FF8A7A] font-bold hover:underline">Lihat Semua</a>
        </div>

        <?php if (empty($transactions)): ?>
            <div class="p-8 border border-dashed border-white/10 rounded-3xl text-center bg-white/5">
                <i data-lucide="help-circle" class="w-8 h-8 text-[#FF8A7A]/40 mx-auto mb-2"></i>
                <h5 class="font-bold text-xs">Belum ada transaksi</h5>
                <span class="text-[10px] text-gray-500">Mulai transfer via QRIS untuk menyisihkan celengan</span>
            </div>
        <?php else: ?>
            <div class="space-y-2">
                <?php foreach ($transactions as $tx): ?>
                    <div class="p-3 bg-[#342420] border border-white/5 rounded-2xl flex items-center justify-between shadow-sm">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center <?php echo $tx['tipe_transaksi'] == 'pemasukan' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'; ?>">
                                <i data-lucide="<?php echo $tx['tipe_transaksi'] == 'pemasukan' ? 'trending-up' : 'trending-down'; ?>" class="w-4 h-4"></i>
                            </div>
                            <div>
                                <h5 class="font-bold text-xs text-white max-w-[150px] truncate"><?php echo htmlspecialchars($tx['catatan'] ?? 'Setoran'); ?></h5>
                                <span class="text-[9px] text-gray-400 block mt-0.5">
                                    <?php echo htmlspecialchars($tx['metode_pembayaran']); ?> • <?php echo date('d M', strtotime($tx['created_at'])); ?>
                                </span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-xs font-bold font-mono block <?php echo $tx['tipe_transaksi'] == 'pemasukan' ? 'text-emerald-400' : 'text-gray-300'; ?>">
                                <?php echo $tx['tipe_transaksi'] == 'pemasukan' ? '+' : '-'; ?>Rp<?php echo number_format($tx['nominal'], 0, ',', '.'); ?>
                            </span>
                            <?php if ($tx['bukti_transfer']): ?>
                                <span class="text-[8px] bg-amber-500/20 text-[#FFD0C7] px-1.5 py-0.5 rounded font-mono capitalize block mt-1"><?php echo $tx['status']; ?></span>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

</div>

<!-- Include Persistent Sidebar Settings -->
<?php include '../includes/sidebar.php'; ?>

<!-- Float Setup Settings Button -->
<button onclick="toggleSettingsDrawer()" class="absolute top-[32px] right-6 p-1 bg-white/5 hover:bg-white/10 rounded-full text-[#FF8A7A] z-40">
    <i data-lucide="settings" class="w-5 h-5"></i>
</button>

<?php include '../includes/footer.php'; ?>
