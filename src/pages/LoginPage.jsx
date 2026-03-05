import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

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
        <div className="min-h-screen flex bg-luxury-dark text-luxury-text selection:bg-luxury-gold selection:text-white">

            {/* Left Side - Image/Branding */}
            <div className="hidden lg:flex w-1/2 relative bg-luxury-card items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80')`,
                    }}
                >
                    <div className="absolute inset-0 bg-luxury-dark/60 bg-gradient-to-t from-luxury-dark/90 via-luxury-dark/50 to-luxury-dark/80"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg px-12 flex flex-col justify-center h-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group mb-16 absolute top-12 left-12">
                        <div className="p-1.5 bg-luxury-blue rounded group-hover:bg-luxury-blue-hover transition-colors">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-widest text-white uppercase">LuxeStay</span>
                    </Link>

                    <div>
                        <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest uppercase border border-luxury-blue/30 text-luxury-blue rounded bg-luxury-blue/10 backdrop-blur-sm">
                            Secure Access
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                            Your World of <br />
                            <span className="text-luxury-blue font-serif italic">Privilege.</span>
                        </h1>
                        <p className="text-luxury-muted text-lg mt-6 max-w-md">
                            Log in to manage your luxury stay, explore exclusive member rates, and access personalized services.
                        </p>
                    </div>

                    <div className="absolute bottom-12 left-12 text-sm text-luxury-muted">
                        © 2023 LuxeStay Hotels & Resorts. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#11141D]">
                <div className="w-full max-w-md">

                    {/* Mobile Logo */}
                    <Link to="/" className="flex lg:hidden items-center gap-2 group mb-12">
                        <div className="p-1.5 bg-luxury-blue rounded group-hover:bg-luxury-blue-hover transition-colors">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-widest text-white uppercase">LuxeStay</span>
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-4xl font-bold text-white mb-2 font-sans tracking-tight">Login to Suite</h2>
                        <p className="text-luxury-muted text-sm">Please enter your credentials to access your account.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-luxury-muted uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-luxury-muted group-focus-within:text-luxury-blue transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="w-full bg-[#1A1D27] border border-transparent rounded-lg py-3 pl-12 pr-4 text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-blue/50 focus:bg-[#1A1D27]/80 transition-all font-medium"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-luxury-muted uppercase tracking-wider">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-[11px] font-bold text-luxury-blue hover:text-white transition-colors uppercase tracking-wider">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-luxury-muted group-focus-within:text-luxury-blue transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full bg-[#1A1D27] border border-transparent rounded-lg py-3 pl-12 pr-12 text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-blue/50 focus:bg-[#1A1D27]/80 transition-all font-medium"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-luxury-muted hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-5 h-5 rounded border-[#2A2D3A] bg-[#1A1D27] text-luxury-blue focus:ring-luxury-blue focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-sm text-luxury-muted cursor-pointer select-none">
                                Stay signed in for 30 days
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-luxury-blue hover:bg-luxury-blue-hover text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(30,64,175,0.3)] hover:shadow-[0_0_30px_rgba(30,64,175,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login to Your Suite"}
                        </button>

                    </form>

                    <div className="mt-8 flex items-center justify-center space-x-4">
                        <div className="flex-1 h-px bg-[#2A2D3A]"></div>
                        <span className="text-xs font-bold text-luxury-muted uppercase tracking-wider">Or continue with</span>
                        <div className="flex-1 h-px bg-[#2A2D3A]"></div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 py-3 px-4 bg-[#1A1D27] hover:bg-[#2A2D3A] rounded-lg text-sm font-bold text-white transition-colors border border-[#2A2D3A]">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-3 py-3 px-4 bg-[#1A1D27] hover:bg-[#2A2D3A] rounded-lg text-sm font-bold text-white transition-colors border border-[#2A2D3A]">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    <p className="mt-10 text-center text-sm text-luxury-muted">
                        New to LuxeStay?{' '}
                        <Link to={signUpUrl} className="text-luxury-blue hover:text-white font-bold transition-colors">
                            Create an account
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;





