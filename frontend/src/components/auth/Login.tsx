import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Eye, EyeOff, Loader, User, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  // Load saved username if remember me was checked
  useEffect(() => {
    const savedRemember = localStorage.getItem('newtex_remember') === 'true';
    if (savedRemember) {
      setRememberMe(true);
      // Optionally, you can also save and restore the username
      const savedUsername = localStorage.getItem('newtex_saved_username');
      if (savedUsername) {
        setUsername(savedUsername);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('يرجى إدخال الاسم وكلمة المرور');
      return;
    }    console.log('Login attempt:', { username, rememberMe }); // Debug log
    const success = await login(username, password, rememberMe);
    console.log('Login result:', success); // Debug log
    
    if (success) {
      // Save username if remember me is checked
      if (rememberMe) {
        localStorage.setItem('newtex_saved_username', username);
      } else {
        localStorage.removeItem('newtex_saved_username');
      }
    } else {
      setError('الاسم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex">      {/* Left side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-8 text-center">
            <img src="/1-0١-1.webp" alt="NEWTEX" className="h-16 w-auto mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">NEWTEX</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              نظام إدارة الأعمال النسيجية المتطور
            </p>
            <p className="text-lg opacity-80 mt-4">
              إدارة شاملة للمستودعات والمبيعات والطلبيات
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/1-0١-1.webp" alt="NEWTEX" className="h-12 w-auto mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">NEWTEX</h2>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                مرحباً بك
              </h2>
              <p className="text-gray-600">
                سجل دخولك للمتابعة
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  الاسم
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-base bg-gray-50 focus:bg-white"
                    placeholder="أدخل اسمك"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pr-10 pl-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-base bg-gray-50 focus:bg-white"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 left-0 pl-3 flex items-center hover:text-amber-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-700">
                    تذكرني
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                  <div className="text-sm text-red-700 text-center font-medium">{error}</div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 ml-2" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 ml-2" />
                    تسجيل الدخول
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              نظام إدارة الأعمال النسيجية © 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
