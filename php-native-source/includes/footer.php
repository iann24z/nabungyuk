</div> <!-- Closer for mobile wrapper -->

<!-- Bottom Navigation for NabungYuk Mobile Suite -->
<?php if(isset($_SESSION['user_id'])): ?>
<div class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm glass-card rounded-full p-2.5 z-40 flex justify-around items-center border border-[#FFD0C7]/20 shadow-xl">
    <a href="dashboard.php" class="flex flex-col items-center gap-1 text-[#FF8A7A]">
        <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
        <span class="text-[10px] font-medium">Dashboard</span>
    </a>
    
    <a href="transaksi.php?action=add" class="w-12 h-12 bg-[#FF8A7A] hover:bg-[#FFD0C7] text-white hover:text-[#2B2B2B] rounded-full flex items-center justify-center -translate-y-4 shadow-lg transition-transform duration-300 hover:scale-105">
        <i data-lucide="plus" class="w-6 h-6"></i>
    </a>

    <a href="target.php" class="flex flex-col items-center gap-1 text-gray-400 hover:text-[#FF8A7A] transition-colors">
        <i data-lucide="target" class="w-5 h-5"></i>
        <span class="text-[10px]">Target</span>
    </a>
    
    <a href="logout.php" class="flex flex-col items-center gap-1 text-red-400 hover:text-red-500 transition-colors">
        <i data-lucide="log-out" class="w-5 h-5"></i>
        <span class="text-[10px]">Log out</span>
    </a>
</div>
<?php endif; ?>

<!-- Initialize Lucide Icons -->
<script>
    lucide.createIcons();
</script>

</body>
</html>
