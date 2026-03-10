export default function Dashboard() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Customer Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Welcome to your dashboard. Manage bookings, view travel history, and explore destinations.
        </p>
      </div>
    </section>
  );
}
