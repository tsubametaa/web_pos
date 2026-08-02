# 🛒 POS (Point of Sale) System — Monorepo

[![Bun](https://img.shields.io/badge/Bun-v1.2.19-black?logo=bun)](https://bun.sh)
[![Svelte 5](https://img.shields.io/badge/Svelte-v5.56-FF3E00?logo=svelte)](https://svelte.dev)
[![ElysiaJS](https://img.shields.io/badge/Elysia-v1.4-FD434C?logo=elysia)](https://elysiajs.com)
[![Turborepo](https://img.shields.io/badge/Turborepo-v2.10-EF4444?logo=turborepo)](https://turbo.build)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-v0.45-C5F74F?logo=drizzle)](https://orm.drizzle.team)
[![Turso DB](https://img.shields.io/badge/Turso_DB-LibSQL-44505B?logo=turso)](https://turso.tech)

Sistem Kasir (Point of Sale) modern, performan, dan responsif berbasis Monorepo yang dirancang khusus untuk kebutuhan toko retail, usaha mikro, kecil, dan menengah (UMKM), maupun bisnis F&B. Sistem ini menggabungkan frontend web super cepat berbasis Svelte 5 (Runes) dan backend API berkecepatan tinggi berbasis Bun & ElysiaJS.

---

## 📋 Daftar Isi

- [✨ Fitur-Fitur Utama](#-fitur-fitur-utama)
- [🏗️ Arsitektur Sistem & Workflow](#️-arsitektur-sistem--workflow)
  - [1. Diagram Arsitektur Monorepo](#1-diagram-arsitektur-monorepo)
  - [2. Diagram Skema Database (ERD)](#2-diagram-skema-database-erd)
  - [3. Diagram Alur Transaksi Kasir](#3-diagram-alur-transaksi-kasir)
- [💻 Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [📁 Struktur Monorepo](#-struktur-monorepo)
- [🚀 Panduan Instalasi & Pengoperasian](#-panduan-instalasi--pengoperasian)
  - [Prasyarat](#prasyarat)
  - [Langkah-Langkah Installation](#langkah-langkah-installation)
  - [Konfigurasi Environment (`.env`)](#konfigurasi-environment-env)
- [🛠️ Perintah CLI (Scripts Reference)](#️-perintah-cli-scripts-reference)
- [🔒 Keamanan & Sanitasi Input](#-keamanan--sanitasi-input)
- [🤝 Kontribusi & Lisensi](#-kontribusi--lisensi)

---

## ✨ Fitur-Fitur Utama

### 1. 🖥️ Modul Kasir & Transaksi (Point of Sale)
- **Katalog Interaktif & Pencarian Cepat**: Pencarian produk berbasis judul/SKU dengan pencarian fuzzy instan (*Fuse.js*).
- **Keranjang Belanja Real-Time**: Perhitungan subtotal, jumlah item, kembalian, dan pajak secara otomatis tanpa *delay*.
- **Opsi Pembayaran Fleksibel**: Mendukung metode pembayaran Tunai (*Cash*), Transfer Bank, QRIS, dan metode kustom lainnya.
- **Cetak & Cetak Ulang Struk**: Cetak struk belanja fisik atau pratinjau struk digital dengan ringkasan transaksi transparan.
- **Batalkan Transaksi (*Void*)**: Manajemen status transaksi completed atau voided untuk akurasi audit.

### 2. 📦 Inventori, Produk & Kalkulator HPP
- **Manajemen Produk (CRUD)**: Pengelolaan nama produk, SKU unik, kategori, satuan (Pcs, Kg, Box), dan foto produk.
- **Peringatan Stok Minimum**: Deteksi otomatis produk dengan stok di bawah ambang batas (*Low Stock Threshold*).
- **Kalkulator HPP (Harga Pokok Penjualan)**: Perhitungan estimasi keuntungan/margin bersih per item berdasarkan harga modal dan harga jual.

### 3. 📊 Dashboard & Analytics
- **Statistik Penjualan**: Menampilkan Omset Total, Keuntungan Bersih (Profit), Jumlah Transaksi, dan Item Terjual.
- **Grafik Tren Penjualan**: Visualisasi performa pendapatan harian/mingguan/bulanan.
- **Notifikasi Stok Menipis**: Banner peringatan dini untuk *restock* produk yang hampir habis.

### 4. 🏪 Etalase Digital (Customer Showcase)
- Catalog publik yang dapat dilihat oleh pelanggan untuk menjelajahi ketersediaan produk dan harga toko secara online.

### 5. ⚙️ Pengaturan Toko & Keamanan
- Profil Bisnis (Nama Toko, Alamat, Nomor Telepon, Simbol Mata Uang IDR).
- Pengaturan Tarif Pajak (%) & Catatan Kaki pada Struk (*Receipt Footer*).
- Pengaman Autentikasi Pengelola / Owner dengan enkripsi kata sandi `bcryptjs`.

---

## 🏗️ Arsitektur Sistem & Workflow

### 1. Diagram Arsitektur Monorepo

Diagram di bawah ini menggambarkan alur interaksi antara komponen Frontend, Backend API, dan Database Layer dalam struktur Monorepo Turborepo:

```mermaid
graph TD
    subgraph Client ["Client Layer"]
        User["👨‍💼 Kasir / Pelanggan"]
        Browser["🌐 Web Browser / POS Terminal"]
    end

    subgraph Frontend ["Apps: Frontend (apps/web)"]
        SvelteApp["⚡ Svelte 5 + Vite App"]
        TailwindCSS["🎨 Tailwind CSS v4"]
        FuseJS["🔍 Fuse.js (Fuzzy Search)"]
        LucideIcons["🎨 Lucide Icons"]
    end

    subgraph Backend ["Apps: Backend API (apps/api)"]
        ElysiaServer["🦊 ElysiaJS Server (Bun Runtime)"]
        Sanitizer["🛡️ Middleware Sanitizer"]
        CORS["🔒 Cors Middleware"]
        
        subgraph Modules ["Controllers & Services"]
            AuthMod["🔑 Auth Module"]
            ProdMod["📦 Products & HPP Module"]
            TxMod["💳 Transactions Module"]
            DashMod["📊 Dashboard Module"]
            EtalaseMod["🏪 Etalase Module"]
            UploadMod["🖼️ Uploads Module"]
        end
    end

    subgraph Database ["Database Layer"]
        DrizzleORM["⚡ Drizzle ORM"]
        TursoDB[("🗄️ Turso DB / LibSQL SQLite")]
    end

    User --> Browser
    Browser -->|User Actions| SvelteApp
    SvelteApp -->|REST API Requests| ElysiaServer
    
    ElysiaServer --> Sanitizer
    Sanitizer --> CORS
    CORS --> AuthMod
    CORS --> ProdMod
    CORS --> TxMod
    CORS --> DashMod
    CORS --> EtalaseMod
    CORS --> UploadMod

    AuthMod --> DrizzleORM
    ProdMod --> DrizzleORM
    TxMod --> DrizzleORM
    DashMod --> DrizzleORM
    EtalaseMod --> DrizzleORM
    
    DrizzleORM --> TursoDB
```

---

### 2. Diagram Skema Database (ERD)

Struktur tabel database SQLite/LibSQL yang dikelola melalui **Drizzle ORM**:

```mermaid
erDiagram
    USERS {
        int id PK "Auto Increment"
        string email UK "Unique"
        string password_hash
        string business_name
        timestamp created_at
        timestamp updated_at
    }

    SETTINGS {
        string id PK "UUID"
        string business_name
        string business_address
        string business_phone
        string currency "Default: IDR"
        string currency_symbol "Default: Rp"
        int low_stock_threshold "Default: 10"
        real tax_rate "Percentage"
        string receipt_footer
        string owner_password_hash
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        string id PK "UUID"
        string name
        string sku UK "Unique SKU Code"
        string category
        string unit
        int cost_price "Harga Modal (HPP)"
        int selling_price "Harga Jual"
        int stock "Stok Tersedia"
        int min_stock "Batas Stok Minimum"
        string image_url
        boolean is_active "Status Aktif"
        string notes
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTIONS {
        string id PK "UUID"
        string transaction_code UK "Unique TRX Code"
        int total_amount "Total Harga Jual"
        int total_cost "Total HPP Modal"
        int profit "Keuntungan Bersih"
        string payment_method "cash | transfer | qris | other"
        int amount_paid "Jumlah Uang Dibayar"
        int change "Kembalian"
        string notes
        string status "completed | voided"
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTION_ITEMS {
        string id PK "UUID"
        string transaction_id FK
        string product_id FK
        string product_name
        string sku
        int qty "Jumlah Dibeli"
        int cost_price "HPP saat Transaksi"
        int selling_price "Harga Jual saat Transaksi"
        int subtotal
    }

    TRANSACTIONS ||--|{ TRANSACTION_ITEMS : "memiliki"
    PRODUCTS ||--o{ TRANSACTION_ITEMS : "dicatat pada"
```

---

### 3. Diagram Alur Transaksi Kasir

Proses transaksi kasir dari penambahan item hingga pencetakan struk dan pembaruan stok:

```mermaid
sequenceDiagram
    autonumber
    actor Kasir as 👨‍💼 Kasir
    participant Web as 💻 Frontend (Svelte 5)
    participant API as 🦊 Elysia API (Bun)
    participant DB as 🗄️ Database (Drizzle/Turso)

    Kasir->>Web: 1. Pilih Produk & Atur Jumlah (Qty)
    Web->>Web: 2. Hitung Subtotal, Total, Pajak & Kembalian
    Kasir->>Web: 3. Klik "Bayar" & Masukkan Nominal Uang
    Web->>API: 4. POST /api/transactions (Items, PaymentMethod, AmountPaid)
    
    activate API
    API->>API: 5. Sanitasi Payload Input
    API->>DB: 6. Cek Ketersediaan Stok Produk
    alt Stok Tidak Cukup
        DB-->>API: Stok Kurang
        API-->>Web: 400 Bad Request (Stok Tidak Mencukupi)
        Web-->>Kasir: Tampilkan Alert Gagal Transaksi
    else Stok Cukup
        API->>DB: 7. Simpan Transaksi & Transaction Items
        API->>DB: 8. Potong (Update) Stok Produk Terkait
        DB-->>API: Transaksi Sukses Disimpan
        API-->>Web: 200 OK (Data Transaksi & Struk Code)
        deactivate API
        Web->>Kasir: 9. Tampilkan Modal Struk + Pop-up Confetti 🎉
        Kasir->>Web: 10. Cetak Struk Belanja (Print Receipt)
    end
```

---

## 💻 Teknologi yang Digunakan

### Frontend (`apps/web`)
- **Framework**: [Svelte 5](https://svelte.dev) dengan Runes state management (`$state`, `$derived`, `$effect`).
- **Build Tool**: [Vite 8](https://vitejs.dev).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com).
- **Ikon**: [Lucide Svelte](https://lucide.dev).
- **Utilitas**: [Fuse.js](https://fusejs.io) (Fuzzy Search) & [Canvas Confetti](https://github.com/catdad/canvas-confetti) (Visual Feedback).

### Backend (`apps/api`)
- **Runtime**: [Bun Runtime v1.2+](https://bun.sh) untuk eksekusi server super cepat.
- **Framework API**: [ElysiaJS](https://elysiajs.com) (Elysia core + `@elysiajs/cors`).
- **Database & ORM**: [Drizzle ORM](https://orm.drizzle.team) + `@libsql/client` (Turso DB / SQLite).
- **Security**: `bcryptjs` (Password Hashing) & Custom XSS/HTML Sanitizer Middleware.

### Monorepo & Tooling
- **Monorepo Manager**: [Turborepo v2.10+](https://turbo.build).
- **Package Manager**: [Bun Workspaces](https://bun.sh/docs/install/workspaces).
- **Code Quality**: ESLint, Prettier, TypeScript.

---

## 📁 Struktur Monorepo

```text
pos/
├── apps/
│   ├── api/                   # Backend Server (ElysiaJS + Bun)
│   │   ├── src/
│   │   │   ├── db/            # Drizzle Database Connection & Schema
│   │   │   ├── middlewares/   # XSS Sanitizer & Auth Guard
│   │   │   ├── modules/       # Auth, Products, Transactions, Dashboard, Settings, Etalase
│   │   │   └── index.ts       # Main Entrypoint Server API
│   │   ├── drizzle.config.ts  # Konfigurasi Drizzle Kit & Migration
│   │   └── package.json
│   │
│   └── web/                   # Frontend Web Application (Svelte 5)
│       ├── src/
│       │   ├── components/    # Reusable UI Components
│       │   ├── core/          # State Stores, API Client & Config
│       │   ├── features/      # Feature Modules (POS, Inventory, HPP, Sales, Dashboard, Auth)
│       │   ├── pages/         # Page Views
│       │   └── App.svelte     # Main Layout Application
│       ├── index.html
│       └── package.json
│
├── packages/
│   ├── ui/                    # Shared Component Library
│   ├── eslint-config/         # Shared ESLint Configuration
│   └── typescript-config/     # Shared tsconfig.json Base
│
├── package.json               # Root Package Manifest & Workspace Rules
├── turbo.json                 # Turborepo Pipeline Configuration
└── README.md                  # Dokumentasi Proyek
```

---

## 🚀 Panduan Instalasi & Pengoperasian

### Prasyarat
Pastikan sistem Anda sudah terinstal:
- [Bun](https://bun.sh) `>= 1.2.0` (Sangat direkomendasikan)
- [Node.js](https://nodejs.org) `>= 18.0.0` (Opsional jika menggunakan npm/npx)

### Langkah-Langkah Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/username/pos.git
   cd pos
   ```

2. **Install Dependencies**
   Jalankan perintah berikut di root folder untuk menginstal semua dependency monorepo:
   ```bash
   bun install
   ```

3. **Konfigurasi Environment (`.env`)**
   Buat file `.env` di dalam direktori `apps/api/`:
   ```bash
   cp apps/api/.env.example apps/api/.env  # Atau buat manual file apps/api/.env
   ```

   Isi konfigurasi database Turso / SQLite lokal pada `apps/api/.env`:
   ```env
   PORT=3000
   TURSO_DATABASE_URL="libsql://pos-taas.aws-ap-northeast-1.turso.io"
   TURSO_AUTH_TOKEN="your_turso_auth_token_here"
   ```

4. **Jalankan Database Migration (Opsional)**
   Untuk melakukan sinkronisasi skema database Drizzle ke Turso/SQLite:
   ```bash
   cd apps/api
   bunx drizzle-kit push
   cd ../..
   ```

5. **Jalankan Mode Pengembang (Development)**
   Untuk menjalankan aplikasi `web` dan `api` secara bersamaan:
   ```bash
   bun run dev
   ```

   Aplikasi dapat diakses pada:
   - 💻 **Frontend Web**: `http://localhost:5173`
   - 🦊 **Backend API**: `http://localhost:3000`
   - 🔍 **API Health Check**: `http://localhost:3000/`

---

## 🛠️ Perintah CLI (Scripts Reference)

Seluruh perintah utama dapat dijalankan melalui root monorepo:

| Perintah | Deskripsi |
| :--- | :--- |
| `bun run dev` | Menjalankan seluruh aplikasi (`web` dan `api`) secara paralel dalam mode pengembang. |
| `bun run build` | Melakukan build produksi untuk semua aplikasi dan package via Turborepo. |
| `bun run lint` | Menjalankan verifikasi ESLint di seluruh workspace monorepo. |
| `bun run format` | Melakukan format otomatis kode menggunakan Prettier. |
| `bun run check-types` | Memeriksa validasi tipe TypeScript pada semua paket. |

### Menjalankan Perintah Terpisah / Filter

Jika ingin menjalankan aplikasi tertentu secara individual:

```bash
# Menjalankan Frontend Web saja
bun run dev --filter=web

# Menjalankan Backend API saja
bun run dev --filter=server
```

---

## 🔒 Keamanan & Sanitasi Input

Sistem ini dilengkapi dengan middleware sanitasi otomatis pada layer API (`apps/api/src/middlewares/sanitizer.ts`) yang memproses setiap payload `body` dan `query`:
- Memotong dan mengamankan input string dari serangan XSS (HTML Tag striping & encoding).
- Penggunaan **Parameterized Queries** melalui Drizzle ORM untuk mencegah serangan SQL Injection.
- Pengamanan kata sandi pemilik bisnis menggunakan hashing satu arah `bcryptjs`.

---

## 🤝 Kontribusi & Lisensi

Kontribusi terbuka untuk pengembangan fitur baru, perbaikan bug, maupun peningkatan optimasi UI/UX.

1. Fork repository ini
2. Buat feature branch baru (`git checkout -b feature/FiturBaru`)
3. Commit perubahan Anda (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/FiturBaru`)
5. Buat **Pull Request**

Distributed under the MIT License. See `LICENSE` for more information.

---