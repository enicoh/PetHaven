import React from 'react';
import { PawPrint, Heart, Mail, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-cream-accent/80 pt-16 pb-8 px-6 border-t border-primary-dark/20 relative overflow-hidden font-sans">
      {/* Decorative Blur */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-light/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-cream-accent/10 pb-12 mb-8">
        {/* Brand Summary */}
        <div className="md:col-span-5 flex flex-col gap-4 text-start">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-cream-bg flex items-center justify-center text-primary shadow-md">
              <PawPrint className="w-5 h-5 fill-current" />
            </div>
            <span className="font-extrabold text-lg text-cream-bg font-sans tracking-tight">
              PetHaven
            </span>
          </div>
          <p className="text-sm leading-relaxed text-cream-accent/60 max-w-sm text-start">
            {t('footer.desc')}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-secondary font-bold uppercase tracking-wider mt-1.5 text-start">
            <Heart className="w-4 h-4 fill-current text-secondary animate-pulse" />
            <span>{t('footer.badge')}</span>
          </div>
        </div>

        {/* Safety Warning */}
        <div className="md:col-span-4 flex flex-col gap-4 text-start">
          <h4 className="font-bold text-xs uppercase tracking-wider text-cream-bg flex items-center gap-2 text-start">
            <ShieldAlert className="w-4 h-4 text-secondary" />
            {t('footer.safetyTitle')}
          </h4>
          <p className="text-xs leading-relaxed text-cream-accent/60 text-start">
            {t('footer.safetyDesc')}
          </p>
        </div>

        {/* Quick Contacts */}
        <div className="md:col-span-3 flex flex-col gap-4 text-start">
          <h4 className="font-bold text-xs uppercase tracking-wider text-cream-bg text-start">
            {t('footer.supportTitle')}
          </h4>
          <p className="text-xs text-cream-accent/60 text-start">
            {t('footer.supportDesc')}
          </p>
          <a
            href="mailto:khelifatihocinemahmoud@gmail.com"
            className="flex items-center gap-2 text-sm font-semibold text-secondary hover:text-cream-bg transition-colors duration-200 text-start break-all"
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>khelifatihocinemahmoud@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-cream-accent/40 gap-4">
        <p className="text-center sm:text-start">{t('footer.copyright')}</p>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6">
          <a href="#" className="hover:text-cream-bg transition-colors">{t('footer.guide')}</a>
          <a href="#" className="hover:text-cream-bg transition-colors">{t('footer.terms')}</a>
          <a href="#" className="hover:text-cream-bg transition-colors">{t('footer.privacy')}</a>
        </div>
      </div>
    </footer>
  );
}
