import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        const userString = localStorage.getItem('skillflow_user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                if (user && (user._id || user.id)) {
                    // If user is already logged in, don't show login page
                    navigate('/', { replace: true });
                }
            } catch (e) {
                // If data is corrupted, clear it
                localStorage.removeItem('skillflow_user');
            }
        }
    }, [navigate]);


    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const baseUrl = process.env.REACT_APP_API_URL.endsWith('/') 
        ? process.env.REACT_APP_API_URL.slice(0, -1) 
        : process.env.REACT_APP_API_URL;

    try {
        if (isLogin) {
            const res = await axios.post(`${baseUrl}/auth/login`, {
                email: formData.email,
                password: formData.password
            });

            if (res.data.token && res.data.user) {
                // SAVE DATA
                console.log("Full Backend Response:", res.data); // Look at the structure in F12 console
                localStorage.setItem('skillflow_token', res.data.token);
                localStorage.setItem('skillflow_user', JSON.stringify(res.data.user));

                // REDIRECT ONLY ONCE ON SUCCESS
                navigate('/'); 
            }
        } else {
            // REGISTER LOGIC...
            await axios.post(`${baseUrl}/auth/register`, formData);
            alert("Success! Now Login.");
            setIsLogin(true);
        }
    } catch (error) {
        alert(error.response?.data?.message || "Auth Error");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen w-full bg-[#1D546D] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>

            {/* Main Glass Card */}
            <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] p-8 shadow-2xl">
                
                {/* Logo/Brand */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <i className='bx bxs-bolt text-4xl text-cyan-400'></i>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">SkillFlow</h1>
                    <p className="text-white/50 text-sm mt-2">
                        {isLogin ? 'Welcome back! Please enter your details.' : 'Join the community today.'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-cyan-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="John Doe"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-cyan-400/50 transition-all"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-cyan-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="name@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-cyan-400/50 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-cyan-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-cyan-400/50 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-cyan-500 hover:bg-cyan-400 text-[#1D546D] font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                {/* Switcher */}
                <p className="text-center mt-8 text-white/40 text-sm">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 text-cyan-400 font-semibold hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;