-- Database: tabungan_app
-- Created for NabungYuk (Financial Savings App)

CREATE DATABASE IF NOT EXISTS `tabungan_app` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tabungan_app`;

-- 1. Table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `foto_profile` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table `kategori`
DROP TABLE IF EXISTS `kategori`;
CREATE TABLE `kategori` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_kategori` VARCHAR(50) NOT NULL,
  `icon` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table `transaksi`
DROP TABLE IF EXISTS `transaksi`;
CREATE TABLE `transaksi` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `tipe_transaksi` ENUM('pemasukan', 'pengeluaran') NOT NULL,
  `nominal` DECIMAL(15, 2) NOT NULL,
  `metode_pembayaran` VARCHAR(50) NOT NULL,
  `catatan` TEXT DEFAULT NULL,
  `bukti_transfer` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('pending', 'berhasil', 'gagal') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table `target_tabungan`
DROP TABLE IF EXISTS `target_tabungan`;
CREATE TABLE `target_tabungan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `nama_target` VARCHAR(100) NOT NULL,
  `target_nominal` DECIMAL(15, 2) NOT NULL,
  `saldo_terkumpul` DECIMAL(15, 2) DEFAULT 0.00,
  `deadline` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default categories for general transactions
INSERT INTO `kategori` (`nama_kategori`, `icon`) VALUES
('Holiday', 'plane'),
('Food', 'utensils'),
('Utilities', 'file-text'),
('Coffee', 'coffee'),
('Shopping', 'shopping-bag'),
('Salary', 'dollar-sign'),
('Others', 'help-circle');
