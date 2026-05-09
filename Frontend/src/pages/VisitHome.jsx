import React from 'react';
import { ArrowRight, CalendarDays, Compass, Hotel, Search, Ship, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';

const quickLinks = [
    {
        title: 'Book a Trip',
        description: 'Start a guided booking flow and sign in when you are ready to confirm.',
        to: '/customer/book',
        icon: CalendarDays,
    },
    {
        title: 'Find Hotels',
        description: 'Browse curated stays and resort picks across Cambodia.',
        to: '/hotels',
        icon: Hotel,
    },
    {
        title: 'Explore Rentals',
        description: 'Compare transport and rental options for flexible travel.',
        to: '/rentals',
        icon: Ship,
    },
    {
        title: 'Discover Activities',
        description: 'See tours, adventures, and local experiences worth planning for.',
        to: '/activities',
        icon: Compass,
    },
];

const stats = [
    { value: '1,200+', label: 'stays and trips' },
    { value: '24/7', label: 'support ready' },
    { value: 'Dark', label: 'system friendly' },
];

const VisitHome = () => {
    return (
        <div className="min-h-screen bg-[#07110f] text-white">
            <div
                className="relative overflow-hidden"
                style={{
                    minHeight: '100svh',
                    backgroundImage: [
                        'linear-gradient(180deg, rgba(7,17,15,0.25), rgba(7,17,15,0.88))',
                        'radial-gradient(circle at top left, rgba(64,138,113,0.20), transparent 32%)',
                        'radial-gradient(circle at bottom right, rgba(176,228,204,0.10), transparent 30%)',
                        'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2400)',
                    ].join(', '),
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                }}
            >
                <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(7,17,15,0.74),rgba(7,17,15,0.22)_52%,rgba(7,17,15,0.82))]" />
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/20 to-transparent" />

                <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
                    <div className="flex items-center gap-3">
                        <BrandLogo variant="mark" className="h-10 w-10 rounded-2xl overflow-hidden shadow-[0_14px_30px_rgba(40,90,72,0.28)]" />
                        <div>
                            <p className="text-sm font-bold tracking-tight text-white sm:text-base">VC1 Trip Booking</p>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-[#b0e4cc]">Frontend experience</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-3 py-2 backdrop-blur-md">
                        <Sparkles className="h-4 w-4 text-[#b0e4cc]" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85">Compact landing</span>
                    </div>
                </header>

                <main className="relative z-10 flex items-center px-4 pb-6 pt-4 sm:px-6 lg:px-10">
                    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 lg:grid-cols-[1.1fr_0.85fr]">
                        <section className="rounded-[2rem] border border-white/10 bg-white/8 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.34)] backdrop-blur-md sm:p-8 lg:p-10">
                            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/90">
                                    Exclusive travel experiences
                                </span>
                                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.96] tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                                    Explore the
                                    <span className="mt-1 block font-serif italic font-medium text-[#b0e4cc]">Kingdom of Wonder</span>
                                </h1>
                                <p className="mt-4 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
                                    A compact landing screen with a smaller hero image, cleaner spacing, and quick
                                    entry points for booking, hotels, rentals, and activities.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 22 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="mt-6 grid gap-3 sm:grid-cols-3"
                            >
                                {stats.map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm"
                                    >
                                        <div className="text-lg font-black text-white sm:text-xl">{item.value}</div>
                                        <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/45">
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.18 }}
                                className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#091413]/60 p-2.5 shadow-2xl backdrop-blur-xl"
                            >
                                <div className="flex flex-col gap-2.5 md:flex-row md:items-stretch">
                                    <div className="flex flex-1 items-center gap-3 rounded-[1.4rem] border border-white/5 bg-white/5 px-4 py-3.5">
                                        <Search className="h-4 w-4 text-white/50" />
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40">
                                                Search destination
                                            </p>
                                            <p className="truncate text-sm font-semibold text-white/90 sm:text-[15px]">
                                                Where do you want to go next?
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/customer/book"
                                        className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[1.4rem] bg-white px-5 font-bold text-slate-900 transition-transform hover:-translate-y-0.5 hover:bg-[#b0e4cc]"
                                    >
                                        Start Booking
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.24 }}
                                className="mt-6 flex flex-wrap gap-2.5"
                            >
                                <Link
                                    to="/hotels"
                                    className="rounded-full border border-white/14 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white/92 transition hover:border-[#b0e4cc]/40 hover:bg-[#b0e4cc]/10"
                                >
                                    View Hotels
                                </Link>
                                <Link
                                    to="/rentals"
                                    className="rounded-full border border-white/14 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white/92 transition hover:border-[#b0e4cc]/40 hover:bg-[#b0e4cc]/10"
                                >
                                    Rentals
                                </Link>
                                <Link
                                    to="/activities"
                                    className="rounded-full border border-white/14 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white/92 transition hover:border-[#b0e4cc]/40 hover:bg-[#b0e4cc]/10"
                                >
                                    Activities
                                </Link>
                            </motion.div>
                        </section>

                        <aside className="grid gap-4 lg:self-stretch">
                            <motion.div
                                initial={{ opacity: 0, x: 18 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.45, delay: 0.15 }}
                                className="overflow-hidden rounded-[2rem] border border-white/12 bg-[#091413]/70 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
                            >
                                <div
                                    className="relative min-h-[220px] p-5 sm:min-h-[250px] sm:p-6"
                                    style={{
                                        backgroundImage:
                                            'linear-gradient(180deg, rgba(9,20,19,0.08), rgba(9,20,19,0.82)), url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                >
                                    <span className="inline-flex rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.26em] text-white/90">
                                        Travel Hub
                                    </span>
                                    <h2 className="mt-3 max-w-sm text-xl font-black leading-tight text-white sm:text-2xl">
                                        Make the frontend feel like a destination, not just a form.
                                    </h2>
                                    <p className="mt-2.5 max-w-md text-sm leading-6 text-white/78">
                                        This landing screen is designed to set the mood immediately with a full-bleed
                                        background and layered glass cards.
                                    </p>
                                </div>
                            </motion.div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                {quickLinks.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.div
                                            key={item.title}
                                            initial={{ opacity: 0, x: 18 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.45, delay: 0.08 * index }}
                                        >
                                            <Link
                                                to={item.to}
                                                className="group block rounded-[1.6rem] border border-white/10 bg-white/8 p-4 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#b0e4cc]/35 hover:bg-[#b0e4cc]/10"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#285a48] text-white shadow-lg shadow-[#285a48]/30">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <h3 className="text-sm font-bold text-white sm:text-base">{item.title}</h3>
                                                            <ArrowRight className="h-4 w-4 text-white/35 transition group-hover:translate-x-1 group-hover:text-[#b0e4cc]" />
                                                        </div>
                                                        <p className="mt-1.5 text-sm leading-6 text-white/65">{item.description}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VisitHome;
