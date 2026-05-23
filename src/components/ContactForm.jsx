import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, User, Mail, Phone, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ContactForm({ pet, onSubmitSuccess }) {
  const { user, sendAdoptMessage } = useAuth();
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  const getDefaultMessage = () => {
    if (language === 'fr') {
      return `Bonjour, j'ai eu un coup de cœur pour ${pet.name} ! J'aimerais beaucoup lui offrir un foyer chaleureux, sûr et aimant pour la vie. Je suis disponible pour organiser une rencontre en journée dans une clinique vétérinaire partenaire. N'hésitez pas à me recontacter !`;
    }
    if (language === 'ar') {
      return `مرحباً، لقد أحببت ${pet.name} كثيراً! وأود جداً منحه منزلاً دافئاً وآمناً ومليئاً بالحب إلى الأبد. أنا مستعد لترتيب مقابلة خلال النهار في عيادة شريكة آمنة. يرجى التواصل معي!`;
    }
    return `Hi, I fell in love with ${pet.name}! I would love to give them a warm, safe, and loving forever home. I am ready to arrange a daytime meetup in a safe partner clinic. Please get back to me!`;
  };

  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    phone: '',
    message: '',
  });

  // Keep the default message synchronized when language changes before user types
  useEffect(() => {
    setFormData((prev) => {
      if (!prev.message || prev.message.startsWith('Hi, I fell in love') || prev.message.startsWith('Bonjour, j\'ai eu un coup') || prev.message.startsWith('مرحباً، لقد أحببت')) {
        return { ...prev, message: getDefaultMessage() };
      }
      return prev;
    });
  }, [language, pet.name]);

  // Sync profile details if user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const getValidationError = (field, type) => {
    if (language === 'fr') {
      if (field === 'name') return 'Votre nom complet est requis';
      if (field === 'phone') return 'Votre numéro de téléphone est requis';
      if (field === 'email') return type === 'empty' ? 'Votre adresse e-mail est requise' : 'Adresse e-mail invalide';
      if (field === 'message') return "Veuillez écrire un court message de motivation";
    }
    if (language === 'ar') {
      if (field === 'name') return 'الاسم الكامل مطلوب';
      if (field === 'phone') return 'رقم الهاتف مطلوب';
      if (field === 'email') return type === 'empty' ? 'البريد الإلكتروني مطلوب' : 'البريد الإلكتروني غير صالح';
      if (field === 'message') return 'يرجى كتابة رسالة تعريفية قصيرة';
    }
    if (field === 'name') return 'Your name is required';
    if (field === 'phone') return 'Your phone number is required';
    if (field === 'email') return type === 'empty' ? 'Your email address is required' : 'Invalid email address';
    if (field === 'message') return 'Please write a short introductory message';
    return '';
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = getValidationError('name');
    if (!formData.phone.trim()) newErrors.phone = getValidationError('phone');
    if (!formData.email.trim()) {
      newErrors.email = getValidationError('email', 'empty');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = getValidationError('email', 'invalid');
    }
    if (!formData.message.trim()) newErrors.message = getValidationError('message');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate secure steps
    setStatusMessage(t('contact.loading1'));
    await new Promise((r) => setTimeout(r, 600));

    setStatusMessage(t('contact.loading2'));
    await new Promise((r) => setTimeout(r, 600));

    setStatusMessage(t('contact.loading3'));
    await new Promise((r) => setTimeout(r, 600));

    try {
      await sendAdoptMessage(
        pet.id,
        pet.name,
        pet.ownerId || 'user-admin',
        formData.name,
        formData.email,
        formData.phone,
        formData.message
      );
      setSuccess(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error(err);
      setErrors({ global: language === 'fr' ? 'Échec de l\'envoi sécurisé. Veuillez réessayer.' : language === 'ar' ? 'فشل إرسال الرسالة بأمان. يرجى المحاولة مجدداً.' : 'Failed to deliver safe message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary text-cream-bg p-5 sm:p-6 rounded-3xl flex flex-col gap-4 shadow-xl border border-primary-light/10 select-text font-sans">
      {success ? (
        /* Sent Success splash */
        <div className="text-center py-6 animate-fade-in flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-cream-bg shadow-lg shadow-secondary/20 mb-4 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-extrabold text-lg text-center">{t('contact.sentTitle')}</h4>
          <p className="text-xs text-cream-accent/80 mt-1.5 max-w-sm mx-auto leading-relaxed text-center">
            {t('contact.sentDesc')}
          </p>
        </div>
      ) : (
        /* Standard message inputs */
        <form onSubmit={handleSubmit} className="space-y-4 text-start">
          <div className="border-b border-cream-accent/15 pb-3 text-start">
            <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-secondary text-start">
              <CheckCircle2 className="w-4 h-4 text-secondary fill-secondary animate-pulse" />
              {t('contact.headerTitle', { name: pet.name })}
            </h4>
            <p className="text-[10px] text-cream-accent/75 mt-0.5 leading-relaxed text-start">
              {t('contact.headerDesc')}
            </p>
          </div>

          {errors.global && (
            <div className="bg-red-500/10 text-red-200 border border-red-500/20 p-2.5 rounded-xl text-xs text-start">
              {errors.global}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-start">
            {/* Name */}
            <div className="flex flex-col gap-1 text-start">
              <label className="text-[9px] font-bold uppercase tracking-wider text-cream-accent/70 text-start">
                {t('contact.nameLabel')} <span className="text-secondary">*</span>
              </label>
              <div className="relative text-primary">
                <User className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 text-primary/40" />
                <input
                  type="text"
                  name="name"
                  placeholder={t('contact.namePlaceholder')}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 py-2 bg-white rounded-xl text-xs outline-none border focus:border-secondary transition-all border-transparent text-start font-medium"
                  disabled={loading}
                />
              </div>
              {errors.name && <span className="text-[9px] font-bold text-red-300 text-start">{errors.name}</span>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1 text-start">
              <label className="text-[9px] font-bold uppercase tracking-wider text-cream-accent/70 text-start">
                {t('contact.phoneLabel')} <span className="text-secondary">*</span>
              </label>
              <div className="relative text-primary">
                <Phone className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 text-primary/40" />
                <input
                  type="text"
                  name="phone"
                  placeholder={language === 'fr' ? 'ex: +33 6 1234 5678' : language === 'ar' ? 'مثال: 0612345678' : 'e.g. +1 (555) 123-4567'}
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 py-2 bg-white rounded-xl text-xs outline-none border focus:border-secondary transition-all border-transparent text-start font-medium"
                  disabled={loading}
                />
              </div>
              {errors.phone && <span className="text-[9px] font-bold text-red-300 text-start">{errors.phone}</span>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1 sm:col-span-2 text-start">
              <label className="text-[9px] font-bold uppercase tracking-wider text-cream-accent/70 text-start">
                {t('contact.emailLabel')} <span className="text-secondary">*</span>
              </label>
              <div className="relative text-primary">
                <Mail className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 text-primary/40" />
                <input
                  type="email"
                  name="email"
                  placeholder={language === 'fr' ? 'ex: adoptant@gmail.com' : 'e.g. adopter@gmail.com'}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 py-2 bg-white rounded-xl text-xs outline-none border focus:border-secondary transition-all border-transparent text-start font-medium ${
                    user ? 'bg-cream-accent/50 cursor-not-allowed opacity-80' : ''
                  }`}
                  disabled={loading || !!user}
                />
              </div>
              {errors.email && <span className="text-[9px] font-bold text-red-300 text-start">{errors.email}</span>}
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1 sm:col-span-2 text-start">
              <label className="text-[9px] font-bold uppercase tracking-wider text-cream-accent/70 text-start">
                {t('contact.pitchLabel')} <span className="text-secondary">*</span>
              </label>
              <div className="relative text-primary">
                <FileText className="absolute ltr:left-3 rtl:right-3 top-3 w-3.5 text-primary/40" />
                <textarea
                  name="message"
                  rows="3"
                  placeholder={t('contact.pitchPlaceholder')}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 py-2 bg-white rounded-xl text-xs outline-none border focus:border-secondary transition-all resize-none border-transparent text-start font-medium leading-relaxed"
                  disabled={loading}
                />
              </div>
              {errors.message && <span className="text-[9px] font-bold text-red-300 text-start">{errors.message}</span>}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-secondary hover:bg-secondary-dark text-cream-bg py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-md shadow-secondary/15"
            disabled={loading}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center text-[10px] py-0.5">
                <span className="w-3.5 h-3.5 border-2 border-cream-bg border-t-transparent rounded-full animate-spin mb-1" />
                <span>{statusMessage}</span>
              </div>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                <span>{t('contact.submitBtn')}</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
