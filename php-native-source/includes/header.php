<?php
/**
 * Shared Header Template
 * NabungYuk - Aplikasi Tabungan Digital Modern
 */
require_once dirname(__DIR__) . '/config/auth.php';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NabungYuk - Digital Fintech Mobile Suite</title>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS (for modern UI utility references) -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <style>
        :root {
            --primary: #FF8A7A;
            --secondary: #FFD0C7;
            --dark-bg: #2D1F1B;
            --card-light: #FFF7F5;
            --text-dark: #2B2B2B;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--dark-bg);
            color: var(--card-light);
            min-height: 100vh;
        }

        h1, h2, h3, .heading-font {
            font-family: 'Outfit', sans-serif;
        }

        /* Glassmorphism utility card */
        .glass-card {
            background: rgba(255, 247, 245, 0.08);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 247, 245, 0.1);
        }

        /* Premium Soft Coral Gradient card */
        .coral-gradient {
            background: linear-gradient(135deg, #FF8A7A 0%, #FFD0C7 100%);
            color: var(--text-dark);
        }
        
        /* Thin scrollbar design */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(45, 31, 27, 0.5);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(255, 138, 122, 0.3);
            border-radius: 3px;
        }
    </style>
</head>
<body class="bg-[#2D1F1B] selection:bg-[#FF8A7A] selection:text-white">

<!-- Main Wrapper mimicking modern mobile-first orientation or desktop fluid viewport -->
<div class="flex flex-col min-height-screen max-w-md mx-auto bg-[#2D1F1B] border-x border-[#3E2D28] min-h-screen relative shadow-2xl">
