<?php
/**
 * Database Connection Setup (PDO)
 * NabungYuk - Aplikasi Tabungan Digital Modern
 */

$host = 'localhost';
$db_name = 'tabungan_app';
$username = 'root';
$password = ''; // Default localhost password

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    // Set response attributes for secure exception throwing
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Koneksi database gagal: " . $e->getMessage());
}
?>
