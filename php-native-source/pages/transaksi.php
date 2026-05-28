<?php
/**
 * Transactions and Saving Controller PHP Native Source Code
 * NabungYuk - Aplikasi Tabungan Digital Modern
 */
require_once '../config/database.php';
require_once '../config/auth.php';

checkAuth();

$user_id = $_SESSION['user_id'];
$error = '';
$success = '';

// Check which sub-action to render
$action = $_GET['action'] ?? 'list';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'add') {
    $tipe_transaksi = sanitizeInput($_POST['tipe_transaksi'] ?? 'pemasukan');
    $nominal = Number_get(sanitizeInput($_POST['nominal'] ?? 0));
    $metode_pembayaran = sanitizeInput($_POST['metode_pembayaran'] ?? 'QRIS NabungYuk');
    $catatan = sanitizeInput($_POST['catatan'] ?? '');
    $target_id = sanitizeInput($_POST['target_id'] ?? '');

    if ($nominal <= 0) {
        $error = 'Nominal transaksi wajib diisi dan bernilai positif!';
    } else {
        // Upload photo proof manually if QRIS payment
        $bukti_transfer = null;
        if (isset($_FILES['bukti_transfer'])) {
            $bukti_transfer = uploadImage($_FILES['bukti_transfer'], '../uploads/');
        }

        // Digital transfers default to 'pending' state, whereas local ones default to 'berhasil'
        $isDigital = (stripos($metode_pembayaran, 'qris') !== false || stripos($metode_pembayaran, 'transfer') !== false);
        $status = ($isDigital && $bukti_transfer) ? 'pending' : 'berhasil';

        try {
            $stmt = $conn->prepare("INSERT INTO transaksi (user_id, tipe_transaksi, nominal, metode_pembayaran, catatan, bukti_transfer, status, target_id) 
                                    VALUES (:user_id, :tipe_transaksi, :nominal, :metode_pembayaran, :catatan, :bukti_transfer, :status, :target_id)");
            
            $stmt->execute([
                'user_id' => $user_id,
                'tipe_transaksi' => $tipe_transaksi,
                'nominal' => $nominal,
                'metode_pembayaran' => $metode_pembayaran,
                'catatan' => $catatan,
                'bukti_transfer' => $bukti_transfer,
                'status' => $status,
                'target_id' => !empty($target_id) ? (int)$target_id : null
            ]);

            // If success, recalculate targets collected sum inline
            if ($status === 'berhasil' && !empty($target_id)) {
                $subQuery = $conn->prepare("SELECT SUM(nominal) AS total FROM transaksi WHERE user_id = :user_id AND target_id = :target_id AND status = 'berhasil'");
                $subQuery->execute(['user_id' => $user_id, 'target_id' => (int)$target_id]);
                $sumCollected = $subQuery->fetch()['total'] ?? 0;

                $updateTg = $conn->prepare("UPDATE target_tabungan SET saldo_terkumpul = :saldo WHERE id = :id");
                $updateTg->execute(['saldo' => $sumCollected, 'id' => (int)$target_id]);
            }

            $success = 'Transaksi berhasil didaftarkan!';
            header("Refresh: 1.5; URL=dashboard.php");
        } catch (PDOException $e) {
            $error = 'Kesalahan saat menyimpan: ' . $e->getMessage();
        }
    }
}

// Fetch user targets for select input
try {
    $stmtT = $conn->prepare("SELECT * FROM target_tabungan WHERE user_id = :user_id");
    $stmtT->execute(['user_id' => $user_id]);
    $targets_list = $stmtT->fetchAll();
} catch (PDOException $e) {
    $targets_list = [];
}

function Number_get($str) {
    return floatval(preg_replace('/[^0-9]/', '', $str));
}

include '../includes/header.php';
?>

<div class="p-6 pb-28">

    <?php if ($action === 'add'): ?>
        <!-- 1. ADD TRANSACTION VIEW -->
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-display font-extrabold text-xl text-white">Buat Setoran Baru</h3>
            <a href="dashboard.php" class="text-xs text-gray-400 hover:text-white">← Batalkan</a>
        </div>

        <?php if ($error): ?>
            <div class="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-2xl mb-4 flex items-center gap-2">
                <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
                <span><?php echo $error; ?></span>
            </div>
        <?php endif; ?>

        <?php if ($success): ?>
            <div class="bg-[#FF8A7A]/10 border border-[#FF8A7A]/20 text-[#FFD0C7] text-xs p-3.5 rounded-2xl mb-4 flex items-center gap-2">
                <i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i>
                <span><?php echo $success; ?></span>
            </div>
        <?php endif; ?>

        <!-- QRIS quick reference card -->
        <div class="p-4 bg-[#342420] border border-white/5 rounded-2xl mb-6 relative">
            <h4 class="text-xs font-bold text-[#FF8A7A] flex items-center gap-1.5 mb-1">
                <i data-lucide="qr-code" class="w-4 h-4"></i> Scan dan Setor Instan
            </h4>
            <p class="text-[10px] text-gray-400 leading-normal">
                Pindai QRIS NabungYuk melalui e-wallet Anda sebelum mengirim verifikasi di bawah untuk penyisihan tabungan otomatis.
            </p>
        </div>

        <!-- Form save transaction -->
        <form action="transaksi.php?action=add" method="POST" enctype="multipart/form-data" class="space-y-4 text-xs font-semibold text-gray-400">
            <div>
                <label class="block text-gray-400 mb-1">Tipe Alir Dana</label>
                <div class="grid grid-cols-2 gap-2">
                    <label class="bg-white/5 border border-white/5 rounded-xl p-3.5 flex items-center gap-2 cursor-pointer text-white">
                        <input type="radio" name="tipe_transaksi" value="pemasukan" checked class="accent-[#FF8A7A]">
                        <span>Simpanan (Masuk)</span>
                    </label>
                    <label class="bg-white/5 border border-white/5 rounded-xl p-3.5 flex items-center gap-2 cursor-pointer text-white">
                        <input type="radio" name="tipe_transaksi" value="pengeluaran" class="accent-[#FF8A7A]">
                        <span>Belanja (Keluar)</span>
                    </label>
                </div>
            </div>

            <div>
                <label class="block text-gray-400 mb-1">Hubungkan Saku Target (Opsional)</label>
                <select name="target_id" class="w-full p-4 bg-white/5 border border-white/5 rounded-xl focus:outline-none text-white font-medium">
                    <option value="" class="bg-[#2D1F1B]">Tabungan Utama (Bebas Belanja)</option>
                    <?php foreach ($targets_list as $tgt): ?>
                        <option value="<?php echo $tgt['id']; ?>" class="bg-[#2D1F1B]">
                            <?php echo htmlspecialchars($tgt['nama_target']); ?> (Goal: Rp<?php echo number_format($tgt['target_nominal'], 0); ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-gray-400 mb-1">Nominal (Rupiah)</label>
                    <input type="number" name="nominal" required placeholder="Contoh: 250000"
                           class="w-full p-4 bg-white/5 border border-white/5 rounded-xl focus:outline-none text-white font-bold placeholder-gray-600">
                </div>

                <div>
                    <label class="block text-gray-400 mb-1">Situs Pembayaran</label>
                    <select name="metode_pembayaran" class="w-full p-4 bg-white/5 border border-white/5 rounded-xl text-white">
                        <option value="QRIS NabungYuk" class="bg-[#211512]">QRIS NabungYuk</option>
                        <option value="Transfer BCA" class="bg-[#211512]">Transfer BCA</option>
                        <option value="Transfer Mandiri" class="bg-[#211512]">Transfer Mandiri</option>
                        <option value="Tunai" class="bg-[#211512]">Simpanan Tunai</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-gray-400 mb-1">Catatan Tambahan</label>
                <input type="text" name="catatan" required placeholder="e.g. Setoran rutin holiday Raja ampat"
                       class="w-full p-4 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-600">
            </div>

            <div>
                <label class="block text-gray-400 mb-1">Bukti SS Transfer Pembayaran (Opsional)</label>
                <div class="border border-dashed border-white/10 rounded-xl p-4 text-center bg-white/5 relative">
                    <input type="file" name="bukti_transfer" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">
                    <i data-lucide="image-plus" class="w-6 h-6 text-[#FF8A7A] mx-auto mb-1"></i>
                    <span class="text-[10px] text-gray-400 block font-medium">Klik atau seret file struk kesini</span>
                </div>
            </div>

            <button type="submit"
                    class="w-full py-4 bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] text-[#2B2B2B] text-xs font-black rounded-xl transition-all shadow-lg select-none uppercase tracking-wider">
                Verifikasi & Simpan Tabungan
            </button>
        </form>

    <?php else: ?>
        <!-- 2. DEFAULT TRANSACTIONS LEDGER LIST VIEW -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h3 class="font-display font-extrabold text-xl text-white">Seluruh Ledger</h3>
                <span class="text-xs text-gray-400 mt-1 block">Log historis keluar-masuk celengan virtual</span>
            </div>
            <a href="transaksi.php?action=add" class="py-2.5 px-4 bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] text-[#2B2B2B] font-bold text-xs rounded-xl shadow">+ Tambah</a>
        </div>

        <?php
        // Fetch all transactions for ledger view
        try {
            $stmtAll = $conn->prepare("SELECT * FROM transaksi WHERE user_id = :user_id ORDER BY created_at DESC");
            $stmtAll->execute(['user_id' => $user_id]);
            $all_tx = $stmtAll->fetchAll();
        } catch (PDOException $e) {
            $all_tx = [];
        }
        ?>

        <?php if (empty($all_tx)): ?>
            <div class="p-16 border border-dashed border-white/10 rounded-3xl text-center bg-white/5">
                <i data-lucide="award" class="w-8 h-8 text-[#FF8A7A] mx-auto mb-2 opacity-50"></i>
                <h5 class="text-xs font-bold text-gray-300">Belum ada aktivitas tabungan</h5>
            </div>
        <?php else: ?>
            <div class="space-y-3">
                <?php foreach ($all_tx as $tx): ?>
                    <div class="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center shadow">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center <?php echo $tx['tipe_transaksi'] == 'pemasukan' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'; ?>">
                                <i data-lucide="<?php echo $tx['tipe_transaksi'] == 'pemasukan' ? 'plus' : 'minus'; ?>" class="w-4 h-4"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-xs text-white"><?php echo htmlspecialchars($tx['catatan'] ?? 'Setoran'); ?></h4>
                                <span class="text-[9px] text-gray-500 block mt-1">
                                    <?php echo htmlspecialchars($tx['metode_pembayaran']); ?> • <?php echo date('d F Y', strtotime($tx['created_at'])); ?>
                                </span>
                            </div>
                        </div>

                        <div class="text-right">
                            <span class="text-xs font-bold font-mono <?php echo $tx['tipe_transaksi'] == 'pemasukan' ? 'text-emerald-400' : 'text-gray-350'; ?>">
                                <?php echo $tx['tipe_transaksi'] == 'pemasukan' ? '+' : '-'; ?>Rp<?php echo number_format($tx['nominal'], 0, ',', '.'); ?>
                            </span>
                            <?php if ($tx['bukti_transfer']): ?>
                                <span class="text-[8px] mt-1 bg-[#FF8A7A]/10 text-[#FFD0C7] rounded px-1 py-0.5 capitalize block font-mono"><?php echo $tx['status']; ?></span>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

    <?php endif; ?>

</div>

<?php include '../includes/footer.php'; ?>
