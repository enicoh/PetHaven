import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldAlert, Heart, Sparkles, Package, Bone, ShoppingBag, Cookie, ShieldCheck, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ContactForm from './ContactForm';
import gsap from 'gsap';

export default function PetModal({ pet, onClose, matchScore }) {
  const { user, reportListing } = useAuth();
  const { language, t } = useLanguage();
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('Commercial Breeder / Selling');
  const [reportDetails, setReportDetails] = useState('');
  const [reporterEmail, setReporterEmail] = useState(user ? user.email : '');
  const [duplicateReportError, setDuplicateReportError] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [activeImage, setActiveImage] = useState(pet.image);

  const modalOverlayRef = useRef(null);
  const modalBoxRef = useRef(null);

  useEffect(() => {
    setActiveImage(pet.image);
  }, [pet]);

  // Sync reporter email if authenticated user shifts
  useEffect(() => {
    if (user) {
      setReporterEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (window.lenis) {
      window.lenis.stop();
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        modalOverlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.9, y: 30, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.4)' }
      );
    });

    return () => {
      document.body.style.overflow = 'auto';
      if (window.lenis) {
        window.lenis.start();
      }
      ctx.revert();
    };
  }, []);

  const handleClose = () => {
    gsap.to(modalBoxRef.current, {
      scale: 0.95,
      y: 20,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
    });
    gsap.to(modalOverlayRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  const getSupplyIcon = (item) => {
    const text = item.toLowerCase();
    if (text.includes('carrier') || text.includes('cage') || text.includes('playpen')) {
      return <ShoppingBag className="w-5 h-5 text-amber-700 fill-amber-50" />;
    }
    if (text.includes('toy') || text.includes('toys')) {
      return <Bone className="w-5 h-5 text-amber-700 fill-amber-50" />;
    }
    if (text.includes('bowl') || text.includes('bowls') || text.includes('bottle')) {
      return <Cookie className="w-5 h-5 text-amber-700 fill-amber-50" />;
    }
    if (text.includes('leash') || text.includes('collar') || text.includes('harness')) {
      return <Heart className="w-5 h-5 text-amber-700 fill-amber-50" />;
    }
    return <Package className="w-5 h-5 text-amber-700 fill-amber-50" />;
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportDetails.trim() || !reporterEmail.trim()) return;

    setReporting(true);
    setDuplicateReportError(false);
    try {
      await reportListing(pet.id, pet.name, reportReason, reportDetails, reporterEmail);
      setReportSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      if (err.message === 'DUPLICATE_REPORT') {
        setDuplicateReportError(true);
      } else {
        console.error(err);
      }
    } finally {
      setReporting(false);
    }
  };

  const getSpeciesLabel = (species) => {
    switch (species) {
      case 'dog':
        return t('grid.dogs').replace(/ 🐶|🐶/g, '');
      case 'cat':
        return t('grid.cats').replace(/ 🐱|🐱/g, '');
      case 'rabbit':
        return t('grid.rabbits').replace(/ 🐰|🐰/g, '');
      case 'bird':
        return t('grid.birds').replace(/ 🐦|🐦/g, '');
      default:
        return species;
    }
  };

  const getGenderLabel = (gender) => {
    const gLower = gender.toLowerCase();
    if (gLower === 'male') {
      return language === 'fr' ? 'Mâle' : language === 'ar' ? 'ذكر' : 'Male';
    }
    if (gLower === 'female') {
      return language === 'fr' ? 'Femelle' : language === 'ar' ? 'أنثى' : 'Female';
    }
    return gender;
  };

  const getAgeLabel = (age) => {
    const ageLower = age.toLowerCase();
    if (ageLower.includes('puppy') || ageLower.includes('kitten') || ageLower.includes('baby') || ageLower.includes('bébé') || ageLower.includes('رضيع') || ageLower.includes('جرو')) {
      const text = t('grid.puppy');
      if (text.includes('/')) {
        return text.split(' / ')[1] || text.split(' / ')[0];
      }
      return text;
    }
    if (ageLower === 'young' || ageLower === 'jeune' || ageLower === 'شاب') return t('grid.young');
    if (ageLower === 'adult' || ageLower === 'adulte' || ageLower === 'بالغ') return t('grid.adult');
    if (ageLower === 'senior' || ageLower === 'sénior' || ageLower === 'كبير السن') return t('grid.senior');
    return age;
  };

  const getReportReasons = () => {
    if (language === 'fr') {
      return [
        { value: 'Commercial Breeder / Selling', label: 'Éleveur commercial / Vente' },
        { value: 'Tried to charge adoption fees', label: 'A tenté de facturer des frais' },
        { value: 'Suspicious listing / Scammer', label: 'Annonce suspecte / Arnaque' },
        { value: 'Inappropriate / abusive photos', label: 'Photos inappropriées / abusives' }
      ];
    }
    if (language === 'ar') {
      return [
        { value: 'Commercial Breeder / Selling', label: 'مربي تجاري / بيع' },
        { value: 'Tried to charge adoption fees', label: 'حاول فرض رسوم تبني' },
        { value: 'Suspicious listing / Scammer', label: 'إعلان مشبوه / احتيال' },
        { value: 'Inappropriate / abusive photos', label: 'صور غير لائقة / مسيئة' }
      ];
    }
    return [
      { value: 'Commercial Breeder / Selling', label: 'Commercial Breeder / Selling' },
      { value: 'Tried to charge adoption fees', label: 'Tried to charge adoption fees' },
      { value: 'Suspicious listing / Scammer', label: 'Suspicious listing / Scammer' },
      { value: 'Inappropriate / abusive photos', label: 'Inappropriate / abusive photos' }
    ];
  };

  if (!pet) return null;

  return (
    <div
      ref={modalOverlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      onClick={handleClose}
    >
      {/* Modal Wrapper Box - Fixed height and hidden overflow on md for independent column scroll */}
      <div
        ref={modalBoxRef}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="relative bg-white rounded-[32px] shadow-2xl border border-cream-accent/50 w-full max-w-4xl max-h-[90vh] md:h-[650px] overflow-y-auto md:overflow-hidden select-text text-start flex flex-col md:flex-row font-sans"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 ltr:right-4 rtl:left-4 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer border border-primary/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left column: High resolution Image Gallery with Thumbnail Carousel */}
        <div className="w-full md:w-1/2 relative min-h-[350px] md:h-full select-none bg-cream-bg flex flex-col justify-end">
          <img
            src={activeImage}
            alt={pet.name}
            className="w-full h-full object-cover md:absolute md:inset-0 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
          
          {/* Gallery Thumbnails Overlay */}
          {pet.images && pet.images.length > 1 && (
            <div className="absolute bottom-16 left-0 right-0 px-6 flex justify-center gap-2 z-10 overflow-x-auto py-2 scrollbar-none select-none">
              {pet.images.slice(0, 6).map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-11 h-11 rounded-xl overflow-hidden border-2 shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
                    activeImage === imgUrl ? 'border-secondary scale-105' : 'border-white/70 hover:border-white opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <span className="absolute bottom-6 ltr:left-6 rtl:right-6 bg-secondary text-cream-bg text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg z-10 select-none">
            {t('modal.freeAdoption')}
          </span>
        </div>

        {/* Right column: Content Details - Scrolls independently on md with hidden scrollbars */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col gap-6 relative overflow-y-auto md:h-full scrollbar-none">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold text-primary tracking-tight font-sans text-start">
                  {pet.name}
                </h2>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/5 text-primary">
                  {getSpeciesLabel(pet.species)}
                </span>
              </div>

              {/* Dynamic Match Tag */}
              {matchScore !== undefined && matchScore !== null && (
                <span className="text-xs font-bold bg-secondary text-cream-bg px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-secondary-dark/15">
                  <Sparkles className="w-3 h-3 fill-current animate-pulse" />
                  <span>{matchScore}% Match</span>
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-primary-light/80 text-start">
              {pet.breed} • {getAgeLabel(pet.age)} • {getGenderLabel(pet.gender)}
            </p>
            <div className="flex items-center justify-between mt-1 text-xs">
              <p className="text-primary-light/60 flex items-center gap-1 text-start">
                📍 {language === 'ar' ? 'الموقع: ' : language === 'fr' ? 'Situé à ' : 'Located in '} {pet.location}
              </p>
              
              {/* Report button */}
              {!showReport && (
                <button
                  onClick={() => setShowReport(true)}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors cursor-pointer animate-fade-in shrink-0 ltr:ml-2 rtl:mr-2"
                >
                  <Flag className="w-3 h-3 fill-current" />
                  <span>{t('modal.reportBtn')}</span>
                </button>
              )}
            </div>
          </div>

          {/* REPORT SUB-PANEL DRAWER OVERLAY */}
          {showReport ? (
            <div className="absolute inset-0 bg-white rounded-r-[32px] p-6 sm:p-8 flex flex-col justify-between z-10 animate-fade-in text-start">
              {reportSuccess ? (
                <div className="text-center py-20 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 animate-bounce">
                    <Flag className="w-6 h-6 fill-current" />
                  </div>
                  <h4 className="font-extrabold text-lg text-primary text-center">{t('modal.reportSuccessTitle')}</h4>
                  <p className="text-xs text-primary-light mt-1.5 max-w-sm mx-auto leading-relaxed text-center">
                    {t('modal.reportSuccessDesc')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4 h-full flex flex-col justify-between text-start">
                  <div className="space-y-4 text-start">
                    <div className="flex items-center justify-between border-b border-cream-accent/50 pb-3">
                      <h4 className="font-extrabold text-sm text-red-600 flex items-center gap-1.5 text-start">
                        <Flag className="w-4 h-4 text-red-600 fill-current" />
                        {t('modal.reportTitle')}
                      </h4>
                    </div>

                    <div className="flex flex-col gap-1.5 text-start">
                      <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider text-start">
                        {t('modal.reportEmailLabel')}
                      </label>
                      <input
                        type="email"
                        placeholder={t('modal.reportEmailPlaceholder')}
                        value={reporterEmail}
                        onChange={(e) => setReporterEmail(e.target.value)}
                        className={`form-input text-xs text-start ${user ? 'bg-slate-100 cursor-not-allowed opacity-80' : ''}`}
                        required
                        disabled={reporting || !!user}
                      />
                      {duplicateReportError && (
                        <span className="text-[10px] font-bold text-red-500 mt-1 block select-none">
                          ⚠️ {t('modal.reportErrorDuplicate')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 text-start">
                      <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider text-start">
                        {t('modal.reportReasonLabel')}
                      </label>
                      <select
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="form-input text-xs font-medium text-start"
                      >
                        {getReportReasons().map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 text-start">
                      <label className="text-[10px] font-bold text-primary/70 uppercase tracking-wider text-start">
                        {t('modal.reportDetailsLabel')}
                      </label>
                      <textarea
                        rows="4"
                        placeholder={t('modal.reportDetailsPlaceholder')}
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        className="form-input text-xs resize-none text-start"
                        required
                        disabled={reporting}
                      />
                    </div>
                  </div>

                  {/* Cancel and Submit at the bottom to prevent header X collisions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReport(false);
                        setReportDetails('');
                      }}
                      className="flex-1 bg-cream-bg hover:bg-cream-accent border border-primary/10 text-primary py-3 rounded-2xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                      disabled={reporting}
                    >
                      {t('modal.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-md shadow-red-600/10"
                      disabled={reporting}
                    >
                      {reporting ? (
                        <span>{t('modal.reportFiling')}</span>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{t('modal.reportSubmit')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {/* Key Checklist Attributes */}
          <div className="grid grid-cols-2 gap-3.5 bg-cream-accent/40 p-4 rounded-2xl border border-cream-accent/50 text-xs">
            <div className="flex items-center gap-2 text-primary text-start">
              <ShieldCheck className={`w-4 h-4 shrink-0 ${pet.vaccinated ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className={`truncate ${pet.vaccinated ? 'font-semibold' : 'text-primary-light/70'}`}>
                {pet.vaccinated ? t('modal.vaccinated') : t('modal.notVaccinated')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-primary text-start">
              <ShieldCheck className={`w-4 h-4 shrink-0 ${pet.neutered ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className={`truncate ${pet.neutered ? 'font-semibold' : 'text-primary-light/70'}`}>
                {pet.neutered ? t('modal.neutered') : t('modal.notNeutered')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-primary text-start">
              <ShieldCheck className={`w-4 h-4 shrink-0 ${pet.goodWithKids ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className={`truncate ${pet.goodWithKids ? 'font-semibold' : 'text-primary-light/70'}`}>
                {pet.goodWithKids ? t('modal.kidsFriendly') : t('modal.notKids')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-primary text-start">
              <ShieldCheck className={`w-4 h-4 shrink-0 ${pet.houseTrained ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className={`truncate ${pet.houseTrained ? 'font-semibold' : 'text-primary-light/70'}`}>
                {pet.houseTrained ? t('modal.houseTrained') : t('modal.notTrained')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="text-start">
            <h4 className="font-bold text-xs uppercase tracking-wider text-primary/60 mb-2 text-start">
              {t('modal.story')}
            </h4>
            <p className="text-sm text-primary-light/95 leading-relaxed bg-cream-bg/20 p-4 rounded-2xl border border-cream-accent/20 text-start">
              {pet.description}
            </p>
          </div>

          {/* Starter Supplies Wooden Shelf */}
          {pet.supplies && pet.supplies.length > 0 && (
            <div className="text-start">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary/60 mb-2.5 text-start">
                {t('modal.suppliesShelf')}
              </h4>
              <div className="relative border-b-[5px] border-amber-800/15 pb-2 rounded-2xl bg-amber-500/5 p-4 border border-amber-900/5">
                <div className="grid grid-cols-3 gap-3">
                  {pet.supplies.map((supply, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-2.5 border border-amber-900/5 hover:-translate-y-1 transition-transform flex flex-col items-center justify-center text-center shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center mb-1.5 shrink-0 border border-amber-100">
                        {getSupplyIcon(supply)}
                      </div>
                      <span className="text-[10px] font-bold text-amber-900 truncate w-full px-1">
                        {supply}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Safe Contact Form Section */}
          <div className="mt-auto pt-2 border-t border-cream-accent/50">
            <ContactForm pet={pet} />
          </div>
        </div>
      </div>
    </div>
  );
}
