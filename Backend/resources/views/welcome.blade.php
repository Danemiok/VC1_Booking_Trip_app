<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>VC1 Trip Booking App</title>
    <style>
      :root {
        --bg: #091413;
        --bg-soft: rgba(9, 20, 19, 0.72);
        --surface: rgba(8, 16, 15, 0.55);
        --surface-strong: rgba(8, 16, 15, 0.82);
        --line: rgba(176, 228, 204, 0.18);
        --line-strong: rgba(176, 228, 204, 0.34);
        --text: #f5faf7;
        --muted: rgba(229, 243, 236, 0.74);
        --muted-strong: rgba(229, 243, 236, 0.88);
        --primary: #285a48;
        --primary-soft: #408a71;
        --accent: #b0e4cc;
        --shadow: 0 28px 80px rgba(0, 0, 0, 0.4);
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
      }

      body {
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--text);
        background:
          linear-gradient(180deg, rgba(9, 20, 19, 0.32), rgba(9, 20, 19, 0.78)),
          radial-gradient(circle at top left, rgba(64, 138, 113, 0.24), transparent 38%),
          radial-gradient(circle at bottom right, rgba(176, 228, 204, 0.14), transparent 34%),
          url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2400") center/cover fixed;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
      }

      .page::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(130deg, rgba(9, 20, 19, 0.72), rgba(9, 20, 19, 0.2) 55%, rgba(9, 20, 19, 0.78)),
          linear-gradient(180deg, rgba(9, 20, 19, 0.28), rgba(9, 20, 19, 0.72));
        pointer-events: none;
      }

      .topbar,
      .hero,
      .footer {
        position: relative;
        z-index: 1;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 24px clamp(18px, 4vw, 44px);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
      }

      .brand-mark {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        background: linear-gradient(145deg, rgba(40, 90, 72, 1), rgba(64, 138, 113, 1));
        box-shadow: 0 14px 30px rgba(40, 90, 72, 0.35);
        display: grid;
        place-items: center;
        font-weight: 800;
        letter-spacing: 0.14em;
        color: white;
        flex: 0 0 auto;
      }

      .brand-text {
        min-width: 0;
      }

      .brand-title {
        margin: 0;
        font-size: 1.06rem;
        font-weight: 800;
        letter-spacing: 0.02em;
      }

      .brand-subtitle {
        margin: 4px 0 0;
        font-size: 0.72rem;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(176, 228, 204, 0.08);
        color: var(--muted-strong);
        font-size: 0.86rem;
        backdrop-filter: blur(12px);
      }

      .hero {
        flex: 1;
        display: grid;
        align-items: center;
        padding: 12px clamp(18px, 4vw, 44px) 36px;
      }

      .hero-grid {
        width: min(1280px, 100%);
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
        gap: 28px;
        align-items: stretch;
      }

      .hero-copy {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: min(72vh, 860px);
        padding: clamp(22px, 4vw, 44px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 36px;
        background: linear-gradient(180deg, rgba(8, 16, 15, 0.32), rgba(8, 16, 15, 0.1));
        backdrop-filter: blur(10px);
        box-shadow: var(--shadow);
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: fit-content;
        padding: 10px 16px;
        margin-bottom: 20px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.06);
        text-transform: uppercase;
        letter-spacing: 0.3em;
        font-size: 0.72rem;
        font-weight: 800;
        color: rgba(245, 250, 247, 0.9);
      }

      .hero h1 {
        margin: 0;
        max-width: 10ch;
        font-size: clamp(3rem, 8vw, 6.4rem);
        line-height: 0.92;
        letter-spacing: -0.06em;
        text-wrap: balance;
      }

      .hero h1 .script {
        display: block;
        font-family: Georgia, "Times New Roman", serif;
        font-style: italic;
        font-weight: 500;
        color: var(--accent);
        letter-spacing: -0.04em;
        margin-top: 4px;
      }

      .hero p {
        max-width: 58ch;
        margin: 20px 0 0;
        font-size: 1.05rem;
        line-height: 1.8;
        color: var(--muted);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 32px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 52px;
        padding: 0 20px;
        border-radius: 16px;
        border: 1px solid transparent;
        font-weight: 800;
        font-size: 0.96rem;
        transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
      }

      .btn:hover {
        transform: translateY(-1px);
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--primary), var(--primary-soft));
        color: white;
        box-shadow: 0 18px 36px rgba(40, 90, 72, 0.32);
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.16);
        color: var(--text);
        backdrop-filter: blur(10px);
      }

      .btn-ghost {
        background: transparent;
        border-color: var(--line);
        color: var(--muted-strong);
      }

      .hero-panel {
        display: grid;
        gap: 18px;
        align-content: start;
      }

      .glass-card {
        border-radius: 28px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: linear-gradient(180deg, rgba(10, 22, 20, 0.78), rgba(8, 16, 15, 0.58));
        backdrop-filter: blur(16px);
        box-shadow: var(--shadow);
        overflow: hidden;
      }

      .preview {
        min-height: 280px;
        position: relative;
        padding: 22px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      .preview::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(9, 20, 19, 0.05), rgba(9, 20, 19, 0.82)),
          url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200") center/cover;
        transform: scale(1.02);
      }

      .preview > * {
        position: relative;
        z-index: 1;
      }

      .preview-badge {
        width: fit-content;
        padding: 9px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.12);
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.92);
      }

      .preview h2 {
        margin: 14px 0 6px;
        font-size: 1.4rem;
        line-height: 1.1;
      }

      .preview p {
        margin: 0;
        color: rgba(255, 255, 255, 0.82);
        font-size: 0.95rem;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .stat {
        padding: 18px 18px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.02);
      }

      .stat:last-child {
        border-right: 0;
      }

      .stat-value {
        display: block;
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text);
      }

      .stat-label {
        display: block;
        margin-top: 6px;
        font-size: 0.76rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgba(229, 243, 236, 0.65);
      }

      .link-grid {
        display: grid;
        gap: 14px;
      }

      .link-card {
        display: block;
        padding: 18px 18px 18px 20px;
        border-radius: 22px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(14px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.14);
        transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
      }

      .link-card:hover {
        transform: translateY(-2px);
        border-color: rgba(176, 228, 204, 0.3);
        background: rgba(176, 228, 204, 0.08);
      }

      .link-card h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 800;
      }

      .link-card p {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 0.93rem;
        line-height: 1.55;
      }

      .footer {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
        padding: 0 clamp(18px, 4vw, 44px) 22px;
        color: rgba(229, 243, 236, 0.6);
        font-size: 0.8rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      @media (max-width: 1024px) {
        .hero-grid {
          grid-template-columns: 1fr;
        }

        .hero-copy {
          min-height: auto;
        }
      }

      @media (max-width: 640px) {
        .topbar {
          align-items: flex-start;
        }

        .brand-subtitle {
          letter-spacing: 0.18em;
        }

        .hero {
          padding-top: 0;
        }

        .hero-copy,
        .preview {
          border-radius: 24px;
        }

        .stats {
          grid-template-columns: 1fr;
        }

        .stat {
          border-right: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .stat:last-child {
          border-bottom: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">VC</div>
          <div class="brand-text">
            <p class="brand-title">VC1 Trip Booking App</p>
            <p class="brand-subtitle">Backend control center</p>
          </div>
        </div>

        <span class="chip">Full-screen welcome background</span>
      </header>

      <main class="hero">
        <div class="hero-grid">
          <section class="hero-copy">
            <div class="eyebrow">Exclusive Travel Experiences</div>
            <h1>
              Explore the
              <span class="script">Kingdom of Wonder</span>
            </h1>
            <p>
              A cinematic backend landing page with a full-screen travel background, layered glass panels,
              and clear entry points for the frontend, admin dashboard, and API status.
            </p>

            <div class="actions">
              <a
                class="btn btn-primary"
                href="{{ rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/') }}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Frontend
              </a>
              <a class="btn btn-secondary" href="{{ route('dashboard') }}">
                Open Dashboard
              </a>
              <a class="btn btn-ghost" href="{{ url('/status') }}">
                API Status
              </a>
            </div>
          </section>

          <aside class="hero-panel">
            <section class="glass-card preview">
              <div class="preview-badge">Travel Hub</div>
              <h2>Built for bookings, planning, and admin control</h2>
              <p>Use the backend as a secure entry point while keeping the experience visually rich.</p>
            </section>

            <section class="glass-card stats">
              <div class="stat">
                <span class="stat-value">Fullscreen</span>
                <span class="stat-label">Landing view</span>
              </div>
              <div class="stat">
                <span class="stat-value">Dark</span>
                <span class="stat-label">Background mood</span>
              </div>
              <div class="stat">
                <span class="stat-value">Glass</span>
                <span class="stat-label">UI surface</span>
              </div>
            </section>

            <section class="link-grid">
              <a class="link-card" href="{{ route('dashboard') }}">
                <h3>Admin Dashboard</h3>
                <p>Jump straight into system management for users, bookings, destinations, and settings.</p>
              </a>
              <a class="link-card" href="{{ route('google.redirect') }}">
                <h3>Google Auth</h3>
                <p>Start the OAuth flow for sign-in with Google from the backend side.</p>
              </a>
              <a class="link-card" href="{{ url('/status') }}">
                <h3>Backend Status</h3>
                <p>Open the live JSON health endpoint to confirm the backend is running.</p>
              </a>
            </section>
          </aside>
        </div>
      </main>

      <footer class="footer">
        <span>Laravel v{{ Illuminate\Foundation\Application::VERSION }}</span>
        <span>PHP v{{ PHP_VERSION }}</span>
      </footer>
    </div>
  </body>
</html>
