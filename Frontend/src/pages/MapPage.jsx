import React from 'react';
import { ArrowLeft, MapPin, Navigation, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function MapPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(47,160,132,0.14),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <BrandLogo variant="mark" className="h-10 w-10 overflow-hidden rounded-xl" />

          <div className="w-[72px]" />
        </div>

        <div className="grid flex-1 gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="relative min-h-[420px] overflow-hidden bg-slate-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589308078059-2bd1c2c5180d?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/40 to-emerald-900/20" />

            <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur">
                  <Search className="h-3.5 w-3.5" />
                  Explore Destinations
                </span>
                <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Find routes, places, and travel spots across Cambodia
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                  The interactive map view is ready to connect with your destination data. For now, this route gives travelers a quick visual starting point for exploring where they want to go next.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Popular', value: 'Siem Reap' },
                  { label: 'City', value: 'Phnom Penh' },
                  { label: 'Coast', value: 'Sihanoukville' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">{item.label}</div>
                    <div className="mt-2 text-base font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-5 p-6 sm:p-8">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Map preview</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Route placeholder connected to destination browsing.</p>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
                <div className="h-64 bg-[linear-gradient(135deg,rgba(59,130,246,0.14),rgba(16,185,129,0.14))] p-5">
                  <div className="flex h-full items-center justify-center rounded-[1.25rem] border border-dashed border-slate-300 bg-white/70 text-center dark:border-white/15 dark:bg-slate-950/70">
                    <div>
                      <Navigation className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-300" />
                      <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Interactive map coming soon</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        This page is now available so the app can load cleanly while the live map integration is connected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950">
              <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Next steps</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li>Connect this route to a map provider when you are ready.</li>
                <li>Show destination pins from the existing hotel and trip data.</li>
                <li>Keep the current route so the Vite import stays stable.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

