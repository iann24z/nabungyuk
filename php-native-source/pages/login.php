<?php
/**
 * Login Screen PHP Native Source Code
 * NabungYuk - Aplikasi Tabungan Digital Modern
 */
require_once '../config/database.php';
require_once '../config/auth.php';

checkGuest(); // Redirect inline to dashboard if logged in

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitizeInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Email dan password wajib diisi!';
    } else {
        try {
            $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch();

            // Demonstration handles both hashed and plain password checks safely
            if ($user && ($password === $user['password'] || password_verify($password, $user['password']))) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['nama'] = $user['nama'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['foto_profile'] = $user['foto_profile'];

                header("Location: dashboard.php");
                exit();
            } else {
                $error = 'Email atau password salah!';
            }
        } catch (PDOException $e) {
            $error = 'Kesalahan sistem database: ' . $e->getMessage();
        }
    }
}

include '../includes/header.php';
?>

<div class="p-6 flex flex-col justify-center min-h-screen">
    {/* Logo Display */}
    <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#FF8A7A] to-[#FFD0C7] flex items-center justify-center shadow-lg shadow-[#FF8A7A]/20 mx-auto mb-4 scale-105">
            <i data-lucide="sparkles" class="w-8 h-8 text-[#2D1F1B]"></i>
        </div>
        <h2 class="font-display text-2xl font-extrabold text-white">Selamat Datang</h2>
        <p class="text-xs text-gray-400 mt-1">Masuk ke akun NabungYuk untuk memantau tabungan</p>
    </div>

    <!-- Alarm Notifications Feedback -->
    <?php if ($error): ?>
        <div class="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-2xl mb-5 flex items-center gap-2">
            <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
            <span><?php echo $error; ?></span>
        </div>
    <?php endif; ?>

    <!-- Login credentials interactive form -->
    <form action="login.php" method="POST" class="space-y-4">
        <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Alamat Email</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <i data-lucide="mail" class="w-4 h-4"></i>
                </div>
                <input type="email" name="email" required placeholder="name@domain.com"
                       class="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A7A]/40 transition-all font-medium"
                       value="<?php echo isset($email) ? htmlspecialchars($email) : ''; ?>">
            </div>
        </div>

        <div>
            <label class="block text-xs font-semibold text-[#FFD0C7] mb-1.5 uppercase tracking-wide">Kata Sandi</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <i data-lucide="lock" class="w-4 h-4"></i>
                </div>
                <input type="password" name="password" required placeholder="••••••••"
                       class="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A7A]/40 transition-all">
            </div>
        </div>

        <button type="submit"
                class="w-full py-4 bg-gradient-to-r from-[#FF8A7A] to-[#FFD0C7] hover:brightness-110 text-[#2B2B2B] text-sm font-bold rounded-2xl transition-all shadow-lg shadow-[#FF8A7A]/15 mt-3 hover:scale-[1.01] cursor-pointer">
            Masuk Sekarang
        </button>
    </form>

    <div class="mt-8 text-center">
        <span class="text-xs text-gray-400">Belum memiliki akun?</span>
        <a href="register.php" class="text-xs text-[#FF8A7A] font-bold hover:underline ml-1">Buat Akun Gratis</a>
    </div>

    <!-- Demo details helper -->
    <div class="mt-10 p-4 bg-[#FFF7F5]/5 border border-white/5 rounded-2xl text-xs text-gray-400">
        <p class="font-bold text-white flex items-center gap-1.5 mb-1 text-[#FF8A7A]">
            <i data-lucide="info" class="w-3.5 h-3.5"></i> Informasi Demo:
        </p>
        <p>Gunakan akun demo instan tanpa registrasi:</p>
        <div class="mt-2 font-mono flex flex-col gap-1 text-[11px] text-gray-300">
            <span>Email: <b class="text-white">demo@nabungyuk.id</b></span>
            <span>Sandi: <b class="text-white">password123</b></span>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
