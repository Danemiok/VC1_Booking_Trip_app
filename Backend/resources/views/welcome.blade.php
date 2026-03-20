<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>VC1 Trip Booking App</title>
    <style>
      :root {
        color-scheme: light dark;
      }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        background: #0b1220;
        color: #e2e8f0;
      }
      a {
        color: inherit;
        text-decoration: none;
      }
      .page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px 16px;
      }
      .card {
        width: min(980px, 100%);
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(15, 23, 42, 0.8);
        border-radius: 18px;
        padding: 28px;
        box-shadow: 0 20px 55px rgba(0, 0, 0, 0.35);
      }
      .title {
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin: 0 0 6px;
      }
      .subtitle {
        margin: 0 0 20px;
        color: rgba(226, 232, 240, 0.8);
        font-size: 14px;
        line-height: 1.5;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 14px;
      }
      .link {
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 14px;
        padding: 16px 16px;
        background: rgba(2, 6, 23, 0.35);
        transition: transform 0.12s ease, border-color 0.12s ease;
      }
      .link:hover {
        transform: translateY(-1px);
        border-color: rgba(59, 130, 246, 0.55);
      }
      .link h2 {
        margin: 0 0 6px;
        font-size: 15px;
        font-weight: 800;
      }
      .link p {
        margin: 0;
        font-size: 13px;
        color: rgba(226, 232, 240, 0.78);
        line-height: 1.45;
      }
      .meta {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 18px;
        color: rgba(226, 232, 240, 0.6);
        font-size: 12px;
        flex-wrap: wrap;
      }
      @media (prefers-color-scheme: light) {
        body {
          background: #f8fafc;
          color: #0f172a;
        }
        .card {
          background: white;
          border-color: rgba(15, 23, 42, 0.12);
          box-shadow: 0 20px 55px rgba(2, 6, 23, 0.12);
        }
        .subtitle,
        .link p,
        .meta {
          color: rgba(15, 23, 42, 0.7);
        }
        .link {
          background: rgba(2, 6, 23, 0.03);
          border-color: rgba(15, 23, 42, 0.12);
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <main class="card">
        <h1 class="title">VC1 Trip Booking App</h1>
        <p class="subtitle">
          Backend is up. Use the links below to open the frontend, check the API status JSON, or go to the dashboard.
        </p>

        <div class="grid">
          <a
            class="link"
            href="{{ rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/') }}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>Frontend Application</h2>
            <p>Opens the Vite frontend (configure with <code>FRONTEND_URL</code>).</p>
          </a>

          <a class="link" href="{{ url('/?format=json') }}">
            <h2>Backend API Status</h2>
            <p>Returns JSON health response from <code>/</code>.</p>
          </a>

          <a class="link" href="{{ route('dashboard') }}">
            <h2>Dashboard</h2>
            <p>Redirects to the appropriate Inertia dashboard after login.</p>
          </a>
        </div>

        <div class="meta">
          <span>Laravel v{{ Illuminate\Foundation\Application::VERSION }}</span>
          <span>PHP v{{ PHP_VERSION }}</span>
        </div>
      </main>
    </div>
  </body>
</html>

