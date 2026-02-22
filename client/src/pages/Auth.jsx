import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, User, MessageSquare, ArrowLeft } from "lucide-react";
import API from "../api";
import useAuthStore from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/user/login" : "/user";
      const { data } = await API.post(endpoint, formData);
      setUser(data);
      toast.success(isLogin ? "Welcome back to Pulse!" : "Account created successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 size-96 bg-primary-100/50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 size-96 bg-sky-100/50 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors mb-8 text-sm font-medium group">
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="bg-white rounded-[2.5rem] p-10 lg:p-12 shadow-2xl shadow-slate-200/60 border border-slate-100">
          <div className="text-center mb-10">
            <div className="size-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/20 mx-auto mb-6">
              <MessageSquare className="size-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-slate-500 mt-2">
              {isLogin ? "Sign in to your Pulse account" : "Start your journey with us today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="btn-primary w-full py-4 text-lg mt-6 shadow-xl disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <div className="size-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isLogin ? (
                <>Sign In</>
              ) : (
                <>Create Account</>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              {isLogin ? (
                <>New to Pulse? <span className="text-primary-600">Create an account</span></>
              ) : (
                <>Already have an account? <span className="text-primary-600">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
