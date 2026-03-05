import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${__API_BASE__}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            toast.success('OTP sent to your email!');
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);

        } catch (err) {
            toast.error(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-luxury-dark text-luxury-text selection:bg-luxury-gold selection:text-white">
            {/* Left Side - Image/Branding */}
            <div className="hidden lg:flex w-1/2 relative bg-luxury-card items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1542314831-c6a4d27ce6a2?auto=format&fit=crop&q=80')`,
                    }}
                >
                    <div className="absolute inset-0 bg-luxury-dark/60 bg-gradient-to-t from-luxury-dark/90 via-luxury-dark/50 to-luxury-dark/80"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg px-12 flex flex-col justify-center h-full">
                    <Link to="/" className="flex items-center gap-2 group mb-16 absolute top-12 left-12">
                        <div className="p-1.5 bg-luxury-blue rounded group-hover:bg-luxury-blue-hover transition-colors">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-widest text-white uppercase">LuxeStay</span>
                    </Link>

                    <div>
                        <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest uppercase border border-luxury-gold/30 text-luxury-gold rounded bg-luxury-gold/10 backdrop-blur-sm">
                            Account Recovery
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                            Regain <br />
                            <span className="text-luxury-gold font-serif italic">Access.</span>
                        </h1>
                        <p className="text-luxury-muted text-lg mt-6 max-w-md">
                            Enter your registered email address and we'll send you a One-Time Password (OTP) to reset your password.
                        </p>
                    </div>

                    <div className="absolute bottom-12 left-12 text-sm text-luxury-muted">
                        © {new Date().getFullYear()} LuxeStay Hotels & Resorts. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Recovery Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#11141D]">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex lg:hidden items-center gap-2 group mb-12">
                        <div className="p-1.5 bg-luxury-blue rounded group-hover:bg-luxury-blue-hover transition-colors">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-widest text-white uppercase">LuxeStay</span>
                    </Link>

                    <Link to="/login" className="inline-flex items-center gap-2 text-luxury-muted hover:text-white transition-colors mb-8 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-4xl font-bold text-white mb-2 font-sans tracking-tight">Forgot Password</h2>
                        <p className="text-luxury-muted text-sm">Please enter your email address to receive an OTP.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
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
                                    placeholder="name@example.com"
                                    className="w-full bg-[#1A1D27] border border-transparent rounded-lg py-3 pl-12 pr-4 text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-blue/50 focus:bg-[#1A1D27]/80 transition-all font-medium"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full py-3.5 px-4 bg-luxury-blue hover:bg-luxury-blue-hover text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(30,64,175,0.3)] hover:shadow-[0_0_30px_rgba(30,64,175,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
