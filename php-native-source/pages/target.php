<?php
/**
 * Target Celengan Goals Controller PHP Native Source Code
 * NabungYuk - Aplikasi Tabungan Digital Modern
 */
require_once '../config/database.php';
require_once '../config/auth.php';

checkAuth();

$user_id = $_SESSION['user_id'];
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama_target = sanitizeInput($_POST['nama_target'] ?? '');
    $target_nominal = floatval(sanitizeInput($_POST['target_nominal'] ?? 0));
    $deadline = sanitizeInput($_POST['deadline'] ?? '');

    if (empty($nama_target) || $target_nominal <= 0 || empty($deadline)) {
        $error = 'Judul, nominal, dan tanggal tenggat waktu target wajib dilengkapi!';
    } else {
        try {
            $stmt = $conn->prepare("INSERT INTO target_tabungan (user_id, nama_target, target_nominal, saldo_terkumpul, deadline) 
                                    VALUES (:user_id, :nama_target, :target_nominal, 0.00, :deadline)");
            
            $stmt->execute([
                'user_id' => $user_id,
                'nama_target' => $nama_target,
                'target_nominal' => $target_nominal,
                'deadline' => $deadline
            ]);

            $success = 'Target celengan anyar berhasil dikonstruksikan!';
            header("Refresh: 1.5; URL=target.php");
        } catch (PDOException $e) {
            $error = 'Gagal menyimpan target: ' . $e->getMessage();
        }
    }
}

// Fetch all targets with dynamic sums from transaksi
try {
    // We can also run an inline aggregate updates loop to make the database totals perfectly synced in this PHP endpoint:
    $sync = $conn->prepare("UPDATE target_tabungan t SET t.saldo_terkumpul = (
        SELECT IFNULL(SUM(tx.nominal), 0) FROM transaksi tx WHERE tx.user_id = :user_id AND tx.target_id = t.id AND tx.status = 'berhasil' AND tx.tipe_transaksi = 'pemasukan'
    ) WHERE t.user_id = :user_id");
    $sync->execute(['user_id' => $user_id]);

    $stmtList = $conn->prepare("SELECT * FROM target_tabungan WHERE user_id = :user_id ORDER BY deadline ASC");
    $stmtList->execute(['user_id' => $user_id]);
    $targets = $stmtList->fetchAll();
} catch (PDOException $e) {
    $targets = [];
}

include '../includes/header.php';
?>

<div class="p-6 pb-28">

    <div class="mb-6 flex justify-between items-center">
        <div>
            <h3 class="font-display font-black text-xl text-white">Target Impian</h3>
            <span class="text-xs text-gray-400 mt-1 block">Konstruksi target tabungan yang ingin Anda capai</span>
        </div>
        <a href="dashboard.php" class="text-xs text-gray-400 hover:text-white">← Dashboard</a>
    </div>

    <?php if ($error): ?>
        <div class="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-2xl mb-4 flex items-center gap-2">
            <i data-lucide="alert-circle" class="w-4 h-4"></i>
            <span><?php echo $error; ?></span>
        </div>
    <?php endif; ?>

    <?php if ($success): ?>
        <div class="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-2xl mb-4 flex items-center gap-2">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span><?php echo $success; ?></span>
        </div>
    <?php endif; ?>

    <!-- Target Creator form -->
    <div class="p-5 bg-[#342420] border border-white/5 rounded-3xl mb-8">
        <h4 class="text-xs font-bold text-[#FF8A7A] uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <i data-lucide="plus" class="w-4 h-4"></i> Buat Wadah Target Baru
        </h4>

        <form action="target.php" method="POST" class="space-y-4 text-xs font-semibold text-gray-400">
            <div>
                <label class="block text-gray-400 mb-1">Judul Impian Finansial</label>
                <input type="text" name="nama_target" required placeholder="Contoh: Liburan Raja Ampat / Beli Konsol PS6"
                       class="w-full p-3.5 bg-[#2D1F1B] border border-white/5 rounded-xl focus:outline-none text-white font-medium">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-gray-400 mb-1">Nominal Target (IDR)</label>
                    <input type="number" name="target_nominal" required placeholder="e.g. 15000000"
                           class="w-full p-3.5 bg-[#2D1F1B] border border-white/5 rounded-xl focus:outline-none text-white font-bold">
                </div>

                <div>
                    <label class="block text-gray-400 mb-1">Tenggat Waktu (Deadline)</label>
                    <input type="date" name="deadline" required
                           class="w-full p-3.5 bg-[#2D1F1B] border border-white/5 rounded-xl focus:outline-none text-white font-medium">
                </div>
            </div>

            <button type="submit"
                    class="w-full py-3.5 bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] text-[#2B2B2B] text-xs font-black rounded-xl transition-all shadow-md mt-2 uppercase tracking-wide">
                Konstruksikan Target Tabungan
            </button>
        </form>
    </div>

    <!-- Active targets list -->
    <div>
        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest pb-3">Celengan Aktif</h4>

        <?php if (empty($targets)): ?>
            <div class="p-10 border border-dashed border-white/10 rounded-3xl text-center bg-white/5">
                <i data-lucide="target" class="w-8 h-8 text-[#FF8A7A] mx-auto opacity-30 mb-2"></i>
                <h5 class="text-xs font-bold text-gray-300">Belum memiliki target terdaftar</h5>
                <p class="text-[10px] text-gray-500 mt-0.5">Mulai isi formulir di atas untuk mengumpulkan celengan impian Anda!</p>
            </div>
        <?php else: ?>
            <div class="space-y-4">
                <?php foreach ($targets as $tgt): 
                    $percent = $tgt['target_nominal'] > 0 ? round(($tgt['saldo_terkumpul'] / $tgt['target_nominal']) * 100) : 0;
                ?>
                    <div class="bg-white/5 border border-white/5 rounded-3xl p-5 relative overflow-hidden shadow">
                        <div class="flex gap-3.5 items-start">
                            <div class="w-9 h-9 rounded-xl bg-[#FFEAE5] text-[#FF8A7A] flex items-center justify-center">
                                <i data-lucide="award" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-sm text-white"><?php echo htmlspecialchars($tgt['nama_target']); ?></h4>
                                <span class="text-[9px] text-gray-400 block mt-0.5">Tempo: <?php echo date('d F Y', strtotime($tgt['deadline'])); ?></span>
                            </div>
                        </div>

                        <!-- Progress indicator slider -->
                        <div class="mt-4">
                            <div class="flex justify-between items-center text-xs font-bold text-gray-400 mb-1.5">
                                <span>Terkumpul: <strong class="text-white">Rp<?php echo number_format($tgt['saldo_terkumpul'], 0, ',', '.'); ?></strong></span>
                                <span class="text-[#FF8A7A]"><?php echo $percent; ?>%</span>
                            </div>

                            <div class="w-full bg-[#FFEAE5]/10 h-2 rounded-full overflow-hidden">
                                <div class="bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] h-full rounded-full transition-all" style="width: <?php echo min(100, $percent); ?>%"></div>
                            </div>

                            <div class="flex justify-between items-center text-[9px] text-gray-500 mt-2 font-mono">
                                <span>Goal: Rp<?php echo number_format($tgt['target_nominal'], 0, ',', '.'); ?></span>
                                <a href="transaksi.php?action=add" class="text-[#FFD0C7] hover:underline font-bold">Celengi Sekarang →</a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

</div>

<?php include '../includes/footer.php'; ?>
