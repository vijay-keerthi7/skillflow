import React, { useState } from 'react';
import { Mail, User, Lock, Briefcase } from 'lucide-react';

// This is the component that handles user registration logic and UI.
const Register = () => {
    // State to hold the form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '' // e.g., Developer, Designer, Manager
    });

    // State for basic form validation and loading
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Handles input changes and updates the formData state
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for the current field as the user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Simple validation function
    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Full name is required.";
        if (!formData.email) newErrors.email = "Email is required.";
        if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
        if (!formData.role) newErrors.role = "Role selection is required.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            setMessage('Please correct the errors in the form.');
            return;
        }

        // --- API Integration Placeholder ---
        setLoading(true);
        setMessage('');

        // In a real MERN app, you would make a fetch or axios call here:
        // try {
        //     const response = await fetch('http://localhost:5000/api/auth/register', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(formData),
        //     });
        //     const data = await response.json();
        //
        //     if (response.ok) {
        //         setMessage('Registration successful! Redirecting to login...');
        //         // Redirect logic here
        //     } else {
        //         setMessage(data.message || 'Registration failed.');
        //     }
        // } catch (error) {
        //     setMessage('Network error. Please try again.');
        // }

        // Simulation for now
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setMessage('Registration successful! (Simulated) You can now proceed to /login.');
        // --- End of Placeholder ---
    };

    const inputClasses = (name) => 
        `w-full p-3 pl-10 border text-gray-700 rounded-lg focus:outline-none transition duration-150 ${
            errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
        }`;

    return (
        // Wrapper: min-h-screen, centered, background
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
            {/* Auth Container: max-width, white background, shadow, rounded corners */}
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center">
                
                {/* Title */}
                <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
                    SkillFlow
                </h2>
                <p className="text-lg text-blue-600 font-semibold mb-6">
                    Create Your Professional Portfolio
                </p>

                {/* Status Message Area */}
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                        message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    
                    {/* Full Name Input */}
                    <div className="relative">
                        <User className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            className={inputClasses('name')}
                            disabled={loading}
                        />
                        {errors.name && <p className="text-red-500 text-xs text-left mt-1">{errors.name}</p>}
                    </div>
                    
                    {/* Email Input */}
                    <div className="relative">
                        <Mail className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputClasses('email')}
                            disabled={loading}
                        />
                        {errors.email && <p className="text-red-500 text-xs text-left mt-1">{errors.email}</p>}
                    </div>

                    {/* Role Selection */}
                    <div className="relative">
                        <Briefcase className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={inputClasses('role')}
                            disabled={loading}
                        >
                            <option value="" disabled>Select Your Primary Role</option>
                            <option value="developer">Software Developer</option>
                            <option value="designer">UX/UI Designer</option>
                            <option value="manager">Product/Project Manager</option>
                            <option value="other">Other Professional</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-xs text-left mt-1">{errors.role}</p>}
                    </div>
                    
                    {/* Password Input */}
                    <div className="relative">
                        <Lock className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password (min 6 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            className={inputClasses('password')}
                            disabled={loading}
                        />
                        {errors.password && <p className="text-red-500 text-xs text-left mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative">
                        <Lock className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={inputClasses('confirmPassword')}
                            disabled={loading}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs text-left mt-1">{errors.confirmPassword}</p>}
                    </div>
                    
                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className={`bg-blue-600 text-white font-bold py-3 rounded-lg mt-2 transition duration-200 
                                   hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Create Account'}
                    </button>
                </form>
                
                {/* Switch Link */}
                <p className="mt-6 text-sm text-gray-500">
                    Already registered? <a href="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition duration-150">Log in here</a>
                </p>
            </div>
        </div>
    );
};

export default Register;