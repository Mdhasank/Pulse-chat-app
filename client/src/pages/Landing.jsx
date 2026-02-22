import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Shield,
  Users,
  ArrowRight,
  Zap,
  Github,
  Download,
  Smartphone,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      // Show the banner after a short delay for UX
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setIsInstallable(false);
      setShowBanner(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setIsInstallable(false);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-primary-100 selection:text-primary-900">

      {/* Install Banner */}
      <AnimatePresence>
        {showBanner && !installed && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[200] bg-primary-600 text-white px-4 py-3 flex items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Smartphone className="size-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Install Pulse on your device</p>
                <p className="text-[11px] text-primary-100">Chat faster — right from your home screen.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstall}
                className="bg-white text-primary-700 font-bold text-xs px-4 py-2 rounded-xl hover:bg-primary-50 transition-all"
              >
                Install
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-600/20">
                <MessageSquare className="size-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Pulse</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#security" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Security</a>
              <Link to="/auth" className="text-sm font-medium text-slate-900 hover:text-primary-600">Sign In</Link>
              {isInstallable && !installed && (
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-primary-600 text-primary-600 text-sm font-bold hover:bg-primary-50 transition-all"
                >
                  <Download className="size-4" />
                  Install App
                </button>
              )}
              <Link to="/auth" className="btn-primary px-5 py-2 text-sm rounded-xl">
                Get Started
              </Link>
            </div>

            {/* Mobile nav */}
            <div className="md:hidden flex items-center gap-2">
              {isInstallable && !installed && (
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-bold"
                >
                  <Download className="size-3.5" />
                  Install
                </button>
              )}
              <Link to="/auth" className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 size-[600px] bg-primary-50 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 size-[600px] bg-sky-50 rounded-full blur-3xl opacity-50 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100/50 text-primary-700 text-xs font-bold mb-6 tracking-wide uppercase">
              <Zap className="size-3 fill-primary-700" />
              Real-time messaging, reimagined
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8">
              Chat without <br />
              <span className="text-primary-600 italic">boundaries</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with friends instantly. No SIM card needed. Just pure, fast, real-time messaging from any device, anywhere.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link to="/auth" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto shadow-2xl flex items-center justify-center gap-2">
                Start Chatting Free <ArrowRight className="size-5" />
              </Link>
              {/* Install CTA in Hero */}
              {isInstallable && !installed ? (
                <button
                  onClick={handleInstall}
                  className="flex items-center justify-center gap-2 text-lg px-8 py-4 w-full sm:w-auto rounded-2xl border-2 border-slate-200 text-slate-700 font-bold hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all"
                >
                  <Download className="size-5" />
                  Install on Device
                </button>
              ) : installed ? (
                <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
                  <Smartphone className="size-4" />
                  App Installed ✓
                </div>
              ) : (
                <a
                  href="#features"
                  className="flex items-center justify-center gap-2 text-sm px-6 py-3.5 w-full sm:w-auto rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:border-slate-300 transition-all"
                >
                  Learn More
                </a>
              )}
            </div>

            {/* Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative max-w-5xl mx-auto"
            >
              <div className="absolute -inset-1 bg-gradient-to-tr from-primary-500 to-sky-500 rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative glass-card rounded-[2rem] overflow-hidden border border-slate-200 shadow-2xl">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-white/50">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-red-400" />
                    <div className="size-3 rounded-full bg-amber-400" />
                    <div className="size-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 text-center text-xs font-medium text-slate-400 font-mono tracking-widest uppercase">Pulse Chat</div>
                </div>
                <div className="flex h-[500px] bg-white">
                  {/* Sidebar Mockup */}
                  <div className="w-64 border-r border-slate-100 p-4 space-y-4 hidden md:block">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`flex items-center gap-3 p-2 rounded-xl ${i === 1 ? 'bg-primary-50' : ''}`}>
                        <div className="size-10 rounded-full bg-slate-100 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className={`h-2.5 rounded-full ${i === 1 ? 'bg-primary-200 w-2/3' : 'bg-slate-200 w-1/2'}`} />
                          <div className="h-2 rounded-full bg-slate-100 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Chat Mockup */}
                  <div className="flex-1 flex flex-col p-6 space-y-6">
                    <div className="max-w-xs self-start p-4 rounded-2xl bg-slate-100 text-slate-600 text-sm">
                      Hey! How's the project going? 🚀
                    </div>
                    <div className="max-w-xs self-end p-4 rounded-2xl bg-primary-600 text-white text-sm shadow-lg shadow-primary-600/20">
                      Going great! Just finished the real-time sync ✨
                    </div>
                    <div className="max-w-xs self-start p-4 rounded-2xl bg-slate-100 text-slate-600 text-sm">
                      That's awesome! Can't wait to try it out
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 tracking-tight">
            <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-slate-500 text-lg">A modern messaging platform built for speed and privacy.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="size-6 text-primary-600" />}
              title="Real-time"
              description="Messages delivered instantly with live typing indicators and read receipts."
            />
            <FeatureCard
              icon={<Shield className="size-6 text-primary-600" />}
              title="Secure"
              description="Your conversations are protected with modern authentication and encryption."
            />
            <FeatureCard
              icon={<Users className="size-6 text-primary-600" />}
              title="Social"
              description="Find friends, manage contacts, and stay connected across all devices."
            />
          </div>
        </div>
      </section>

      {/* Install CTA Section */}
      {!installed && (
        <section id="security" className="py-24 bg-primary-600">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="size-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                <Smartphone className="size-8 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Take Pulse everywhere</h2>
              <p className="text-primary-100 text-lg mb-8 leading-relaxed">
                Install Pulse on your phone or computer and access your conversations instantly — no browser needed.
              </p>
              {isInstallable ? (
                <button
                  onClick={handleInstall}
                  className="inline-flex items-center gap-3 bg-white text-primary-700 font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl hover:scale-105 transition-all"
                >
                  <Download className="size-6" />
                  Install Pulse App
                </button>
              ) : (
                <div className="space-y-4 text-primary-100 text-sm">
                  <p className="font-bold text-white">How to install on your device:</p>
                  <div className="grid sm:grid-cols-2 gap-4 text-left">
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <p className="font-bold text-white mb-1">📱 Android (Chrome)</p>
                      <p>Tap the 3-dot menu → "Add to Home Screen"</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <p className="font-bold text-white mb-1">🍎 iPhone (Safari)</p>
                      <p>Tap Share → "Add to Home Screen"</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <p className="font-bold text-white mb-1">💻 Desktop (Chrome)</p>
                      <p>Click the install icon (⊕) in the address bar</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <p className="font-bold text-white mb-1">🔷 Desktop (Edge)</p>
                      <p>Click the app icon in the address bar</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-slate-200 rounded flex items-center justify-center">
              <MessageSquare className="size-4 text-slate-500" />
            </div>
            <span className="font-bold text-slate-900 uppercase tracking-widest text-xs">Pulse</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 Pulse. All rights reserved.</p>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-primary-600 transition-colors"><Github className="size-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 rounded-[2rem] border border-slate-100 hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-600/5 transition-all group">
    <div className="size-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">
      {description}
    </p>
  </div>
);

export default Landing;
