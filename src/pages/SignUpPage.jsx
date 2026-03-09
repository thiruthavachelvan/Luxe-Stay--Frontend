import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, User, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import DocumentationDownload from '../components/DocumentationDownload';

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState('');
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
            const response = await fetch(`${__API_BASE__}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullName, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // Registration successful - check if we have to preserve redirect
            const params = new URLSearchParams(window.location.search);
            const redirectTo = params.get('redirect');
            if (redirectTo) {
                navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`);
            } else {
                navigate('/login');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const searchParams = new URLSearchParams(window.location.search);
    const redirectToUrl = searchParams.get('redirect');
    const loginUrl = redirectToUrl ? `/login?redirect=${encodeURIComponent(redirectToUrl)}` : '/login';

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-navy-950 font-sans selection:bg-gold-400 selection:text-navy-950">
            <DocumentationDownload />
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=2000"
                    alt="Luxury Interior"
                    className="w-full h-full object-cover opacity-40 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-950/20 to-navy-950" />
            </div>


            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-xl px-6 py-20"
            >
                <div className="glass-panel border-white/5 p-12 md:p-16 overflow-hidden">
                    <div className="absolute top-0 right-0 p-6">
                        <Sparkles className="w-6 h-6 text-gold-400/20" />
                    </div>

                    <div className="mb-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <span className="h-px w-8 bg-gold-400/50" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-400">Membership Enrollment</span>
                            </div>

                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gold-400 transition-all duration-500">
                                    <Building2 className="w-4 h-4 text-gold-400 group-hover:text-navy-950 transition-colors" />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-gold-400 transition-colors">Return Home</span>
                            </Link>
                        </div>

                        <h2 className="text-5xl font-serif text-white mb-4 italic">Request <span className="text-gold-400">Access</span></h2>
                        <p className="text-white/40 text-sm font-light leading-relaxed">Join our inner circle of distinguished guests and unlock personalized luxury across the globe.</p>
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
                                    Full Name / Designation
                                </label>
                                <div className="relative">
                                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400/30" />
                                    <input
                                        type="text"
                                        placeholder="Your distinguished name"
                                        className="w-full bg-transparent border-b border-white/5 py-3 pl-8 text-sm text-white focus:outline-none focus:border-gold-400 transition-all font-light placeholder:text-white/10"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 block mb-3 group-focus-within:text-gold-400 transition-colors">
                                    Communication Address / Email
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
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 block mb-3 group-focus-within:text-gold-400 transition-colors">
                                    Define Access Key
                                </label>
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
                                            Initiate Enrollment
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>

                </div>
            </motion.div>
        </div>
    );
};

export default SignUpPage;





