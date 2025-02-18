import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { login as loginService,register as registerService  } from '@/services/auth.service';
export const AuthForm = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try{
    const response = await loginService(formData);
      login(response.token);
      localStorage.setItem('authToken', response.token);
      Cookies.set('authToken', response.token, { expires: 1 });
      alert('Login successful');
      navigate('/'); 
    } catch (error) {
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await registerService(formData);
      alert('Signup successful! Please log in.');
      setIsLogin(true); // Switch to login form
    } catch (error) {
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-5">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-base-100 shadow-xl">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login-image"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 1 }}
              className="hidden md:block md:w-1/2 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url(https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg)',
              }}
            ></motion.div>
          ) : (
            <motion.div
              key="signup-image"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 1 }}
              className="hidden md:block md:w-1/2 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url(https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp)',
              }}
            ></motion.div>
          )}
        </AnimatePresence>

        <div className="w-full md:w-1/2 p-6">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">
                {isLogin ? 'Want to Signup' : 'Want to Login'}
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={!isLogin}
                onChange={handleToggle}
              />
            </label>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login-form"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <h2 className="card-title text-center">Login</h2>
                <LoginForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleLoginSubmit}
                  loading={loading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="signup-form"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <h2 className="card-title text-center">Sign Up</h2>
                <SignupForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSignUpSubmit}
                  loading={loading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};