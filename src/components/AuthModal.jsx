import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Mail, User as UserIcon, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import gsap from 'gsap';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const { language, t } = useLanguage();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fields State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (window.lenis) {
        window.lenis.stop();
      }
      // GSAP Entrance
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, y: 20, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
      );
    } else {
      document.body.style.overflow = 'auto';
      if (window.lenis) {
        window.lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = 'auto';
      if (window.lenis) {
        window.lenis.start();
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, { scale: 0.95, y: 10, opacity: 0, duration: 0.2, ease: 'power2.in' });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        setError('');
        setFormData({ name: '', email: '', password: '' });
        onClose();
      },
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const getValidationError = (type) => {
    if (language === 'fr') {
      if (type === 'allFields') return 'Veuillez remplir tous les champs.';
      if (type === 'name') return 'Veuillez saisir votre nom complet.';
      if (type === 'failed') return 'Échec de l\'authentification. Veuillez vérifier vos identifiants.';
    }
    if (language === 'ar') {
      if (type === 'allFields') return 'يرجى ملء جميع الحقول.';
      if (type === 'name') return 'يرجى إدخال اسمك الكامل.';
      if (type === 'failed') return 'فشلت عملية التحقق. يرجى التأكد من صحة البيانات المدخلة.';
    }
    if (type === 'allFields') return 'Please fill in all fields.';
    if (type === 'name') return 'Please enter your full name.';
    return 'Authentication failed. Please check your credentials.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basics validations
    if (!formData.email.trim() || !formData.password.trim()) {
      setError(getValidationError('allFields'));
      return;
    }
    if (!isLoginTab && !formData.name.trim()) {
      setError(getValidationError('name'));
      return;
    }

    setLoading(true);
    try {
      if (isLoginTab) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      handleClose();
    } catch (err) {
      setError(err.message || getValidationError('failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md font-sans"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[32px] shadow-2xl border border-cream-accent/50 w-full max-w-md relative overflow-hidden select-text text-start p-6 sm:p-8"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 ltr:right-4 rtl:left-4 z-20 w-8 h-8 rounded-full bg-cream-bg hover:bg-cream-accent text-primary flex items-center justify-center transition-all cursor-pointer border border-primary/5"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab Selection */}
        <div className="flex border-b border-cream-accent/50 mb-6">
          <button
            onClick={() => {
              setIsLoginTab(true);
              setError('');
            }}
            className={`flex-1 pb-3 text-sm font-bold tracking-tight text-center transition-all cursor-pointer ${
              isLoginTab
                ? 'text-primary border-b-2 border-primary'
                : 'text-primary-light/60 hover:text-primary-light'
            }`}
          >
            {language === 'fr' ? "S'identifier" : language === 'ar' ? "تسجيل الدخول" : "Sign In"}
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setError('');
            }}
            className={`flex-1 pb-3 text-sm font-bold tracking-tight text-center transition-all cursor-pointer ${
              !isLoginTab
                ? 'text-primary border-b-2 border-primary'
                : 'text-primary-light/60 hover:text-primary-light'
            }`}
          >
            {language === 'fr' ? "Créer un compte" : language === 'ar' ? "إنشاء حساب" : "Create Account"}
          </button>
        </div>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <h3 className="font-extrabold text-xl text-primary tracking-tight font-sans text-center">
            {isLoginTab ? t('auth.welcome') : t('auth.join')}
          </h3>
          <p className="text-xs text-primary-light/70 mt-1 text-center">
            {isLoginTab ? t('auth.welcomeDesc') : t('auth.joinDesc')}
          </p>
        </div>

        {/* Error Block */}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-100 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 mb-5 animate-shake text-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed text-start">{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-start">
          {/* Register Name */}
          {!isLoginTab && (
            <div className="flex flex-col gap-1.5 text-start">
              <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider text-start">
                {language === 'fr' ? 'Nom complet' : language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <div className="relative text-primary">
                <UserIcon className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 text-primary/40" />
                <input
                  type="text"
                  name="name"
                  placeholder={language === 'fr' ? 'ex: Jean Dupont' : language === 'ar' ? 'مثال: محمد علي' : 'e.g. Jane Doe'}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 bg-cream-bg/40 border border-primary/10 rounded-2xl text-sm outline-none focus:border-primary/30 focus:bg-white transition-all font-medium text-primary text-start"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5 text-start">
            <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider text-start">
              {language === 'fr' ? 'Adresse e-mail' : language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative text-primary">
              <Mail className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 text-primary/40" />
              <input
                type="email"
                name="email"
                placeholder={language === 'fr' ? 'ex: email@pethaven.org' : 'e.g. email@pethaven.org'}
                value={formData.email}
                onChange={handleChange}
                className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 bg-cream-bg/40 border border-primary/10 rounded-2xl text-sm outline-none focus:border-primary/30 focus:bg-white transition-all font-medium text-primary text-start"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 text-start">
            <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider text-start">
              {language === 'fr' ? 'Mot de passe' : language === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative text-primary">
              <Lock className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 text-primary/40" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 bg-cream-bg/40 border border-primary/10 rounded-2xl text-sm outline-none focus:border-primary/30 focus:bg-white transition-all font-medium text-primary text-start"
                disabled={loading}
              />
            </div>
          </div>

          {/* Special Login tips */}
          {isLoginTab && (
            <div className="p-3 bg-primary/5 rounded-2xl text-[10px] text-primary-light/80 leading-relaxed border border-primary/5 text-start">
              💡 {t('auth.testerTip')}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-light text-cream-bg py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/15"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-cream-bg border-t-transparent rounded-full animate-spin" />
                <span>{t('auth.loading')}</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current text-secondary" />
                <span>{isLoginTab ? t('auth.accessBtn') : t('auth.createBtn')}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
