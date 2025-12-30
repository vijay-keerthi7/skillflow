import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN LOGIC
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
       const res = await axios.post('http://localhost:5000/api/auth/login', formData);
        console.log(res.data.token);
  // Save to LocalStorage
  localStorage.setItem('skillflow_token', res.data.token);
  localStorage.setItem('skillflow_user', JSON.stringify(res.data.user));



  // Redirect to Chat
  navigate('/');
      } else {
        // REGISTER LOGIC
        const response = await axios.post('http://localhost:5000/api/auth/register', formData);
        console.log("Registration Success:", response.data);
        alert("Account created! Now please login.");
        setIsLogin(true); // Switch to login view
      }
      
      // If login is successful, you'd usually save a token here
      // navigate('/'); 
    } catch (error) {
      console.error("Auth Error:", error.response?.data?.message || "Something went wrong");
      alert(error.response?.data?.message || "Error connecting to server");
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
            <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-500">

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
                                value={formData.password}
      onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-cyan-400/50 transition-all"
                            />
                            <i className='bx bx-low-vision absolute right-4 top-1/2 -translate-y-1/2 text-white/30 cursor-pointer hover:text-white'></i>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#1D546D] font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] mt-4"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
                {/* Divider */}
                <div className="relative my-8 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative bg-[#1d546d] px-4"> {/* Matches your background to hide the line behind text */}
                        <span className="text-xs text-white/30 uppercase tracking-widest">Or continue with</span>
                    </div>
                </div>

                {/* Social Buttons Row */}
                <div className="grid grid-cols-3 gap-4">
                    <button className="flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all group">
                        <i className='bx bxl-google text-2xl text-white/60 group-hover:text-white'></i>
                    </button>
                    <button className="flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all group">
                        <i className='bx bxl-github text-2xl text-white/60 group-hover:text-white'></i>
                    </button>
                    <button className="flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all group">
                        <i className='bx bxl-apple text-2xl text-white/60 group-hover:text-white'></i>
                    </button>
                </div>
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