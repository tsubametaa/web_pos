# 📱 ArthaPOS REST API Integration Guide (Mobile & Web)

Panduan integrasi REST API ArthaPOS untuk pengembang aplikasi Mobile (Android / iOS / Flutter / React Native / Kotlin / Swift).

---

## 🚀 Base URL & Interactive Swagger UI

- **Base URL (Local)**: `http://localhost:3000/api`
- **Interactive Swagger Documentation**: `http://localhost:3000/swagger`
- **Production URL**: `https://<your-deployed-api-domain>/api`

> 💡 **Tips Mobile Dev**: Jika menguji menggunakan Emulator Android, gunakan `http://10.0.2.2:3000/api` sebagai pengganti `localhost`. Untuk perangkat fisik Android/iOS, gunakan IP Wi-Fi komputer Anda (misal `http://192.168.1.X:3000/api`).

---

## 🔑 Autentikasi & Header HTTP

API ArthaPOS menggunakan skema **Header Authorization** sederhana berbasis Bearer Token yang berisi email pengguna yang terotentikasi.

### Header Wajib pada Setiap Request Terproteksi:
```http
Content-Type: application/json
Authorization: Bearer admin@kasir.id
```
*(Opsional: Anda juga dapat menggunakan header `X-User-Email: admin@kasir.id` jika diperlukan).*

---

## 👥 Peran Pengguna (Role Hierarchy)

| Role | Hak Akses & Perilaku API |
| :--- | :--- |
| `super_admin` | Akses penuh ke seluruh endpoint API, termasuk data profit/laba dan manajemen staff (`/api/users`). |
| `admin` (Admin Biasa) | Memiliki akses penuh ke POS Kasir & Inventori. Produk & transaksi se-induk dengan Super Admin pembuatnya. Dibatasi dari data profit dan modul manajemen user (`/api/users`). |

---

## 📡 Daftar Endpoint API Utama

### 1. Autentikasi (`/api/auth`)

#### 🔹 `POST /api/auth/login`
Memproses masuk akun dan mengembalikan data pengguna beserta perannya (`super_admin` / `admin`).

- **Request Body**:
```json
{
  "email": "admin@kasir.id",
  "password": "password123"
}
```

- **Response Selesai (`200 OK`)**:
```json
{
  "success": true,
  "user": {
    "id": "usr_123456",
    "email": "admin@kasir.id",
    "businessName": "Toko Artha Jaya",
    "role": "super_admin",
    "createdAt": "2026-08-05T13:28:01.000Z"
  }
}
```

#### 🔹 `GET /api/auth/me`
Mendapatkan informasi profil pengguna yang sedang login berdasarkan token header `Authorization`.

- **Response (`200 OK`)**:
```json
{
  "success": true,
  "user": {
    "id": "usr_123456",
    "email": "admin@kasir.id",
    "businessName": "Toko Artha Jaya",
    "role": "super_admin"
  }
}
```

#### 🔹 `POST /api/auth/logout`
Menghapus sesi pengguna.

---

### 2. Produk & Inventori (`/api/products`)

#### 🔹 `GET /api/products`
Mengambil daftar produk toko. Untuk Admin Biasa, API secara otomatis mengambil katalog produk se-induk milik Super Admin pembuatnya.

- **Query Parameters**:
  - `active` (boolean, opsional): `true` untuk hanya mengambil produk aktif (digunakan di POS Kasir).
  - `category` (string, opsional): Filter berdasarkan nama kategori.

- **Response (`200 OK`)**:
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_01",
      "sku": "PRD-001",
      "name": "Kopi Susu Gula Aren",
      "category": "Minuman",
      "costPrice": 10000,
      "sellingPrice": 18000,
      "stock": 45,
      "minStock": 10,
      "unit": "cup",
      "isActive": true,
      "imageUrl": "https://example.com/image.jpg",
      "barcode": "899123456789",
      "notes": "Best seller"
    }
  ]
}
```

#### 🔹 `POST /api/products`
Menambah produk baru ke inventori (Dapat dilakukan oleh Super Admin & Admin Biasa).

- **Request Body**:
```json
{
  "name": "Es Teh Manis",
  "category": "Minuman",
  "unit": "glass",
  "costPrice": 2000,
  "sellingPrice": 5000,
  "stock": 100,
  "minStock": 15,
  "barcode": "89987654321",
  "imageUrl": ""
}
```

#### 🔹 `PUT /api/products/:id`
Mengubah data atau stok produk.

#### 🔹 `DELETE /api/products/:id`
Menghapus produk dari inventori (soft delete).

---

### 3. Transaksi Kasir POS (`/api/transactions`)

#### 🔹 `POST /api/transactions`
Memproses transaksi penjualan baru dari Kasir.

- **Request Body**:
```json
{
  "paymentMethod": "cash",
  "paidAmount": 50000,
  "changeAmount": 14000,
  "customerName": "Pelanggan Umum",
  "notes": "Pembayaran Tunai",
  "items": [
    {
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
```

- **Response (`200 OK`)**:
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
    "status": "completed",
    "createdAt": "2026-08-06T11:14:00.000Z"
  }
}
```

#### 🔹 `GET /api/transactions`
Mengambil riwayat transaksi.
> ⚠️ **Catatan Hak Akses**: Untuk akun `admin` biasa, properti `profit` dan `totalCost` secara otomatis disembunyikan atau di-set ke 0 oleh backend.

#### 🔹 `POST /api/transactions/:id/void`
Membatalkan (void) transaksi dan mengembalikan stok barang secara otomatis.

---

### 4. Ringkasan Laporan Dashboard (`/api/dashboard`)

#### 🔹 `GET /api/dashboard/stats`
Mengembalikan ringkasan statistik toko hari ini.

- **Response (`200 OK`)**:
```json
{
  "success": true,
  "stats": {
    "todaySales": 150000,
    "todayTransactions": 5,
    "lowStockCount": 2,
    "todayProfit": 45000
  }
}
```
*(Untuk `admin` biasa, `todayProfit` bernilai 0).*

---

### 5. Manajemen Staff / Admin Biasa (`/api/users`) — *Khusus Super Admin*

#### 🔹 `GET /api/users`
Mengambil daftar staff yang terdaftar di bawah Super Admin ini.

#### 🔹 `POST /api/users`
Membuat akun Admin Biasa (Staff) baru.

- **Request Body**:
```json
{
  "email": "kasir1@tokosaya.com",
  "password": "password123",
  "businessName": "Kasir Shift Pagi"
}
```

#### 🔹 `DELETE /api/users/:id`
Menghapus akun staff.

---

### 6. Upload Gambar (`/api/uploads`)

#### 🔹 `POST /api/uploads/upload`
Mengunggah gambar produk.
- **Content-Type**: `multipart/form-data`
- **Body Field**: `file` (File binary gambar)

---

## 💻 Contoh Kode Integrasi Mobile

### 1. Dart / Flutter (`http` package)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Gunakan 10.0.2.2 untuk emulator Android
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  final String userEmail;

  ApiService({required this.userEmail});

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $userEmail',
  };

  // 📦 Get Products List
  Future<List<dynamic>> fetchProducts() async {
    final response = await http.get(
      Uri.parse('$baseUrl/products?active=true'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['products'];
    } else {
      throw Exception('Gagal memuat produk: ${response.body}');
    }
  }

  // 🛒 Process Checkout
  Future<Map<String, dynamic>> checkout(Map<String, dynamic> transactionData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/transactions'),
      headers: _headers,
      body: jsonEncode(transactionData),
    );

    return jsonDecode(response.body);
  }
}
```

### 2. React Native (`fetch`)

```javascript
const BASE_URL = 'http://10.0.2.2:3000/api';

export const getProducts = async (userEmail) => {
  const response = await fetch(`${BASE_URL}/products?active=true`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userEmail}`,
    },
  });
  const data = await response.json();
  return data.products;
};
```

---

## 📋 Catatan Penanganan Error (HTTP Status Codes)

- `200 OK`: Request berhasil dieksekusi.
- `400 Bad Request`: Format input / payload tidak valid.
- `401 Unauthorized`: Header `Authorization` tidak disertakan atau sesi tidak valid.
- `403 Forbidden`: Pengguna tidak memiliki hak akses (misal: Admin biasa mengakses `/api/users`).
- `500 Internal Server Error`: Terjadi masalah di sisi server.
