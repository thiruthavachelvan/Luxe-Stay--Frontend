import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyOtpPage = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const emailParam = queryParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        } else {
            // Redirect if accessed directly without email
            navigate('/forgot-password');
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${__API_BASE__}/api/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'OTP Verification failed');
            }

            toast.success('OTP Verified successfully!');
            // Store token in session storage or state to use on the next screen
            sessionStorage.setItem('resetToken', data.resetToken);
            navigate(`/reset-password`);

        } catch (err) {
            toast.error(err.message || 'Invalid or Expired OTP.');
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
                            Security Verification
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                            Verify <br />
                            <span className="text-luxury-gold font-serif italic">Identity.</span>
                        </h1>
                        <p className="text-luxury-muted text-lg mt-6 max-w-md">
                            Please enter the 6-digit OTP sent to your registered email address ({email}).
                        </p>
                    </div>

                    <div className="absolute bottom-12 left-12 text-sm text-luxury-muted">
                        © {new Date().getFullYear()} LuxeStay Hotels & Resorts. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Verification Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#11141D]">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex lg:hidden items-center gap-2 group mb-12">
                        <div className="p-1.5 bg-luxury-blue rounded group-hover:bg-luxury-blue-hover transition-colors">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-widest text-white uppercase">LuxeStay</span>
                    </Link>

                    <Link to="/forgot-password" className="inline-flex items-center gap-2 text-luxury-muted hover:text-white transition-colors mb-8 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-4xl font-bold text-white mb-2 font-sans tracking-tight">Verify OTP</h2>
                        <p className="text-luxury-muted text-sm">Enter the code sent to {email}</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-luxury-muted uppercase tracking-wider text-center block mb-4">
                                One-Time Password
                            </label>
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-[250px]">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-luxury-muted" />
                                    </div>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="000000"
                                        className="w-full bg-[#1A1D27] border border-transparent rounded-lg py-4 pl-12 pr-4 text-center text-2xl tracking-[0.5em] text-white placeholder-luxury-muted/30 focus:outline-none focus:border-luxury-gold/50 focus:bg-[#1A1D27]/80 transition-all font-mono font-bold"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // only numbers
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-center text-luxury-muted mt-4">
                                Code expires in 10 minutes.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full mt-8 py-3.5 px-4 bg-luxury-blue hover:bg-luxury-blue-hover text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(30,64,175,0.3)] hover:shadow-[0_0_30px_rgba(30,64,175,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-luxury-muted">
                        Didn't receive the code?{' '}
                        <Link to="/forgot-password" className="text-luxury-blue hover:text-white font-bold transition-colors">
                            Resend Email
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtpPage;
