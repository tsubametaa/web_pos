import type { ServiceItem, ProjectItem, TestimonialItem, Product } from '../lib/types';

export const COMPANY_INFO = {
  name: 'Karya Sejati',
  tagline: 'Solusi Utama Furnitur Custom & Aluminium Presisi',
  description:
    'Karya Sejati adalah spesialis pembuatan furnitur custom dan pengerjaan konstruksi aluminium berkualitas tinggi. Kami menghadirkan kombinasi estetika modern, ketahanan material premium, dan kepresisian pengerjaan langsung dari workshop profesional.',
  phone: '081234567890',
  whatsapp: '6281234567890',
  email: 'info@karyasejati.co.id',
  address: 'Jl. Raya Industri Utama No. 88, Kawasan Bengkel & Furnitur, Jawa Barat',
  experienceYears: 12,
  completedProjects: 1500,
  satisfactionRate: 99,
};

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'furnitur-custom',
    title: 'Furnitur Custom Premium',
    subtitle: 'Kitchen Set, Lemari, Meja & Interior',
    category: 'furnitur',
    description:
      'Perancangan dan pembuatan furnitur kustom berkesan mewah menggunakan kayu lapis pilihan (Multiplek/HPL), kayu solid, dan finishing presisi sesuai kebutuhan ruangan Anda.',
    features: [
      'Kitchen Set Minimalis & Modern HPL',
      'Wardrobe & Lemari Pakaian Custom',
      'Meja Kantor & Partisi Workstation',
      'Backdrop TV & Credenza Interior',
    ],
    icon: 'Armchair',
    badge: 'Spesialis Interior',
  },
  {
    id: 'aluminium-specialist',
    title: 'Konstruksi Aluminium',
    subtitle: 'Kusen, Pintu, Jendela & Kanopi',
    category: 'aluminium',
    description:
      'Pengerjaan konstruksi aluminium anti-karat, kedap suara, dan tahan cuaca. Ideal untuk rumah tinggal, gedung perkantoran, ruko, dan bangunan commercial.',
    features: [
      'Kusen Aluminium Alexindo / YKK',
      'Pintu Lipat, Sliding & Swing Aluminium',
      'Jendela Casement & Sliding Kedap',
      'Kanopi Aluminium & Partisi Kaca Tempered',
    ],
    icon: 'Layers',
    badge: 'Konstruksi Utama',
  },
];

export const PORTFOLIO_DATA: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'Kitchen Set Modern HPL Red Gloss',
    category: 'Furnitur Custom',
    client: 'Residensi Grand Cluster',
    location: 'Bandung',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    description: 'Pengerjaan kitchen set island dengan kombinasi aksen merah glos HPL, multiplek 18mm, dan top table quartz stone.',
  },
  {
    id: 'proj-2',
    title: 'Pintu & Kusen Aluminium Powder Coating',
    category: 'Aluminium',
    client: 'Gedung Perkantoran BSD',
    location: 'Tangerang',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: 'Pemasangan façade curtain wall dan jendela casement aluminium hitam doff tahan angin & hujan.',
  },
  {
    id: 'proj-3',
    title: 'Wardrobe Walk-in Closet & Backdrop TV',
    category: 'Furnitur Custom',
    client: 'Villa Privat Lembang',
    location: 'Bandung Barat',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    description: 'Lemari pakaian raksasa dengan pintu kaca tempered aluminium frame dan pencahayaan LED warm white.',
  },
  {
    id: 'proj-4',
    title: 'Kanopi Aluminium & Frame Partisi Kaca',
    category: 'Aluminium',
    client: 'Showroom Commercial',
    location: 'Jakarta Selatan',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    description: 'Struktur kanopi alumunium ringan namun ultra-kokoh dipadu kaca tempered lapis sun-filter.',
  },
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'Bpk. Hendra Wijaya',
    role: 'Pemilik Rumah di BSD',
    comment: 'Pengerjaan kitchen set dan kusen aluminium rumah saya sangat rapi. Tim Karya Sejati datang ukur presisi dan selesai tepat waktu!',
    rating: 5,
  },
  {
    id: 'test-2',
    name: 'Ibu Rina Sastrowardoyo',
    role: 'Interior Designer',
    comment: 'Sudah 3 proyek interior perkantoran saya menggunakan jasa Karya Sejati. Kualitas bahan aluminium dan kayu HPL tidak pernah mengecewakan.',
    rating: 5,
  },
  {
    id: 'test-3',
    name: 'Bpk. Aris Munandar',
    role: 'Kontraktor Bangunan',
    comment: 'Respon cepat dan harga langsung dari workshop tanpa perantara. Rekomendasi utama untuk kebutuhan aluminium & furnitur custom.',
    rating: 5,
  },
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Kusen Aluminium Alexindo 4 Inchi',
    sku: 'ALM-KSN-01',
    category: 'Aluminium',
    sellingPrice: 145000,
    unit: 'meter',
    description: 'Kusen aluminium premium tebal 1.1mm - 1.3mm, pilihan warna Hitam, Cokelat, Putih, atau Silver. Tahan rayap & cuaca ekstrem.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
  {
    id: 'p-2',
    name: 'Pintu Lipat Aluminium + Kaca Tempered 5mm',
    sku: 'ALM-PT-LPT',
    category: 'Aluminium',
    sellingPrice: 1850000,
    unit: 'daun',
    description: 'Pintu lipat aluminium serbaguna cocok untuk taman belakang, garasi, maupun pembatas ruangan cafe.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
  {
    id: 'p-3',
    name: 'Kitchen Set Minimalis HPL Premium Custom',
    sku: 'FNR-KTC-01',
    category: 'Furnitur',
    sellingPrice: 2400000,
    unit: 'meter lari',
    description: 'Kitchen set berbahan multiplek 18mm lapis HPL motif kayu/polos. Sudah termasuk engsel slow motion & rak piring stainless.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
  {
    id: 'p-4',
    name: 'Jendela Casement Aluminium Kedap Suara',
    sku: 'ALM-JND-CSM',
    category: 'Aluminium',
    sellingPrice: 650000,
    unit: 'unit',
    description: 'Jendela swing casement aluminium dengan karet seal ganda, mampu menahan suara bising luar hingga 70%.',
    imageUrl: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?auto=format&fit=crop&w=600&q=80',
    image: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
  {
    id: 'p-5',
    name: 'Wardrobe Lemari Pakaian Pintu Geser Kaca',
    sku: 'FNR-WRD-01',
    category: 'Furnitur',
    sellingPrice: 3200000,
    unit: 'unit',
    description: 'Lemari pakaian custom tinggi plafon dengan sliding door kaca cermin full frame aluminium.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
  {
    id: 'p-6',
    name: 'Meja Kantor Director Executif HPL & Aluminium',
    sku: 'FNR-MJA-DIR',
    category: 'Furnitur',
    sellingPrice: 2750000,
    unit: 'unit',
    description: 'Meja kerja eksekutif ergonomis dengan kaki aluminium kokoh dan manajemen kabel tersembunyi.',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
];

