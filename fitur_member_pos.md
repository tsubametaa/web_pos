# 🪪 Rencana Fitur Member & Harga Khusus — POS System

> **Status:** Diskusi Selesai / Siap Diimplementasi  
> **Scope:** `apps/api` (Elysia + Drizzle + SQLite) & `apps/web` (Svelte 5)

---

## 📌 Ringkasan Fitur

| Poin | Detail |
|---|---|
| **Member** | Pelanggan dengan nomor HP sebagai identitas unik |
| **Scope** | Global (berlaku di semua brand/toko) |
| **Harga member** | Fixed price per-produk (by SKU) — tiap member punya deal harga sendiri |
| **Pendekatan harga** | **Opsi A: Fixed price per SKU per member** — produk tanpa deal pakai harga normal |
| **Di kasir** | Textbox nomor HP + tombol konfirmasi → semua item di cart langsung berubah harga |
| **Hapus member** | Semua harga balik normal otomatis, cart tidak dihapus, bisa input member lain |
| **Di transaksi** | `memberId` + `isMemberTransaction = true` disimpan di tabel transactions |
| **Di receipt/invoice** | Tampilkan nama & no HP member |

---

## 💡 Keputusan Desain Harga Member

### Pendekatan: Fixed Price per SKU per Member

Setiap member punya **daftar harga sendiri** berdasarkan deal yang sudah disepakati:

```
Member: Budi Santoso
├── SKU PRD-001  → Rp 15.000  (normal: Rp 20.000)  ← ada deal
├── SKU PRD-004  → Rp 8.000   (normal: Rp 12.000)  ← ada deal
└── SKU PRD-099  → [tidak ada] → pakai Rp 12.000    ← harga normal

Member: Siti Aminah
├── SKU PRD-001  → Rp 17.000  (normal: Rp 20.000)  ← deal beda dari Budi
└── SKU PRD-002  → Rp 30.000  (normal: Rp 35.000)  ← ada deal
```

> **Aturan:** Kalau SKU produk tidak ada di daftar deal member → pakai harga normal. Tidak ada default diskon.

---

## 🔁 State Machine Member di Kasir

```
[IDLE — No Member]
       │
       │ kasir input HP → klik [Cek]
       ▼
[LOADING...]
       │
   ┌───┴─────────┐
  ✅ Ditemukan   ❌ Tidak ditemukan / tidak aktif
   │               │
   │               └─→ tampil pesan error, balik ke IDLE
   ▼
[MEMBER ACTIVE]
   │ • Semua cart item yang cocok SKU-nya → customPrice = harga member
   │ • Produk baru yang ditambah → otomatis pakai harga member (kalau ada deal)
   │ • Tampil badge hijau + nama member + tombol [✕ Hapus]
   │
   │ kasir klik [✕ Hapus Member]
   ▼
[IDLE — No Member]
   │ • Semua customPrice di cart item → reset ke undefined (harga normal)
   │ • Cart TIDAK dihapus, produk tetap ada
   │ • Input HP di-clear, siap untuk input member lain
```

---

## 🗄️ 1. Perubahan Database Schema

### Tabel Baru: `members`

```typescript
// apps/api/src/db/schema.ts
export const members = sqliteTable('members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),   // ← identifier utama, UNIK global
  email: text('email'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});
```

> **Kenapa tidak ada `storeId`?**  
> Member bersifat global lintas brand. Tidak perlu dikunci ke toko tertentu.

---

### Tabel Baru: `member_prices`

```typescript
// apps/api/src/db/schema.ts
export const memberPrices = sqliteTable('member_prices', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  memberId: text('member_id')
    .references(() => members.id, { onDelete: 'cascade' })
    .notNull(),
  sku: text('sku').notNull(),               // ← referensi ke products.sku
  customPrice: integer('custom_price').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
}, (table) => ({
  memberSkuUniq: index('idx_member_prices_member_sku').on(table.memberId, table.sku),
}));
```

> **Kenapa pakai `sku` bukan `productId`?**  
> SKU lebih stabil. Jika produk dihapus dan dibuat ulang dengan SKU sama, harga member tetap berlaku. Juga konsisten dengan field `sku` di `transactionItems`.

---

### Modifikasi Tabel: `transactions`

Tambah 2 field baru:

```diff
// apps/api/src/db/schema.ts — tabel transactions
+ memberId: text('member_id').references(() => members.id, { onDelete: 'set null' }),
+ isMemberTransaction: integer('is_member_transaction', { mode: 'boolean' }).notNull().default(false),
```

> `memberId` nullable — transaksi biasa (non-member) tetap valid dengan `null`.  
> `isMemberTransaction` sebagai flag boolean untuk filter/laporan.

---

## 🔌 2. API Module Baru: `/members`

Buat folder baru: `apps/api/src/modules/members/`

### File Structure

```
apps/api/src/modules/members/
├── members.controller.ts   ← routing Hono
└── members.service.ts      ← business logic Drizzle
```

### Endpoints

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| `GET` | `/api/members` | ✅ | List semua member (+ filter search by name/phone) |
| `POST` | `/api/members` | ✅ | Tambah member baru |
| `GET` | `/api/members/lookup?phone=...` | ✅ | **Lookup by nomor HP** (dipakai di kasir) |
| `GET` | `/api/members/:id` | ✅ | Detail member + harga khususnya |
| `PUT` | `/api/members/:id` | ✅ | Update data member |
| `DELETE` | `/api/members/:id` | ✅ | Hapus member |
| `POST` | `/api/members/:id/prices` | ✅ | Tambah/update harga khusus (upsert by SKU) |
| `DELETE` | `/api/members/:id/prices/:sku` | ✅ | Hapus harga khusus satu produk |

### Response `GET /api/members/lookup?phone=08xxx`

```json
{
  "success": true,
  "member": {
    "id": "uuid",
    "name": "Budi Santoso",
    "phone": "08123456789",
    "isActive": true,
    "prices": [
      { "sku": "PRD-001", "customPrice": 15000 },
      { "sku": "PRD-004", "customPrice": 8000 }
    ]
  }
}
```

> Kalau `isActive: false` → API tetap return data tapi frontend tampilkan pesan "Member tidak aktif" dan **tidak** apply harga.

### Modifikasi: `transactions.service.ts`

Saat checkout, terima `memberId` optional dari body. Jika ada:
1. Validasi member exist & aktif
2. Set `isMemberTransaction = true`, simpan `memberId`
3. Harga per item sudah dikirim dari frontend (sudah di-override) — service tinggal simpan `sellingPrice` yang masuk

---

## ⚙️ 3. State Management — `member.svelte.ts`

Buat file baru: `apps/web/src/features/pos/logic/member.svelte.ts`

```typescript
import type { UIMember } from '../../../types';
import { cart } from './cart.svelte';
import { api } from '../../../core/api';

class MemberStore {
  current = $state<UIMember | null>(null);
  loading = $state(false);
  error = $state<string | null>(null);

  // Map SKU → customPrice untuk lookup O(1)
  get priceMap(): Map<string, number> {
    const map = new Map<string, number>();
    if (this.current?.prices) {
      for (const p of this.current.prices) {
        map.set(p.sku, p.customPrice);
      }
    }
    return map;
  }

  getCustomPrice(sku: string): number | undefined {
    return this.priceMap.get(sku);
  }

  // Konfirmasi member by nomor HP
  async confirm(phone: string) {
    this.loading = true;
    this.error = null;
    try {
      const res = await api.get(`/members/lookup?phone=${encodeURIComponent(phone)}`);
      if (res.success && res.member?.isActive) {
        this.current = res.member;
        this._applyPricesToCart();      // ← update semua item yang sudah di cart
      } else if (res.success && !res.member?.isActive) {
        this.error = 'Member tidak aktif.';
      } else {
        this.error = 'Nomor tidak terdaftar sebagai member.';
      }
    } catch {
      this.error = 'Gagal mengecek member.';
    } finally {
      this.loading = false;
    }
  }

  // Hapus member → semua harga kembali normal, cart tetap ada
  remove() {
    this._resetCartPrices();
    this.current = null;
    this.error = null;
  }

  private _applyPricesToCart() {
    for (const item of cart.items) {
      item.customPrice = this.getCustomPrice(item.product.sku);
      // kalau tidak ada deal → undefined → cart pakai sellingPrice normal
    }
  }

  private _resetCartPrices() {
    for (const item of cart.items) {
      item.customPrice = undefined;
    }
  }
}

export const memberStore = new MemberStore();
```

---

## 🛒 4. Integrasi ke `cart.svelte.ts`

Modifikasi method `add()` supaya produk baru yang ditambah setelah member aktif langsung pakai harga member:

```typescript
// apps/web/src/features/pos/logic/cart.svelte.ts
import { memberStore } from './member.svelte';

add(product: UIProduct) {
  if (product.stock <= 0) return 'Stok produk habis.';

  const existing = this.items.find((i) => i.product.id === product.id);
  if (existing) {
    if (existing.qty >= product.stock) {
      return `Stok tidak mencukupi. Hanya tersedia ${product.stock} ${product.unit}.`;
    }
    existing.qty += 1;
    // customPrice sudah ter-set, tidak perlu diubah
  } else {
    this.items.push({
      product,
      qty: 1,
      customPrice: memberStore.getCustomPrice(product.sku) // ← auto-apply kalau member aktif
    });
  }
}
```

> `totalAmount` sudah pakai `item.customPrice ?? item.product.sellingPrice` — tidak perlu diubah.

---

## 💳 5. Kasir — Input Member di CartPanel

### Tampilan Blok Member (4 State)

**IDLE**
```
┌──────────────────────────────────────────────┐
│ 👤 No HP Member                              │
│ [081234567890_____________]  [Cek]           │
└──────────────────────────────────────────────┘
```

**LOADING**
```
┌──────────────────────────────────────────────┐
│ 👤 No HP Member                              │
│ [081234567890_____________]  [⏳ Cek...]     │
└──────────────────────────────────────────────┘
```

**MEMBER ACTIVE**
```
┌──────────────────────────────────────────────┐
│ ✅ Budi Santoso — 081234567890               │
│    Harga member aktif · 2 produk di-deal     │
│                          [✕ Hapus Member]    │
└──────────────────────────────────────────────┘
```

**ERROR**
```
┌──────────────────────────────────────────────┐
│ 👤 No HP Member                              │
│ [081234567890_____________]  [Cek]           │
│ ❌ Nomor tidak terdaftar sebagai member      │
└──────────────────────────────────────────────┘
```

### Tampilan Item Cart Saat Member Aktif

Produk yang **ada deal:**
```
Produk ABC                    [- 2 +]   Rp 30.000
SKU: PRD-001
~~Rp 20.000~~  Rp 15.000 🏷️
```

Produk yang **tidak ada deal:**
```
Produk XYZ                    [- 1 +]   Rp 12.000
SKU: PRD-099
Rp 12.000
```

### Info Hemat di Summary

```
Subtotal (3 item)                       Rp 57.000
💰 Hemat member                        -Rp 15.000
Total Bayar                             Rp 42.000
```

---

## 🔄 6. Alur Lengkap End-to-End

```
Kasir input nomor HP → klik [Cek]
        │
        ▼
GET /api/members/lookup?phone=...
        │
   ┌────┴─────────────────────┐
   ✅ Ditemukan & aktif        ❌ Tidak ada / tidak aktif
   │                           │
   │                           └─→ tampil error, tetap IDLE
   ▼
memberStore.current = { id, name, phone, prices: [...] }
        │
        ▼
_applyPricesToCart() → loop cart items
  if SKU ada di priceMap → item.customPrice = harga member
  if SKU tidak ada       → item.customPrice = undefined (harga normal)
        │
        ▼
CartPanel reaktif update: harga item + total otomatis recalculate
        │
        ▼
[Opsional] Kasir tambah produk lagi
  → cart.add() → auto-apply customPrice dari memberStore
        │
        ▼
[Opsional] Kasir hapus member → [✕ Hapus Member]
  → memberStore.remove()
  → _resetCartPrices() → semua customPrice = undefined
  → semua harga kembali normal, cart tetap ada
  → bisa input member lain
        │
        ▼
Kasir klik "Proses Pembayaran"
        │
        ▼
PaymentModal → POST /api/transactions
  body: {
    memberId: "uuid",
    isMemberTransaction: true,
    items: [
      { sku: "PRD-001", sellingPrice: 15000, ... },  // harga sudah override
      { sku: "PRD-099", sellingPrice: 12000, ... },  // harga normal
    ]
  }
        │
        ▼
API simpan transaksi dengan memberId & isMemberTransaction=true
        │
        ▼
ReceiptView tampil dengan blok 🪪 info member
memberStore.remove() dipanggil setelah checkout selesai
```

---

## 📄 7. Receipt / Invoice — Tampil Info Member

### `ReceiptView.svelte` — tambah blok member

```
┌────────────────────────────────┐
│  🪪 TRANSAKSI MEMBER           │
│  Nama  : Budi Santoso          │
│  No HP : 08123456789           │
└────────────────────────────────┘
```

### `UITransaction` — tambah field

```typescript
// apps/web/src/types/index.ts
export interface UITransaction {
  // ... existing fields ...
  memberId?: string;
  memberName?: string;         // ← denormalized dari JOIN di API response
  memberPhone?: string;        // ← denormalized dari JOIN di API response
  isMemberTransaction?: boolean;
}
```

> API `/transactions/:id` JOIN ke tabel `members` → kirim `memberName` & `memberPhone` langsung di response.

---

## 🖥️ 8. Web — Halaman Manajemen Member

Buat feature baru: `apps/web/src/features/members/`

### File Structure

```
apps/web/src/features/members/
├── MembersView.svelte           ← halaman utama (tabel member)
└── components/
    ├── MemberFormModal.svelte   ← modal tambah/edit member
    └── MemberPricesPanel.svelte ← panel kelola harga khusus per member
```

### Tampilan Halaman Member

```
┌─────────────────────────────────────────────────┐
│  🪪 Manajemen Member                [+ Tambah]  │
│  [🔍 Cari nama / nomor HP...]                  │
├─────────────────────────────────────────────────┤
│  Nama          │ No HP       │ Harga Khusus │ ∙ │
│  Budi Santoso  │ 081234...   │ 5 produk     │ ✏ │
│  Siti Aminah   │ 085678...   │ 2 produk     │ ✏ │
└─────────────────────────────────────────────────┘
```

### Modal Kelola Harga Khusus

```
┌──────────────────────────────────────────────────┐
│  Harga Khusus — Budi Santoso                     │
│                                                  │
│  Produk               │ Harga Normal │ Harga Member │
│  Produk ABC (PRD-001) │  Rp 20.000  │ [15.000    ] │
│  Produk DEF (PRD-004) │  Rp 12.000  │ [8.000     ] │
│                                     [+ Tambah SKU] │
└──────────────────────────────────────────────────┘
```

> Dropdown produk diambil dari `/api/products`, ditampilkan sebagai `{name} — SKU: {sku}` dengan harga normal sebagai referensi.

### Sidebar Navigation

Tambah item menu baru di `Sidebar.svelte`:
```
🪪 Member
```

---

## 🛡️ 9. Edge Cases yang Ter-cover

| Skenario | Behavior |
|---|---|
| Member dihapus, cart tidak kosong | ✅ Cart tetap, semua harga otomatis balik normal |
| Member lain diinput setelah hapus | ✅ Harga di-update ke deal member baru |
| Produk ditambah saat member aktif | ✅ Langsung pakai harga member (kalau ada deal) |
| Produk ditambah setelah member dihapus | ✅ Pakai harga normal |
| Member tidak punya deal untuk 1 SKU | ✅ SKU itu tetap harga normal, SKU lain tetap member |
| Cart dikosongkan (bersihkan) | ✅ Member state tetap aktif, produk berikutnya tetap pakai harga member |
| Checkout selesai | ✅ `memberStore.remove()` dipanggil, siap transaksi berikutnya |
| Member tidak aktif | ✅ API return data, frontend tampil warning, harga tidak diapply |

---

## 📋 10. Urutan Implementasi

> Implementasi bertahap supaya tiap layer bisa ditest sebelum lanjut.

| Tahap | Pekerjaan | File Terdampak |
|---|---|---|
| **1 — DB** | Tambah tabel `members`, `member_prices`, kolom baru di `transactions` | `schema.ts`, `drizzle migrate` |
| **2 — API Members** | Buat `members.controller.ts` + `members.service.ts`, daftarkan di `index.ts` | `src/modules/members/`, `src/index.ts` |
| **3 — API Trx** | Update `transactions.service.ts` terima `memberId`, JOIN member di GET response | `transactions.service.ts` |
| **4 — Types** | Tambah `UIMember`, `UIMemberPrice`, update `UITransaction` | `apps/web/src/types/index.ts` |
| **5 — Member State** | Buat `member.svelte.ts` dengan `confirm()`, `remove()`, `_applyPricesToCart()` | `apps/web/src/features/pos/logic/` |
| **6 — Cart Integration** | Update `cart.add()` untuk auto-apply harga member | `cart.svelte.ts` |
| **7 — Kasir UI** | Update `CartPanel.svelte` (input HP + 4 state UI + harga coret + info hemat) | `CartPanel.svelte` |
| **8 — Halaman Member** | Buat `MembersView.svelte` + komponen manajemen member & harga | `apps/web/src/features/members/` |
| **9 — Sidebar** | Tambah nav item Member | `Sidebar.svelte` |
| **10 — Receipt** | Update `ReceiptView.svelte` tampil blok info member | `ReceiptView.svelte` |

---

## ✅ Semua Keputusan Desain (Final)

| Pertanyaan | Jawaban Final |
|---|---|
| Member scope per-store atau global? | ✅ **Global** — tidak ada `storeId` di tabel member |
| Pendekatan harga: fixed / persentase / hybrid? | ✅ **Fixed price per SKU** — produk tanpa deal pakai harga normal |
| Override harga semua item yang sudah di cart saat member dikonfirmasi? | ✅ Ya — `_applyPricesToCart()` loop semua item langsung |
| Produk baru ditambah setelah member aktif? | ✅ Langsung auto-apply harga member di `cart.add()` |
| Kasir hapus member → harga cart? | ✅ Semua harga balik normal otomatis, cart tidak dihapus |
| Bisa ganti member mid-transaction? | ✅ Hapus → input HP baru → harga update ke member baru |
| Harga member tersimpan di transaksi? | ✅ `memberId` + `isMemberTransaction = true` di tabel transactions |
| Nama/HP member di receipt? | ✅ Tampil di `ReceiptView` sebagai blok 🪪 TRANSAKSI MEMBER |

---

*Dokumen diskusi final — siap dieksekusi.*

