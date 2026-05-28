<?php
/**
 * Slide-out Optional Settings Drawer
 * NabungYuk - Aplikasi Tabungan Digital Modern
 */
?>
<div id="settingsDrawer" class="fixed inset-y-0 right-0 z-50 w-80 max-w-full bg-[#201512] border-l border-[#3E2D28] shadow-2xl translate-x-full transition-transform duration-300 ease-in-out">
    <div class="p-6 h-full flex flex-col justify-between">
        <div>
            <div class="flex justify-between items-center pb-6 border-b border-[#3E2D28]">
                <h3 class="text-xl font-bold text-[#FF8A7A] flex items-center gap-2">
                    <i data-lucide="settings" class="w-5 h-5"></i> Settings
                </h3>
                <button onclick="toggleSettingsDrawer()" class="p-1 hover:bg-[#FFE0DB]/10 rounded-full text-gray-400 hover:text-white">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- Profile Overview -->
            <?php if(isset($_SESSION['nama'])): ?>
            <div class="mt-6 flex items-center gap-4 bg-[#FFF7F5]/5 p-4 rounded-2xl border border-[#FFF7F5]/10">
                <img src="<?php echo $_SESSION['foto_profile'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'; ?>" class="w-12 h-12 rounded-full object-cover border border-[#FF8A7A]">
                <div>
                    <h4 class="font-bold text-white"><?php echo $_SESSION['nama']; ?></h4>
                    <p class="text-xs text-gray-400"><?php echo $_SESSION['email']; ?></p>
                </div>
            </div>
            <?php endif; ?>

            <!-- Setting Options List -->
            <div class="mt-8 space-y-4">
                <button onclick="alert('Fitur Dark Mode telah aktif secara default (Aesthetic Brown Soft)!')" class="w-full flex items-center justify-between p-3.5 hover:bg-[#FFF7F5]/5 rounded-xl text-left transition-all">
                    <span class="flex items-center gap-3 text-sm text-gray-300">
                        <i data-lucide="moon" class="w-4 h-4 text-[#FF8A7A]"></i> Dark Mode (Default)
                    </span>
                    <span class="text-xs bg-[#FF8A7A]/20 text-[#FF8A7A] px-2.5 py-1 rounded-full font-bold">ON</span>
                </button>

                <a href="target.php" class="w-full flex items-center justify-between p-3.5 hover:bg-[#FFF7F5]/5 rounded-xl text-left transition-all">
                    <span class="flex items-center gap-3 text-sm text-gray-300">
                        <i data-lucide="award" class="w-4 h-4 text-[#FF8A7A]"></i> Capai Target Tabungan
                    </span>
                    <i data-lucide="chevron-right" class="w-4 h-4 text-gray-500"></i>
                </a>

                <button onclick="alert('Unduh file tabungan_app.sql dari folder root untuk mengimpor ke MySQL local Anda.')" class="w-full flex items-center justify-between p-3.5 hover:bg-[#FFF7F5]/5 rounded-xl text-left transition-all">
                    <span class="flex items-center gap-3 text-sm text-gray-300">
                        <i data-lucide="database" class="w-4 h-4 text-[#FF8A7A]"></i> Export Database SQL
                    </span>
                    <i data-lucide="download" class="w-4 h-4 text-gray-500"></i>
                </button>
            </div>
        </div>

        <div class="pt-6 border-t border-[#3E2D28] text-center">
            <span class="text-xs text-gray-500">NabungYuk Premium Suite v1.1.0</span>
        </div>
    </div>
</div>

<script>
function toggleSettingsDrawer() {
    const drawer = document.getElementById('settingsDrawer');
    if (drawer.classList.contains('translate-x-full')) {
        drawer.classList.remove('translate-x-full');
    } else {
        drawer.classList.add('translate-x-full');
    }
}
</script>
