<?php
/**
 * Authentication Middleware and Security Utilities
 * NabungYuk - Aplikasi Tabungan Digital Modern
 */

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

/**
 * Checks if user is logged in. Redirects to login if false.
 */
function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        header("Location: login.php");
        exit();
    }
}

/**
 * Checks if user is already logged in (used on login/register pages)
 */
function checkGuest() {
    if (isset($_SESSION['user_id'])) {
        header("Location: dashboard.php");
        exit();
    }
}

/**
 * Secures form input data from XSS injections
 */
function sanitizeInput($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

/**
 * Upload profile picture or transaction proof safely
 */
function uploadImage($file, $targetDir = '../uploads/') {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $fileName = basename($file['name']);
    $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $allowedTypes = ['jpg', 'png', 'jpeg', 'gif'];

    if (!in_array($fileType, $allowedTypes)) {
        return null; // Invalid ext
    }

    $uniqueName = uniqid("IMG_", true) . '.' . $fileType;
    $targetFilePath = $targetDir . $uniqueName;

    if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
        return $uniqueName;
    }

    return null;
}
?>
