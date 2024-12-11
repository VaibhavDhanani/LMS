import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SIgnupForm';
import { useNavigate } from 'react-router-dom';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const URL = import.meta.env.VITE_SERVER_URL
      const response = await fetch(`${URL}/users/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log("Server response:", jsonData);
      alert("login successfully")
      navigate("/")

    } catch (error) {
      console.error("Error during submission:", error);
    }

  }

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const URL = import.meta.env.VITE_SERVER_URL
      const response = await fetch(`${URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log("Server response:", jsonData);
    } catch (error) {
      console.error("Error during submission:", error);
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
              style={{ backgroundImage: 'url(https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg)' }}
            ></motion.div>
          ) : (
            <motion.div
              key="signup-image"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 1 }}
              className="hidden md:block md:w-1/2 bg-cover bg-center"
              style={{ backgroundImage: 'url(https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp)' }}
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
                onChange={() => setIsLogin((prev) => !prev)}
              />
            </label>
          </div>

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
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};




