<?php
/**
 * Register Screen PHP Native Source Code
 * NabungYuk - Aplikasi Tabungan Digital Modern
 */
require_once '../config/database.php';
require_once '../config/auth.php';

checkGuest();

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama = sanitizeInput($_POST['nama'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if (empty($nama) || empty($email) || empty($password)) {
        $error = 'Semua kolom wajib diisi!';
    } elseif ($password !== $confirm_password) {
        $error = 'Konfirmasi kata sandi tidak cocok!';
    } else {
        try {
            // Check if email already registered
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
            $stmt->execute(['email' => $email]);
            if ($stmt->fetch()) {
                $error = 'Email ini sudah terdaftar!';
            } else {
                // Securely hash password
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                
                // Demo profile icon selection
                $profile_pics = [
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
                ];
                $pic = $profile_pics[array_rand($profile_pics)];

                // Insert into SQL table
                $insert = $conn->prepare("INSERT INTO users (nama, email, password, foto_profile) VALUES (:nama, :email, :password, :pic)");
                $insert->execute([
                    'nama' => $nama,
                    'email' => $email,
                    'password' => $hashedPassword,
                    'pic' => $pic
                ]);

                $success = 'Pendaftaran akun berhasil! Silakan masuk.';
                header("Refresh: 2; URL=login.php");
            }
        } catch (PDOException $e) {
            $error = 'Gagal mendaftarkan akun: ' . $e->getMessage();
        }
    }
}

include '../includes/header.php';
?>

<div class="p-6 flex flex-col justify-center min-h-screen">
    <div class="text-center mb-6">
        <div class="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#FF8A7A] to-[#FFD0C7] flex items-center justify-center shadow-lg shadow-[#FF8A7A]/20 mx-auto mb-4">
            <i data-lucide="user-plus" class="w-8 h-8 text-[#2D1F1B]"></i>
        </div>
        <h2 class="font-display text-2xl font-extrabold text-white">Buat Akun Baru</h2>
        <p class="text-xs text-gray-400 mt-1">Gabung NabungYuk dan capai target keuanganmu</p>
    </div>

    <!-- Alert notifications -->
    <?php if ($error): ?>
        <div class="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-2xl mb-4 flex items-center gap-2">
            <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
            <span><?php echo $error; ?></span>
        </div>
    <?php endif; ?>

    <?php if ($success): ?>
        <div class="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-2xl mb-4 flex items-center gap-2">
            <i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i>
            <span><?php echo $success; ?></span>
        </div>
    <?php endif; ?>

    <form action="register.php" method="POST" class="space-y-4">
        <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">Nama Lengkap</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <i data-lucide="user" class="w-4 h-4"></i>
                </div>
                <input type="text" name="nama" required placeholder="John Doe"
                       class="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A7A]/40 transition-all font-medium"
                       value="<?php echo isset($nama) ? htmlspecialchars($nama) : ''; ?>">
            </div>
        </div>

        <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">Alamat Email</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <i data-lucide="mail" class="w-4 h-4"></i>
                </div>
                <input type="email" name="email" required placeholder="john@example.com"
                       class="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A7A]/40 transition-all font-medium"
                       value="<?php echo isset($email) ? htmlspecialchars($email) : ''; ?>">
            </div>
        </div>

        <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">Kata Sandi</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <i data-lucide="lock" class="w-4 h-4"></i>
                </div>
                <input type="password" name="password" required placeholder="Konstruksi min. 8 karakter"
                       class="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A7A]/40 transition-all">
            </div>
        </div>

        <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">Ulangi Kata Sandi</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <i data-lucide="shield-check" class="w-4 h-4"></i>
                </div>
                <input type="password" name="confirm_password" required placeholder="••••••••"
                       class="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A7A]/40 transition-all">
            </div>
        </div>

        <button type="submit"
                class="w-full py-3.5 bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] hover:brightness-110 text-[#2B2B2B] text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#FF8A7A]/15 mt-2 cursor-pointer">
            Registrasi Bebas Biaya
        </button>
    </form>

    <div class="mt-6 text-center">
        <span class="text-xs text-gray-400">Sudah bergabung sebelumnya?</span>
        <a href="login.php" class="text-xs text-[#FF8A7A] font-bold hover:underline ml-1">Log masuk disini</a>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
