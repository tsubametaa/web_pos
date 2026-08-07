# 📱 ArthaPOS REST API — Integration Guide (Mobile & Web)

Panduan integrasi REST API ArthaPOS versi terkini untuk pengembang Mobile (Android / iOS / Flutter / React Native / Kotlin / Swift) maupun klien web.

---

## 🚀 Base URL & Interactive Docs

| Lingkungan | URL |
|:---|:---|
| **Local Dev** | `http://localhost:3000/api` |
| **Emulator Android** | `http://10.0.2.2:3000/api` |
| **Perangkat Fisik (Wi-Fi)** | `http://192.168.1.X:3000/api` |
| **Production** | `https://<your-deployed-domain>/api` |
| **Swagger UI (Interactive)** | `http://localhost:3000/swagger` |

> 💡 Swagger UI menyediakan playground interaktif untuk mencoba semua endpoint langsung dari browser.

---

## 🔑 Autentikasi

ArthaPOS menggunakan **Cookie Session (`session`)** berbasis `httpOnly`. Setelah login berhasil, server akan menyetel cookie `session` secara otomatis yang akan disertakan oleh browser/klien pada setiap request berikutnya.

### Untuk Klien Mobile (Android / iOS / Flutter / React Native):
Aktifkan penyimpanan cookie pada HTTP client Anda agar session terkirim otomatis:

```dart
// Flutter — gunakan CookieJar dari package dio / cookie_jar
```

```kotlin
// Android (OkHttp) — gunakan CookieManager
val cookieJar = JavaNetCookieJar(CookieManager())
val client = OkHttpClient.Builder().cookieJar(cookieJar).build()
```

Alternatif (jika cookie sulit dipakai), dapat menggunakan header `Authorization`:

```http
Authorization: Bearer <user_email>
```

### Header Standar:
```http
Content-Type: application/json
```

---

## 👥 Peran Pengguna (Role Hierarchy)

| Role | Keterangan |
|:---|:---|
| `super_admin` | Akses penuh ke seluruh endpoint. Dapat mengelola staff, brand/stores, dan melihat data profit/laba. |
| `admin` | Akses POS, inventori, dan riwayat transaksi. Data **profit disembunyikan** (selalu `0`). Tidak dapat mengakses `/api/users` dan `/api/stores`. |

---

## 📡 Endpoint API

### 1. Autentikasi — `/api/auth`

---

#### `POST /api/auth/login`
Login dan membuat sesi pengguna.

**Request Body:**
```json
{
  "email": "admin@kasir.id",
  "password": "password123"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login berhasil!",
  "user": {
    "id": "usr_abc123",
    "email": "admin@kasir.id",
    "businessName": "Toko Artha Jaya",
    "role": "super_admin",
    "createdById": null
  }
}
```

**Response `400 Bad Request`:**
```json
{ "success": false, "error": "Email atau password salah." }
```

---

#### `POST /api/auth/logout`
Menghapus sesi aktif pengguna.

**Response `200 OK`:**
```json
{ "success": true, "message": "Logout berhasil!" }
```

---

#### `GET /api/auth/me`
Mendapatkan profil pengguna yang sedang login.

**Response `200 OK`:**
```json
{
  "success": true,
  "user": {
    "id": "usr_abc123",
    "email": "admin@kasir.id",
    "businessName": "Toko Artha Jaya",
    "role": "super_admin",
    "createdById": null
  }
}
```

**Response `401 Unauthorized`:**
```json
{ "success": false, "error": "Belum login." }
```

**Response `503 Service Unavailable`** *(DB Error, bukan logout — klien harus retry, bukan hapus sesi)*:
```json
{ "success": false, "error": "Server sedang bermasalah, coba beberapa saat lagi." }
```

---

### 2. Produk & Inventori — `/api/products`

> 🔒 **Semua endpoint di bawah ini memerlukan autentikasi.**

---

#### `GET /api/products`
Mengambil daftar produk. Untuk `admin`, data produk otomatis dibatasi hanya milik Super Admin induknya.

**Query Parameters:**

| Parameter | Tipe | Keterangan |
|:---|:---|:---|
| `active` | `"true"` (opsional) | Hanya ambil produk aktif (stok ≥ 0). Digunakan di halaman POS kasir. |
| `category` | `string` (opsional) | Filter berdasarkan nama kategori produk. |

**Response `200 OK`:**
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_01",
      "userId": "usr_abc123",
      "storeId": null,
      "sku": "PRD-001",
      "name": "Kopi Susu Gula Aren",
      "category": "Minuman",
      "unit": "cup",
      "costPrice": 10000,
      "sellingPrice": 18000,
      "stock": 45,
      "minStock": 10,
      "isActive": true,
      "imageUrl": "https://example.com/img.jpg",
      "barcode": "Ab3Xq72Kp",
      "notes": "Best seller",
      "createdAt": "2026-08-01T07:00:00.000Z",
      "updatedAt": "2026-08-06T10:00:00.000Z"
    }
  ]
}
```

> 📌 **Catatan Barcode**: Barcode produk berformat **9 karakter alphanumeric acak** (`a-z`, `A-Z`, `0-9`) yang digenerate otomatis oleh sistem saat produk dibuat. Nilai ini bersifat **read-only** dan tidak dapat diubah.

---

#### `POST /api/products`
Membuat produk baru.

**Request Body:**
```json
{
  "name": "Es Teh Manis",
  "category": "Minuman",
  "unit": "gelas",
  "costPrice": 2000,
  "sellingPrice": 5000,
  "stock": 100,
  "minStock": 15,
  "imageUrl": "",
  "notes": ""
}
```

> ℹ️ Field `barcode` **tidak perlu dikirim** — sistem akan membuat barcode 9-karakter secara otomatis.

**Response `200 OK`:**
```json
{
  "success": true,
  "product": { "id": "prod_xyz", "barcode": "Ab3Xq72Kp", "..." }
}
```

---

#### `PUT /api/products`
Mengupdate data produk **atau** melakukan penyesuaian stok (stock adjustment).

**Request Body — Update Data Produk:**
```json
{
  "id": "prod_01",
  "name": "Kopi Susu Premium",
  "sellingPrice": 20000,
  "minStock": 5
}
```

**Request Body — Penyesuaian Stok:**
```json
{
  "id": "prod_01",
  "stockAdjustment": 10,
  "adjustmentNotes": "Restock dari supplier"
}
```

> ℹ️ `stockAdjustment` bersifat **relatif** (delta). Nilai `10` berarti tambah 10 unit, `-5` berarti kurangi 5 unit.

**Response `200 OK`:**
```json
{
  "success": true,
  "product": { "id": "prod_01", "stock": 55, "..." }
}
```

---

#### `DELETE /api/products?id=<productId>`
Melakukan **toggle status aktif/non-aktif** produk (soft delete — produk tidak dihapus permanen).

**Query Parameter:**

| Parameter | Tipe | Keterangan |
|:---|:---|:---|
| `id` | `string` (wajib) | ID produk yang akan di-toggle statusnya. |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Status produk berhasil diubah menjadi non-aktif.",
  "product": { "id": "prod_01", "isActive": false, "..." }
}
```

---

### 3. Transaksi POS — `/api/transactions`

> 🔒 **Semua endpoint di bawah ini memerlukan autentikasi.**

---

#### `GET /api/transactions`
Mengambil riwayat transaksi dengan dukungan filter dan pagination.

**Query Parameters:**

| Parameter | Tipe | Default | Keterangan |
|:---|:---|:---|:---|
| `month` | `string` (opsional) | — | Filter bulan dalam format `YYYY-MM`, misal `2026-08`. Jika tidak diisi atau `all`, ambil semua bulan. |
| `paymentMethod` | `string` (opsional) | — | Filter metode pembayaran: `cash`, `transfer`, `qris`, `other`. |
| `limit` | `number` (opsional) | `1000` | Jumlah maksimal data per request (max `2000`). |
| `offset` | `number` (opsional) | `0` | Offset untuk pagination. |

**Contoh Request:**
```
GET /api/transactions?month=2026-08&paymentMethod=cash&limit=50&offset=0
```

**Response `200 OK`:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "trx_987654",
      "userId": "usr_abc123",
      "storeId": null,
      "transactionCode": "TRX-20260806-000123-1726",
      "recipientName": "Pelanggan Umum",
      "recipientPhone": null,
      "recipientAddress": null,
      "totalAmount": 36000,
      "totalCost": 20000,
      "profit": 16000,
      "paymentMethod": "cash",
      "amountPaid": 50000,
      "change": 14000,
      "notes": "Pembayaran Tunai",
      "status": "completed",
      "createdAt": "2026-08-06T11:14:00.000Z",
      "updatedAt": "2026-08-06T11:14:00.000Z",
      "items": [
        {
          "id": "item_001",
          "transactionId": "trx_987654",
          "productId": "prod_01",
          "productName": "Kopi Susu Gula Aren",
          "sku": "PRD-001",
          "qty": 2,
          "costPrice": 10000,
          "sellingPrice": 18000,
          "subtotal": 36000
        }
      ]
    }
  ]
}
```

> ⚠️ **Catatan Hak Akses**: Untuk akun `admin` biasa, field `profit` dan `totalCost` bernilai `0` — disembunyikan oleh backend.

---

#### `GET /api/transactions/:id`
Mengambil detail satu transaksi beserta item-item dan informasi toko/brand.

**Response `200 OK`:**
```json
{
  "success": true,
  "transaction": { "id": "trx_987654", "..." },
  "items": [ { "..." } ],
  "shopSettings": {
    "businessName": "Toko Artha Jaya",
    "logoUrl": "https://example.com/logo.png",
    "businessAddress": "Jl. Sudirman No. 1",
    "businessPhone": "081234567890",
    "currencySymbol": "Rp",
    "receiptFooter": "Terima kasih sudah berbelanja!"
  }
}
```

**Response `404 Not Found`:**
```json
{ "success": false, "error": "Transaksi tidak ditemukan." }
```

---

#### `POST /api/transactions`
Memproses transaksi penjualan baru dari kasir. Stok produk akan berkurang otomatis.

**Request Body:**
```json
{
  "paymentMethod": "cash",
  "amountPaid": 50000,
  "notes": "Pembayaran Tunai",
  "recipientName": "Pelanggan Umum",
  "recipientPhone": "",
  "recipientAddress": "",
  "items": [
    {
      "productId": "prod_01",
      "qty": 2
    }
  ]
}
```

> ℹ️ Harga, HPP, dan subtotal dihitung **otomatis oleh server** berdasarkan data produk di database. Client hanya perlu mengirim `productId` dan `qty`.

**Nilai valid `paymentMethod`**: `cash` | `transfer` | `qris` | `other`

**Response `200 OK`:**
```json
{
  "success": true,
  "transaction": {
    "id": "trx_987654",
    "transactionCode": "TRX-20260806-000123-1726",
    "totalAmount": 36000,
    "totalCost": 20000,
    "profit": 16000,
    "paymentMethod": "cash",
    "amountPaid": 50000,
    "change": 14000,
    "status": "completed",
    "createdAt": "2026-08-06T11:14:00.000Z"
  }
}
```

**Response `400 Bad Request`** *(stok tidak cukup, dll.)*:
```json
{ "success": false, "error": "Stok produk 'Kopi Susu Gula Aren' tidak mencukupi." }
```

---

#### `POST /api/transactions/void`
Membatalkan (void) transaksi yang sudah ada. Stok produk dikembalikan otomatis.

**Request Body:**
```json
{ "id": "trx_987654" }
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Transaksi berhasil dibatalkan dan stok dikembalikan.",
  "transaction": { "id": "trx_987654", "status": "voided", "..." }
}
```

---

### 4. Dashboard Statistik — `/api/dashboard`

> 🔒 **Memerlukan autentikasi.**

---

#### `GET /api/dashboard/stats`
Mengambil statistik ringkasan toko: data hari ini, produk stok menipis, transaksi terbaru, dan tren penjualan 7 hari.

**Response `200 OK`:**
```json
{
  "success": true,
  "stats": {
    "todaySales": 150000,
    "todayProfit": 45000,
    "todayTransactions": 5,
    "totalProducts": 32,
    "lowStockCount": 2
  },
  "lowStockProducts": [
    {
      "id": "prod_02",
      "name": "Teh Celup",
      "stock": 3,
      "minStock": 10
    }
  ],
  "recentTransactions": [
    {
      "id": "trx_987654",
      "transactionCode": "TRX-20260806-000123-1726",
      "totalAmount": 36000,
      "paymentMethod": "cash",
      "status": "completed",
      "createdAt": "2026-08-06T11:14:00.000Z"
    }
  ],
  "salesTrend": [
    { "dateStr": "31 Jul", "amount": 120000, "profit": 35000 },
    { "dateStr": "01 Ags", "amount": 95000, "profit": 28000 },
    { "dateStr": "02 Ags", "amount": 200000, "profit": 60000 }
  ]
}
```

> ⚠️ Untuk akun `admin` biasa: `todayProfit` selalu `0` dan field `profit` pada `salesTrend` juga `0`.

---

### 5. Manajemen Brand / Toko — `/api/stores`

> 🔒 **Hanya `super_admin` yang dapat membuat, mengedit, dan menghapus brand. `admin` biasa hanya dapat membaca.**

---

#### `GET /api/stores`
Mengambil daftar brand/toko milik Super Admin yang sedang login.

**Response `200 OK`:**
```json
{
  "success": true,
  "stores": [
    {
      "id": "store_01",
      "ownerId": "usr_abc123",
      "name": "Brand Utama",
      "logoUrl": "https://example.com/logo.png",
      "address": "Jl. Sudirman No. 1, Jakarta",
      "phone": "021-1234567",
      "receiptFooter": "Terima kasih!",
      "taxRate": 0,
      "currencySymbol": "Rp"
    }
  ]
}
```

---

#### `POST /api/stores`
Membuat brand/toko baru. *(Hanya `super_admin`)*

**Request Body:**
```json
{
  "name": "Cabang Selatan",
  "logoUrl": "https://example.com/logo2.png",
  "address": "Jl. Gatot Subroto No. 5",
  "phone": "021-9876543",
  "receiptFooter": "Terima kasih telah berbelanja di Cabang Selatan!",
  "taxRate": 0,
  "currencySymbol": "Rp"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Brand baru berhasil dibuat!",
  "store": { "id": "store_02", "name": "Cabang Selatan", "..." }
}
```

**Response `403 Forbidden`:**
```json
{ "success": false, "error": "Hanya Super Admin yang dapat membuat brand baru." }
```

---

#### `PUT /api/stores/:id`
Memperbarui data brand/toko. *(Hanya `super_admin`)*

**Request Body** *(semua field opsional)*:
```json
{
  "name": "Cabang Selatan (Revisi)",
  "address": "Jl. Gatot Subroto No. 10",
  "phone": "021-1111111",
  "logoUrl": "",
  "receiptFooter": "",
  "taxRate": 11,
  "currencySymbol": "Rp"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Profil brand berhasil diperbarui!",
  "store": { "id": "store_02", "..." }
}
```

---

#### `DELETE /api/stores/:id`
Menghapus brand/toko. *(Hanya `super_admin`)*

**Response `200 OK`:**
```json
{ "success": true, "message": "Brand berhasil dihapus." }
```

---

### 6. Pengaturan Bisnis — `/api/settings`

> 🔒 **Memerlukan autentikasi.** `admin` biasa mendapatkan pengaturan induk Super Admin-nya.

---

#### `GET /api/settings`
Mengambil profil bisnis / pengaturan toko aktif.

**Response `200 OK`:**
```json
{
  "success": true,
  "settings": {
    "id": "set_01",
    "userId": "usr_abc123",
    "businessName": "Toko Artha Jaya",
    "logoUrl": "https://example.com/logo.png",
    "businessAddress": "Jl. Sudirman No. 1",
    "businessPhone": "081234567890",
    "currencySymbol": "Rp",
    "lowStockThreshold": 10,
    "taxRate": 0,
    "receiptFooter": "Terima kasih sudah berbelanja!"
  }
}
```

---

#### `PUT /api/settings`
Memperbarui profil bisnis / pengaturan toko.

**Request Body:**
```json
{
  "businessName": "Toko Artha Jaya Updated",
  "logoUrl": "https://example.com/logo-baru.png",
  "businessAddress": "Jl. MH Thamrin No. 3",
  "businessPhone": "021-5555555",
  "currencySymbol": "Rp",
  "lowStockThreshold": 5,
  "taxRate": 11,
  "receiptFooter": "Selamat berbelanja kembali!"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Profil bisnis berhasil diperbarui!",
  "settings": { "..." }
}
```

---

#### `PUT /api/settings/password`
Mengubah password akun pengguna yang sedang login.

**Request Body:**
```json
{
  "oldPassword": "password_lama",
  "newPassword": "password_baru_minimal6"
}
```

**Response `200 OK`:**
```json
{ "success": true, "message": "Password berhasil diperbarui!" }
```

**Response `400 Bad Request`:**
```json
{ "success": false, "error": "Password lama tidak sesuai." }
```

---

### 7. Manajemen Staff — `/api/users`

> 🔒 **Hanya `super_admin`.** `admin` biasa akan mendapat error `403`.

---

#### `GET /api/users`
Mengambil daftar staff (Admin Biasa) di bawah Super Admin yang sedang login.

**Response `200 OK`:**
```json
{
  "success": true,
  "users": [
    {
      "id": "usr_kasir01",
      "email": "kasir1@tokosaya.com",
      "businessName": "Kasir Shift Pagi",
      "role": "admin",
      "storeId": "store_01",
      "createdById": "usr_abc123",
      "createdAt": "2026-08-01T08:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/users`
Membuat akun Admin Biasa (Staff Kasir) baru.

**Request Body:**
```json
{
  "email": "kasir2@tokosaya.com",
  "password": "password123",
  "businessName": "Kasir Shift Malam",
  "storeId": "store_01"
}
```

> ℹ️ `storeId` opsional — jika diisi, admin baru ini dikaitkan ke brand/toko tertentu.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "User (Admin Biasa) berhasil ditambahkan!",
  "user": { "id": "usr_kasir02", "email": "kasir2@tokosaya.com", "..." }
}
```

---

#### `PUT /api/users/:id`
Memperbarui data staff (nama, password, atau brand yang ditetapkan).

**Request Body** *(semua field opsional)*:
```json
{
  "businessName": "Kasir Shift Malam (Diperbarui)",
  "password": "newpassword123",
  "storeId": "store_02"
}
```

> ℹ️ Kirim `"storeId": null` untuk melepas staff dari brand tertentu.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Data pengguna berhasil diperbarui!",
  "user": { "id": "usr_kasir02", "..." }
}
```

---

#### `DELETE /api/users/:id`
Menghapus akun staff.

**Response `200 OK`:**
```json
{ "success": true, "message": "User berhasil dihapus." }
```

---

### 8. Etalase Publik — `/api/etalase`

> 📢 **Endpoint ini bersifat publik** (tidak memerlukan autentikasi). Digunakan untuk menampilkan katalog produk aktif kepada pelanggan.

---

#### `GET /api/etalase`
Mengambil katalog produk aktif beserta informasi toko.

**Query Parameters:**

| Parameter | Tipe | Keterangan |
|:---|:---|:---|
| `userId` | `string` (opsional) | ID pemilik toko untuk memfilter produk spesifik. Jika tidak diisi, mengembalikan semua produk aktif. |

**Response `200 OK`:**
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_01",
      "name": "Kopi Susu Gula Aren",
      "category": "Minuman",
      "sellingPrice": 18000,
      "stock": 45,
      "imageUrl": "https://example.com/img.jpg",
      "barcode": "Ab3Xq72Kp"
    }
  ],
  "settings": {
    "businessName": "Toko Artha Jaya",
    "businessAddress": "Jl. Sudirman No. 1",
    "businessPhone": "081234567890",
    "currencySymbol": "Rp"
  }
}
```

---

#### `GET /api/etalase/:id`
Mengambil detail satu produk aktif dari etalase publik.

**Response `200 OK`:**
```json
{
  "success": true,
  "product": { "id": "prod_01", "name": "Kopi Susu Gula Aren", "..." },
  "settings": { "businessName": "Toko Artha Jaya", "..." }
}
```

**Response `404 Not Found`:**
```json
{ "success": false, "error": "Produk tidak ditemukan atau sudah tidak aktif." }
```

---

### 9. Upload Gambar — `/api/uploads`

> 🔒 **Memerlukan autentikasi.**

---

#### `POST /api/uploads/upload`
Mengunggah gambar (logo toko, foto produk, dll.).

**Content-Type**: `multipart/form-data`

**Body Field**: `file` *(binary image file)*

**Response `200 OK`:**
```json
{
  "success": true,
  "url": "https://storage.example.com/uploads/image_abc123.jpg"
}
```

---

## 💻 Contoh Kode Integrasi Mobile

### Flutter / Dart (`http` package)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ArthaPosApi {
  // Emulator Android: http://10.0.2.2:3000/api
  // Perangkat Fisik:  http://192.168.1.X:3000/api
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  
  final _cookieJar = <String, String>{};

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_cookieJar.containsKey('session'))
      'Cookie': 'session=${_cookieJar['session']}',
  };

  // 🔑 Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(response.body);
    // Simpan cookie session dari response header
    return data;
  }

  // 📦 Ambil Produk Aktif (untuk POS)
  Future<List<dynamic>> fetchProducts() async {
    final response = await http.get(
      Uri.parse('$baseUrl/products?active=true'),
      headers: _headers,
    );
    final data = jsonDecode(response.body);
    return data['products'];
  }

  // 🛒 Proses Checkout
  Future<Map<String, dynamic>> checkout({
    required String paymentMethod,
    required double amountPaid,
    required List<Map<String, dynamic>> items,
    String? notes,
    String? recipientName,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/transactions'),
      headers: _headers,
      body: jsonEncode({
        'paymentMethod': paymentMethod,
        'amountPaid': amountPaid,
        'notes': notes,
        'recipientName': recipientName,
        'items': items, // [{"productId": "prod_01", "qty": 2}]
      }),
    );
    return jsonDecode(response.body);
  }

  // 📊 Dashboard Stats
  Future<Map<String, dynamic>> getDashboardStats() async {
    final response = await http.get(
      Uri.parse('$baseUrl/dashboard/stats'),
      headers: _headers,
    );
    return jsonDecode(response.body);
  }

  // 📋 Riwayat Transaksi (dengan filter bulan & pagination)
  Future<List<dynamic>> getTransactions({
    String? month,           // format: "YYYY-MM"
    String? paymentMethod,   // "cash" | "transfer" | "qris" | "other"
    int limit = 50,
    int offset = 0,
  }) async {
    final params = {
      if (month != null && month != 'all') 'month': month,
      if (paymentMethod != null) 'paymentMethod': paymentMethod,
      'limit': limit.toString(),
      'offset': offset.toString(),
    };
    final uri = Uri.parse('$baseUrl/transactions').replace(queryParameters: params);
    final response = await http.get(uri, headers: _headers);
    final data = jsonDecode(response.body);
    return data['transactions'];
  }
}
```

---

### React Native / JavaScript (`fetch`)

```javascript
const BASE_URL = 'http://10.0.2.2:3000/api'; // Emulator Android

const getHeaders = (email) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${email}`,
});

// 🔑 Login
export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Untuk cookie session
  });
  return res.json();
};

// 📦 Ambil Produk Aktif
export const getProducts = async (userEmail) => {
  const res = await fetch(`${BASE_URL}/products?active=true`, {
    headers: getHeaders(userEmail),
    credentials: 'include',
  });
  const data = await res.json();
  return data.products;
};

// 🛒 Proses Checkout
export const checkout = async (userEmail, transactionData) => {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: getHeaders(userEmail),
    credentials: 'include',
    body: JSON.stringify(transactionData),
  });
  return res.json();
};

// 📋 Riwayat Transaksi dengan Filter
export const getTransactions = async (userEmail, { month, paymentMethod, limit = 50, offset = 0 } = {}) => {
  const params = new URLSearchParams({ limit, offset });
  if (month && month !== 'all') params.append('month', month);
  if (paymentMethod) params.append('paymentMethod', paymentMethod);

  const res = await fetch(`${BASE_URL}/transactions?${params}`, {
    headers: getHeaders(userEmail),
    credentials: 'include',
  });
  const data = await res.json();
  return data.transactions;
};
```

---

### Kotlin / Android (`OkHttp`)

```kotlin
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class ArthaPosApiClient {
    private val JSON = "application/json; charset=utf-8".toMediaType()
    private val cookieJar = JavaNetCookieJar(java.net.CookieManager())
    private val client = OkHttpClient.Builder()
        .cookieJar(cookieJar)
        .build()

    // Untuk emulator: http://10.0.2.2:3000/api
    private val baseUrl = "http://10.0.2.2:3000/api"

    fun login(email: String, password: String): JSONObject {
        val body = JSONObject()
            .put("email", email)
            .put("password", password)
            .toString()
            .toRequestBody(JSON)

        val request = Request.Builder()
            .url("$baseUrl/auth/login")
            .post(body)
            .build()

        val response = client.newCall(request).execute()
        return JSONObject(response.body!!.string())
    }

    fun getProducts(): JSONObject {
        val request = Request.Builder()
            .url("$baseUrl/products?active=true")
            .get()
            .build()

        val response = client.newCall(request).execute()
        return JSONObject(response.body!!.string())
    }

    fun checkout(paymentMethod: String, amountPaid: Double, items: List<Map<String, Any>>): JSONObject {
        val itemsJson = org.json.JSONArray(items)
        val body = JSONObject()
            .put("paymentMethod", paymentMethod)
            .put("amountPaid", amountPaid)
            .put("items", itemsJson)
            .toString()
            .toRequestBody(JSON)

        val request = Request.Builder()
            .url("$baseUrl/transactions")
            .post(body)
            .build()

        val response = client.newCall(request).execute()
        return JSONObject(response.body!!.string())
    }
}
```

---

## 📋 Kode Status HTTP

| Kode | Makna |
|:---|:---|
| `200 OK` | Request berhasil. |
| `400 Bad Request` | Payload / input tidak valid (misal: stok tidak cukup, field wajib kosong). |
| `401 Unauthorized` | Sesi belum ada atau sudah kedaluwarsa. Arahkan pengguna ke halaman Login. |
| `403 Forbidden` | Hak akses tidak cukup (misal: `admin` biasa mengakses endpoint khusus `super_admin`). |
| `404 Not Found` | Data yang dicari tidak ditemukan. |
| `503 Service Unavailable` | Server/DB sedang bermasalah. **Jangan hapus sesi** — cukup tampilkan pesan "Coba lagi" dan retry. |

---

## 🗃️ Ringkasan Endpoint

| Method | Endpoint | Auth | Role |
|:---|:---|:---|:---|
| POST | `/api/auth/login` | ❌ | Semua |
| POST | `/api/auth/logout` | ✅ | Semua |
| GET | `/api/auth/me` | ✅ | Semua |
| GET | `/api/products` | ✅ | Semua |
| POST | `/api/products` | ✅ | Semua |
| PUT | `/api/products` | ✅ | Semua |
| DELETE | `/api/products?id=` | ✅ | Semua |
| GET | `/api/transactions` | ✅ | Semua |
| GET | `/api/transactions/:id` | ✅ | Semua |
| POST | `/api/transactions` | ✅ | Semua |
| POST | `/api/transactions/void` | ✅ | Semua |
| GET | `/api/dashboard/stats` | ✅ | Semua |
| GET | `/api/stores` | ✅ | Semua |
| POST | `/api/stores` | ✅ | super_admin |
| PUT | `/api/stores/:id` | ✅ | super_admin |
| DELETE | `/api/stores/:id` | ✅ | super_admin |
| GET | `/api/settings` | ✅ | Semua |
| PUT | `/api/settings` | ✅ | Semua |
| PUT | `/api/settings/password` | ✅ | Semua |
| GET | `/api/users` | ✅ | super_admin |
| POST | `/api/users` | ✅ | super_admin |
| PUT | `/api/users/:id` | ✅ | super_admin |
| DELETE | `/api/users/:id` | ✅ | super_admin |
| GET | `/api/etalase` | ❌ | Publik |
| GET | `/api/etalase/:id` | ❌ | Publik |
| POST | `/api/uploads/upload` | ✅ | Semua |
