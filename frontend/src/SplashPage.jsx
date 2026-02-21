import { Link } from 'react-router-dom';
import atticaLogo from './assets/attica2.png';

const features = [
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
        ),
        title: 'Plan Your Event',
        description: 'Create and manage events of any scale — from intimate gatherings to large festivals.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
        ),
        title: 'Find Vendors & Artists',
        description: 'Browse a curated marketplace of caterers, decorators, DJs, photographers, and more.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
        ),
        title: 'Chat & Book Directly',
        description: 'Message service providers in real time, negotiate bids, and book — all in one place.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
        ),
        title: 'Discover Venues',
        description: 'Explore stunning venues and locations perfect for your next celebration.',
    },
];

export default function SplashPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
                    <a href="/" className="flex items-center space-x-2">
                        <img src={atticaLogo} alt="Attica" className="h-10 w-auto" />
                    </a>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-5rem)]">
                        {/* Left: Text Content */}
                        <div className="py-16 lg:py-24">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                Your event,{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
                                    perfectly planned
                                </span>
                            </h1>
                            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed">
                                Attica connects event organizers with the best vendors, artists, and venues — all in one marketplace. Plan, book, and bring your vision to life.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all hover:shadow-lg"
                                >
                                    Get started
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
                                >
                                    Log in
                                </Link>
                            </div>

                            {/* Social Proof */}
                            <div className="mt-14 flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex -space-x-2">
                                    {[
                                        'bg-pink-400', 'bg-rose-300', 'bg-pink-300', 'bg-rose-400'
                                    ].map((bg, i) => (
                                        <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white`} />
                                    ))}
                                </div>
                                <span>Join hundreds of organizers already using Attica</span>
                            </div>
                        </div>

                        {/* Right: Hero Visual */}
                        <div className="relative hidden lg:block">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800"
                                    alt="Event celebration"
                                    className="w-full h-[600px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                {/* Floating Card */}
                                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-pink-500 uppercase tracking-wider">Featured Event</p>
                                            <p className="text-lg font-bold text-gray-900 mt-1">Summer Music Festival 2026</p>
                                            <p className="text-sm text-gray-500 mt-0.5">Johannesburg, South Africa</p>
                                        </div>
                                        <div className="bg-pink-500 text-white rounded-full px-4 py-2 text-sm font-semibold">
                                            Live
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-pink-100 rounded-full blur-2xl opacity-60" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-100 rounded-full blur-3xl opacity-50" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Everything you need to make it happen
                        </h2>
                        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                            Whether you're organizing or providing services, Attica has the tools to connect you.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-14 h-14 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center mb-5">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-20 sm:px-16 text-center">
                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose-500 rounded-full blur-3xl" />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                Ready to bring your event to life?
                            </h2>
                            <p className="mt-5 text-lg text-gray-300 max-w-xl mx-auto">
                                Join Attica today and start planning your next unforgettable experience.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-900 bg-white rounded-full hover:bg-gray-100 transition-all hover:shadow-lg"
                                >
                                    Create your free account
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border border-white/30 rounded-full hover:bg-white/10 transition-all"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <img src={atticaLogo} alt="Attica" className="h-8 w-auto" />
                        <span className="text-sm text-gray-400">&copy; 2026 Attica. All rights reserved.</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <Link to="/login" className="hover:text-gray-900 transition-colors">Log in</Link>
                        <Link to="/register" className="hover:text-gray-900 transition-colors">Sign up</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
