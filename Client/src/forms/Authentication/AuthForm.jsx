import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { login as loginService, register as registerService } from "@/services/auth.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { googleSignUp,googleLogin } from "@/services/auth.service";
import { useGoogleLogin } from "@react-oauth/google";
export const AuthForm = () => {
  const { login, user } = useAuth(); // Get user from context
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/"); // Redirect to homepage or dashboard
      toast.info("You are already logged in.");
    }
  }, [user, navigate]);

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    });
    setError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginService(formData);
      if (response.success) {
        login(response.data.token);
        toast.success("Login successful!");
        navigate("/");
      } else {
        setError(response.message || "An unexpected error occurred.");
        toast.error(response.message || "An unexpected error occurred.");
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred.");
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await registerService(formData);
      if (response.success) {
        toast.success("Signup successful!");
        login(response.data.token);
        navigate("/");
      } else {
        setError(response.message || "An unexpected error occurred.");
        toast.error(response.message || "An unexpected error occurred.");
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred.");
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const googleSignin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await googleSignUp(response.access_token, formData.role); // Await API call
  
        if (res.success) {
          toast.success("Signup successful!");
          login(res.data.token);
          navigate("/");
        } else {
          setError(res.message || "An unexpected error occurred.");
          toast.error(res.message || "An unexpected error occurred.");
        }
      } catch (error) {
        setError(error.message || "An unexpected error occurred.");
        toast.error(error.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      console.log("Google Login Failed");
      setLoading(false);
    },
  });
  
  const googleSignupSubmit = () => {
    setLoading(true);
    googleSignin();
  };

  const googleLog = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await googleLogin(response.access_token); // Await API call

        if (res.success) {
          toast.success("Login successful!");
          login(res.data.token);
          navigate("/");
        } else {
          setError(res.message || "An unexpected error occurred.");
          toast.error(res.message || "An unexpected error occurred.");
        }
      } catch (error) {
        setError(error.message || "An unexpected error occurred.");
        toast.error(error.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      console.log("Google Login Failed");
      setLoading(false);
    },
  });
  const googleLoginSubmit= ()=>{
    setLoading(true);
    googleLog();
  }
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-5 pt-24">
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
                  'url(/draw2.svg)',
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
                  'url(/draw3.webp)',
              }}
            ></motion.div>
          )}
        </AnimatePresence>

        <div className="w-full md:w-1/2 p-6">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">
                {isLogin ? "Want to Signup" : "Want to Login"}
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
                  handleGoogleSubmit={googleLoginSubmit}
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
                  handleGoogleSubmit={googleSignupSubmit}
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
