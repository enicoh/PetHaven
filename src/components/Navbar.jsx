import React, { useState, useEffect, useRef } from 'react';
import { Heart, Plus, PawPrint, LogIn, LogOut, ShieldAlert, Mail, User as UserIcon, Inbox, Check, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthModal from './AuthModal';
import gsap from 'gsap';

export default function Navbar({ onAnnounceClick, listCount, pets = [], onPetSelect, onRemovePet }) {
  const { user, logout, inboxMessages, setInboxMessages } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxTab, setInboxTab] = useState('messages'); // 'messages' or 'listings'
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [deletingPetId, setDeletingPetId] = useState(null);

  const navRef = useRef(null);
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  // Filter messages intended for the current user's listings
  const myMessages = inboxMessages.filter((msg) => msg.ownerId === (user ? user.id : ''));
  const unreadCount = myMessages.filter((msg) => !msg.isRead).length;

  // Filter pets announced by the current user
  const myPets = pets.filter((pet) => pet.ownerId === (user ? user.id : ''));

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power4.out', delay: 0.2 }
    );
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scrolling when Inbox is open
  useEffect(() => {
    if (inboxOpen) {
      document.body.style.overflow = 'hidden';
      if (window.lenis) {
        window.lenis.stop();
      }
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
  }, [inboxOpen]);

  const handleMarkAsRead = (msgId) => {
    setInboxMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, isRead: true } : msg))
    );
  };

  const handleScrollToAdmin = () => {
    setProfileDropdownOpen(false);
    const adminPanel = document.getElementById('admin-dashboard');
    if (adminPanel) {
      adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-40 glass border-b border-cream-accent/50 px-6 py-4 transition-all duration-300 select-none font-sans"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-cream-bg transition-transform group-hover:scale-110 duration-300 shadow-md shadow-primary/20">
              <PawPrint className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col text-start">
              <span className="font-bold text-xl tracking-tight text-primary font-sans leading-tight">
                PetHaven
              </span>
              <span className="text-[10px] uppercase tracking-wider text-secondary font-semibold">
                {t('card.freeAdoption')}
              </span>
            </div>
          </a>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-primary-light">
            <a href="#adopt" className="hover:text-primary transition-colors duration-200">
              {t('nav.adopt')}
            </a>
          </div>

          {/* Action Button, Language Selector & Auth */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Active announcements count badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 text-xs font-semibold text-primary">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-slow"></span>
              <span>
                {listCount} {t('nav.activeCount')}
              </span>
            </div>

            {/* List button */}
            <button
              onClick={onAnnounceClick}
              className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-light text-cream-bg px-4 py-2.5 rounded-xl font-semibold text-xs transition-all hover:scale-[1.03] active:scale-[0.98] duration-250 shadow-md shadow-primary/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('nav.listPet')}</span>
            </button>

            {/* Premium Language Dropdown */}
            <div className="relative font-sans" ref={langDropdownRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 bg-cream-card hover:bg-cream-accent text-primary px-2.5 sm:px-3 py-2 rounded-xl font-bold text-xs border border-primary/10 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer h-10 shadow-sm"
              >
                <span className="text-sm sm:text-base select-none leading-none">
                  {language === 'en' ? '🇺🇸' : language === 'fr' ? '🇫🇷' : '🇩🇿'}
                </span>
                <span className="uppercase text-[9px] sm:text-[10px] tracking-wider text-primary font-extrabold">
                  {language}
                </span>
              </button>

              {langDropdownOpen && (
                <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-32 bg-white border border-cream-accent/50 rounded-2xl p-1.5 shadow-xl z-50 animate-fade-in">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 text-start py-2 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      language === 'en' ? 'bg-primary/5 text-primary' : 'text-primary-light hover:bg-cream-accent'
                    }`}
                  >
                    <span className="text-base select-none">🇺🇸</span>
                    <span>English</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('fr');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 text-start py-2 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      language === 'fr' ? 'bg-primary/5 text-primary' : 'text-primary-light hover:bg-cream-accent'
                    }`}
                  >
                    <span className="text-base select-none">🇫🇷</span>
                    <span>Français</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('ar');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 text-start py-2 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      language === 'ar' ? 'bg-primary/5 text-primary' : 'text-primary-light hover:bg-cream-accent'
                    }`}
                  >
                    <span className="text-base select-none">🇩🇿</span>
                    <span>العربية</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Inbox Access Button */}
            {user && (
              <button
                onClick={() => {
                  setInboxTab('messages');
                  setInboxOpen(true);
                }}
                className="relative flex items-center justify-center w-10 h-10 bg-cream-card hover:bg-cream-accent text-primary rounded-xl border border-primary/10 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-sm"
                title={t('nav.myInbox')}
              >
                <Inbox className="w-5 h-5 text-secondary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[8px] font-extrabold text-cream-bg shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth Dropdown / Buttons */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/10 text-primary flex items-center justify-center font-bold text-sm hover:bg-primary/15 transition-colors cursor-pointer"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute ltr:right-0 rtl:left-0 mt-3 w-56 bg-white border border-cream-accent/50 rounded-2xl p-2.5 shadow-xl z-50 text-start animate-fade-in">
                    <div className="px-3.5 py-2 border-b border-cream-accent/50 mb-1.5">
                      <span className="block font-extrabold text-sm text-primary truncate">
                        {user.name}
                      </span>
                      <span className="block text-[10px] text-primary-light/60 truncate font-semibold">
                        {user.email}
                      </span>
                    </div>

                    {/* Messages Inbox link */}
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setInboxTab('messages');
                        setInboxOpen(true);
                      }}
                      className="w-full flex items-center justify-between text-start py-2 px-3 hover:bg-cream-accent rounded-xl text-xs font-bold text-primary transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-secondary" />
                        <span>{t('nav.myInbox')}</span>
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-secondary text-cream-bg text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Admin panel link */}
                    {user.role === 'admin' && (
                      <button
                        onClick={handleScrollToAdmin}
                        className="w-full flex items-center gap-2 text-start py-2 px-3 hover:bg-cream-accent rounded-xl text-xs font-bold text-primary transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-secondary fill-secondary" />
                        <span>{t('nav.moderator')}</span>
                      </button>
                    )}

                    {/* Logout */}
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 text-start py-2 px-3 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer border-t border-cream-accent/30 mt-1.5 pt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.signOut')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 bg-cream-card hover:bg-cream-accent text-primary px-4 py-2.5 rounded-xl font-bold text-xs border border-primary/10 shadow-sm hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-secondary" />
                <span>{t('nav.accountAccess')}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal Container */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Message Inbox overlay drawer */}
      {inboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setInboxOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full bg-white shadow-2xl p-6 sm:p-8 flex flex-col gap-5 select-text text-start relative"
          >
            {/* Close */}
            <button
              onClick={() => setInboxOpen(false)}
              className="absolute top-4 ltr:right-4 rtl:left-4 z-20 w-8 h-8 rounded-full bg-cream-bg hover:bg-cream-accent text-primary flex items-center justify-center transition-all cursor-pointer border border-primary/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-extrabold text-xl text-primary tracking-tight font-sans flex items-center gap-2">
                <Inbox className="w-5 h-5 text-secondary animate-pulse" />
                {t('nav.myInbox')}
              </h3>
              <p className="text-xs text-primary-light/60 mt-0.5 text-start">
                {t('nav.inboxDesc')}
              </p>
            </div>

            {/* Premium Navigation Tabs */}
            <div className="flex border-b border-cream-accent/50 gap-2 text-start select-none">
              <button
                onClick={() => setInboxTab('messages')}
                className={`flex-grow pb-2.5 text-xs font-bold text-center border-b-2 cursor-pointer transition-all ${
                  inboxTab === 'messages'
                    ? 'text-primary border-primary'
                    : 'text-primary-light/60 hover:text-primary-light border-transparent'
                }`}
              >
                {t('nav.inboxTabMessages')} ({myMessages.length})
              </button>
              <button
                onClick={() => setInboxTab('listings')}
                className={`flex-grow pb-2.5 text-xs font-bold text-center border-b-2 cursor-pointer transition-all ${
                  inboxTab === 'listings'
                    ? 'text-primary border-primary'
                    : 'text-primary-light/60 hover:text-primary-light border-transparent'
                }`}
              >
                {t('nav.inboxTabListings')} ({myPets.length})
              </button>
            </div>

            {/* Conditional Lists scroll container */}
            <div data-lenis-prevent className="flex-grow overflow-y-auto space-y-4 pr-1">
              
              {/* TAB 1: ADOPTION INQUIRIES */}
              {inboxTab === 'messages' && (
                <>
                  {myMessages.length === 0 ? (
                    <div className="text-center py-20 bg-cream-bg/30 rounded-2xl border border-dashed border-primary/10 p-6 flex flex-col items-center">
                      <Mail className="w-10 h-10 text-primary/10 mb-2" />
                      <p className="font-bold text-xs text-primary">{t('nav.inboxEmpty')}</p>
                      <p className="text-[10px] text-primary-light/60 mt-1 max-w-[200px] text-center">
                        {t('nav.inboxEmptyDesc')}
                      </p>
                    </div>
                  ) : (
                    myMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-all text-start ${
                          msg.isRead
                            ? 'bg-white border-cream-accent/60'
                            : 'bg-primary/5 border-primary/10 shadow-sm relative'
                        }`}
                      >
                        {!msg.isRead && (
                          <span className="absolute top-4 ltr:right-4 rtl:left-4 w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        )}

                        <div className="text-xs text-start">
                          <span className="font-semibold text-primary-light/60 block">{t('nav.inboxFor')}</span>
                          <span className="font-extrabold text-primary text-sm">🐾 {msg.petName}</span>
                        </div>

                        <p className="text-xs text-primary-light/95 italic bg-cream-bg/40 p-3 rounded-xl border border-cream-accent/30 leading-relaxed text-start">
                          "{msg.message}"
                        </p>

                        {/* Adopter info details */}
                        <div className="bg-cream-bg/30 rounded-xl p-3 border border-cream-accent/20 text-[11px] space-y-1.5 text-primary text-start">
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-secondary fill-secondary" />
                            <span className="font-bold">{msg.adopterName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-secondary" />
                            <span className="font-semibold underline select-all">{msg.adopterEmail}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-secondary rotate-45" />
                            <span className="font-semibold underline select-all">{msg.adopterPhone}</span>
                          </div>
                        </div>

                        {/* Mark as read */}
                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(msg.id)}
                            className="self-start text-[10px] font-bold text-secondary flex items-center gap-1 bg-secondary/10 px-2.5 py-1 rounded-lg border border-secondary/10 hover:bg-secondary/20 transition-all cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('nav.markRead')}</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </>
              )}

              {/* TAB 2: MY ANNOUNCED ANIMALS */}
              {inboxTab === 'listings' && (
                <div className="space-y-3.5 text-start">
                  {myPets.length === 0 ? (
                    <div className="text-center py-20 bg-cream-bg/30 rounded-2xl border border-dashed border-primary/10 p-6 flex flex-col items-center">
                      <PawPrint className="w-10 h-10 text-primary/10 mb-2" />
                      <p className="font-bold text-xs text-primary">
                        {t('nav.listingsEmpty')}
                      </p>
                      <p className="text-[10px] text-primary-light/60 mt-1 max-w-[200px] text-center">
                        {t('nav.listingsEmptyDesc')}
                      </p>
                    </div>
                  ) : (
                    myPets.map((pet) => {
                      const isDeleting = deletingPetId === pet.id;

                      return (
                        <div
                          key={pet.id}
                          className="p-4 rounded-2xl border border-cream-accent/60 bg-white flex flex-col gap-3 transition-all hover:border-primary/20 hover:shadow-md text-start relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between gap-4">
                            {/* Clickable details container */}
                            <div
                              onClick={() => {
                                if (onPetSelect) {
                                  onPetSelect(pet);
                                  setInboxOpen(false);
                                }
                              }}
                              className="flex items-center gap-3.5 min-w-0 text-start cursor-pointer group flex-grow"
                            >
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream-bg shrink-0 transition-transform group-hover:scale-105 duration-300">
                                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" draggable="false" />
                              </div>
                              <div className="min-w-0 text-start">
                                <span className="font-extrabold text-primary text-sm block truncate group-hover:text-secondary transition-colors duration-200">{pet.name}</span>
                                <span className="text-[10px] text-primary-light/60 block truncate">{pet.breed}</span>
                              </div>
                            </div>

                            {/* Actions / Status pills */}
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Audit Status Pill */}
                              <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full border ${
                                pet.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                  : pet.status === 'flagged'
                                  ? 'bg-red-50 text-red-700 border-red-200/50'
                                  : 'bg-amber-50 text-amber-700 border-amber-200/50'
                              }`}>
                                {pet.status === 'approved'
                                  ? t('nav.statusActive')
                                  : pet.status === 'flagged'
                                  ? t('nav.statusFlagged')
                                  : t('nav.statusPending')}
                              </span>

                              {/* Trash Delete Trigger */}
                              {onRemovePet && !isDeleting && (
                                <button
                                  onClick={() => setDeletingPetId(pet.id)}
                                  className="p-1.5 rounded-lg text-primary-light/50 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-100"
                                  title={t('nav.deleteConfirm')}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Inline Deletion Confirmation Flow */}
                          {isDeleting && (
                            <div className="flex items-center justify-between border-t border-red-100/50 pt-2.5 mt-1 select-none animate-fade-in">
                              <span className="text-[10px] font-bold text-red-600">
                                ⚠️ {t('nav.deletePrompt')}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    onRemovePet(pet.id);
                                    setDeletingPetId(null);
                                  }}
                                  className="text-[9px] font-extrabold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                >
                                  {t('nav.deleteConfirm')}
                                </button>
                                <button
                                  onClick={() => setDeletingPetId(null)}
                                  className="text-[9px] font-extrabold text-primary-light/75 hover:text-primary hover:bg-cream-accent px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-cream-accent"
                                >
                                  {t('nav.deleteCancel')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
