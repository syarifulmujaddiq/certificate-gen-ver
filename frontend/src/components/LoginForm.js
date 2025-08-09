import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, User } from 'lucide-react';

function LoginForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateConfirmPassword = () => {
    return formData.password === formData.confirmPassword;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Show loading toast
    const loadingToast = toast.loading(isLogin ? 'Sedang masuk...' : 'Sedang mendaftar...', {
      style: {
        background: '#3b82f6',
        color: '#fff',
      },
    });

    try {
      if (isLogin) {
        // Login logic
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          username: formData.email,
          password: formData.password
        });
        localStorage.setItem('token', res.data.token);

        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Login berhasil! Selamat datang! 🎉', {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        });

        if (onLogin) onLogin();
      } else {
        // Register logic
        const res = await axios.post('http://localhost:5000/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Berhasil mendaftar! Silakan login dengan akun Anda.', {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        });

        setIsLogin(true);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || (isLogin ? 'Login gagal' : 'Pendaftaran gagal');
      setError(errorMessage);

      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return !loading &&
      formData.email &&
      formData.password && validatePassword(formData.password) &&
      (isLogin || (formData.confirmPassword && validateConfirmPassword()));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="min-h-screen flex">
        {/* Left Side - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Form Container */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  {isLogin ? (
                    <User className="text-blue-600" size={24} />
                  ) : (
                    <UserPlus className="text-blue-600" size={24} />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {isLogin ? 'Selamat Datang!' : 'Buat Akun'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {isLogin ? 'Silakan masuk untuk melanjutkan' : 'Mulai dengan akun Anda'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Name Field (Register only) */}
                {!isLogin && (
                  <div className="mb-6 transition-all duration-300 ease-out">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                        placeholder="Nama Lengkap"
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      placeholder="username"
                    />
                    <User className="absolute right-3 top-3 text-gray-400" size={20} />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {formData.password && !validatePassword(formData.password) && (
                    <p className="mt-2 text-sm text-blue-600">Password must be at least 8 characters</p>
                  )}
                </div>

                {/* Confirm Password Field (Register only) */}
                {!isLogin && (
                  <div className="mb-6 transition-all duration-300 ease-out">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && !validateConfirmPassword() && (
                      <p className="mt-2 text-sm text-blue-600">Password tidak cocok</p>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isFormValid()}
                >
                  {loading ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span>{isLogin ? 'Masuk' : 'Buat Akun'}</span>
                  )}
                </button>

                {/* Form Switch */}
                {/* <p className="mt-6 text-center text-gray-600">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    type="button"
                    className="ml-1 text-blue-600 hover:text-blue-700 font-semibold focus:outline-none"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p> */}
              </form>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div
          className="hidden lg:block lg:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: "url('/img/login-image.jpg')"
          }}
        >
          <div className="h-full bg-black bg-opacity-70 flex items-center justify-center">
            <div className="text-center text-white px-12">
              <h2 className="text-4xl font-bold mb-6"><span className='text-blue-400'>Sistem</span> Pembuatan & Verifikasi Sertifikat</h2>
              <p className="text-lg max-w-2xl">Platform blockchain untuk pembuatan dan verifikasi sertifikat yang aman dan terpercaya pada lingkungan fakultas teknik Universitas Muhammadiyah Makassar.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
