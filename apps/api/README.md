# 🚀 ArthaPOS Backend API (Elysia + Bun)

Backend REST API untuk sistem Kasir POS ArthaPOS, mendukung integrasi Web Frontend (Svelte) dan Mobile App (Android / iOS / Flutter / React Native).

---

## 📚 Dokumen Spesifikasi API & Integrasi Mobile

- 🌐 **Interactive Swagger UI**: [http://localhost:3000/swagger](http://localhost:3000/swagger)
- 📱 **Panduan Lengkap Mobile Developer**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🛠️ Cara Menjalankan (Development)

1. **Install Dependensi**:
   ```bash
   bun install
   ```

2. **Jalankan Server Development**:
   ```bash
   bun run dev
   ```

3. **Akses API & Swagger**:
   - Health Check: [http://localhost:3000/api/health](http://localhost:3000/api/health)
   - Interactive OpenAPI / Swagger UI: [http://localhost:3000/swagger](http://localhost:3000/swagger)

---

## 📦 Skema Autentikasi Header

Setiap request terproteksi wajib menyertakan header:
```http
Content-Type: application/json
Authorization: Bearer <email_user>
```

Lihat [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) untuk rincian payload JSON dan contoh kode integrasi Mobile (Flutter / React Native / Kotlin).