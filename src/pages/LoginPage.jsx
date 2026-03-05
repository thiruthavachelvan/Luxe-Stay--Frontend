import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${__API_BASE__}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // Save user data/token
            sessionStorage.setItem('userToken', data.token);
            sessionStorage.setItem('userData', JSON.stringify(data));

            const role = data.role || 'resident';

            if (role === 'admin') {
                navigate('/admin');
            } else {
                // Check for a redirect URL preserved in search params
                const params = new URLSearchParams(window.location.search);
                const redirectTo = params.get('redirect');
                if (redirectTo) {
                    navigate(decodeURIComponent(redirectTo));
                } else if (role === 'resident') {
                    navigate('/dashboard');
                } else {
                    navigate(`/staff/${role}`);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Preserve the redirect query param for the sign up link
    const searchParams = new URLSearchParams(window.location.search);
    const redirectToUrl = searchParams.get('redirect');
    const signUpUrl = redirectToUrl ? `/signup?redirect=${encodeURIComponent(redirectToUrl)}` : '/signup';

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-navy-950 font-sans selection:bg-gold-400 selection:text-navy-950">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000"
                    alt="Luxury Interior"
                    className="w-full h-full object-cover opacity-40 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-950/20 to-navy-950" />
            </div>

            {/* Back to Home Link */}
            <Link to="/" className="absolute top-10 left-10 z-20 flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gold-400 transition-all duration-500">
                    <Building2 className="w-5 h-5 text-gold-400 group-hover:text-navy-950 transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-gold-400 transition-colors">Return to Pavilion</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-xl px-6"
            >
                <div className="glass-panel border-white/5 p-12 md:p-16 overflow-hidden">
                    <div className="absolute top-0 right-0 p-6">
                        <Sparkles className="w-6 h-6 text-gold-400/20" />
                    </div>

                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="h-px w-8 bg-gold-400/50" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-400">Authenticated Access</span>
                        </div>
                        <h2 className="text-5xl font-serif text-white mb-4 italic">Welcome <span className="text-gold-400">Back</span></h2>
                        <p className="text-white/40 text-sm font-light leading-relaxed">Please enter your distinguished credentials to resume your experience at LuxeStay.</p>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-6">
                            <div className="group">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 block mb-3 group-focus-within:text-gold-400 transition-colors">
                                    Identity / Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/30" />
                                    <input
                                        type="email"
                                        placeholder="yourname@domain.com"
                                        className="w-full bg-transparent border-b border-white/5 py-3 pl-8 text-sm text-white focus:outline-none focus:border-gold-400 transition-all font-light placeholder:text-white/10"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within:text-gold-400 transition-colors">
                                        Access Key
                                    </label>
                                    <Link to="/forgot-password" size="text-[9px]" className="text-[9px] font-bold text-white/20 hover:text-gold-400 transition-colors uppercase tracking-widest">
                                        Recover Key?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/30" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full bg-transparent border-b border-white/5 py-3 pl-8 pr-12 text-sm text-white focus:outline-none focus:border-gold-400 transition-all font-light placeholder:text-white/10"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-gold-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative py-5 bg-gold-400 text-navy-950 rounded-sm font-black text-[10px] uppercase tracking-[0.4em] overflow-hidden transition-all hover:bg-white hover:shadow-2xl hover:shadow-gold-400/20 disabled:opacity-50"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-4">
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
                                    ) : (
                                        <>
                                            Begin Journey
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            New resident?{' '}
                            <Link to={signUpUrl} className="text-gold-400 hover:text-white transition-colors ml-2">
                                Request Access
                            </Link>
                        </p>

                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest leading-none">Social Key:</span>
                            <div className="flex gap-4">
                                {[
                                    { name: 'Google', icon: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' },
                                    { name: 'Twitter', icon: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' }
                                ].map(social => (
                                    <button key={social.name} className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gold-400 group transition-all duration-500">
                                        <svg className="w-4 h-4 text-white/40 group-hover:text-navy-950 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                                            <path d={social.icon} />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;





