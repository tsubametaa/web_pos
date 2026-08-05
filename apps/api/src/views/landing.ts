export function getLandingPageHtml(): string {
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  const environment = process.env.NODE_ENV === 'production' ? 'Production' : 'Development';
  const serverlessPlatform = isVercel ? 'Vercel Serverless' : 'Bun Server';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>POS Elysia API - Gateway & Service Status</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(30, 41, 59, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --accent: #a855f7;
      --success: #10b981;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --code-bg: #090d16;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2.5rem 1.5rem;
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(168, 85, 247, 0.12) 0%, transparent 40%);
    }

    .container {
      max-width: 960px;
      width: 100%;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--card-border);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-icon {
      font-size: 2rem;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
    }

    .brand-text h1 {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-text p {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.85rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 9999px;
      font-size: 0.825rem;
      font-weight: 500;
      color: var(--success);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background-color: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .hero-card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .hero-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .hero-desc {
      color: var(--text-muted);
      font-size: 0.975rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      border-color: rgba(99, 102, 241, 0.3);
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .endpoints-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .endpoint-item {
      background: var(--card-bg);
      backdrop-filter: blur(8px);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      transition: border-color 0.2s ease, background 0.2s ease;
    }

    .endpoint-item:hover {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(30, 41, 59, 0.85);
    }

    .endpoint-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .method {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      min-width: 60px;
      text-align: center;
    }

    .method.get { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .method.post { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .method.put { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .method.delete { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

    .path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      font-weight: 500;
      color: #e2e8f0;
    }

    .endpoint-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .btn-test {
      font-size: 0.8rem;
      font-weight: 500;
      color: #ffffff;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      padding: 0.35rem 0.85rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-test:hover {
      background: var(--primary);
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    footer {
      margin-top: 3rem;
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      border-top: 1px solid var(--card-border);
      padding-top: 1.5rem;
    }

    .tech-stack {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 0.75rem;
      font-size: 0.8rem;
      color: #cbd5e1;
    }

    @media (max-width: 640px) {
      header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .endpoint-item { flex-direction: column; align-items: flex-start; }
      .endpoint-left { width: 100%; justify-content: space-between; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="brand-icon">🦊</div>
        <div class="brand-text">
          <h1>Tsubameta POS API</h1>
          <p>High Performance Serverless Backend</p>
        </div>
      </div>
      <div class="status-badge">
        <span class="status-dot"></span>
        System Operational
      </div>
    </header>

    <main>
      <div class="hero-card">
        <h2 class="hero-title">API Gateway & Control Panel</h2>
        <p class="hero-desc">
          Backend POS (Point of Sale) berbasis <strong>ElysiaJS</strong> dan <strong>Bun Runtime</strong>, dirancang untuk efisiensi tinggi, pencatatan transaksi cepat, dan skalabilitas serverless di Vercel.
        </p>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Framework</div>
            <div class="stat-value">⚡ ElysiaJS</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Runtime</div>
            <div class="stat-value">🧅 Bun Runtime</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Platform</div>
            <div class="stat-value">☁️ ${serverlessPlatform}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Environment</div>
            <div class="stat-value">🛡️ ${environment}</div>
          </div>
        </div>
      </div>

      <h3 class="section-title">📌 Registered API Endpoints</h3>
      <div class="endpoints-list">
        <div class="endpoint-item">
          <div class="endpoint-left">
            <span class="method get">GET</span>
            <span class="path">/api/health</span>
          </div>
          <span class="endpoint-desc">Pemeriksaan kesehatan sistem & status database</span>
          <a href="/api/health" target="_blank" class="btn-test">Uji API ↗</a>
        </div>

        <div class="endpoint-item">
          <div class="endpoint-left">
            <span class="method post">POST</span>
            <span class="path">/api/auth/login</span>
          </div>
          <span class="endpoint-desc">Otentikasi pengguna & pembuatan token JWT</span>
          <span class="endpoint-desc">Auth Service</span>
        </div>

        <div class="endpoint-item">
          <div class="endpoint-left">
            <span class="method get">GET</span>
            <span class="path">/api/products</span>
          </div>
          <span class="endpoint-desc">Manajemen katalog produk & stok barang</span>
          <a href="/api/products" target="_blank" class="btn-test">Uji API ↗</a>
        </div>

        <div class="endpoint-item">
          <div class="endpoint-left">
            <span class="method get">GET</span>
            <span class="path">/api/transactions</span>
          </div>
          <span class="endpoint-desc">Riwayat transaksi & pencatatan penjualan</span>
          <a href="/api/transactions" target="_blank" class="btn-test">Uji API ↗</a>
        </div>

        <div class="endpoint-item">
          <div class="endpoint-left">
            <span class="method get">GET</span>
            <span class="path">/api/dashboard</span>
          </div>
          <span class="endpoint-desc">Statistik penjualan & metriks analitik POS</span>
          <a href="/api/dashboard" target="_blank" class="btn-test">Uji API ↗</a>
        </div>

        <div class="endpoint-item">
          <div class="endpoint-left">
            <span class="method get">GET</span>
            <span class="path">/api/etalase</span>
          </div>
          <span class="endpoint-desc">Katalog publik etalase untuk pembeli</span>
          <a href="/api/etalase" target="_blank" class="btn-test">Uji API ↗</a>
        </div>

        <div class="endpoint-item">
          <div class="endpoint-left">
            <span class="method post">POST</span>
            <span class="path">/api/uploads</span>
          </div>
          <span class="endpoint-desc">Unggah gambar & media produk</span>
          <span class="endpoint-desc">Upload Service</span>
        </div>
      </div>
    </main>

    <footer>
      <p>&copy; ${new Date().getFullYear()} Tsubameta POS. All rights reserved.</p>
      <div class="tech-stack">
        <span>ElysiaJS 1.2+</span> • 
        <span>Bun 1.x</span> • 
        <span>Drizzle ORM</span> • 
        <span>Turso SQLite</span>
      </div>
    </footer>
  </div>
</body>
</html>`;
}
