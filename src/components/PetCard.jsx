import React from 'react';
import { MapPin, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PetCard({ pet, onSelect, matchScore }) {
  const { t } = useLanguage();

  // Safe color tag generator
  const getBadgeColors = (species) => {
    switch (species) {
      case 'dog':
        return 'bg-amber-50 text-amber-800 border-amber-200/50';
      case 'cat':
        return 'bg-blue-50 text-blue-800 border-blue-200/50';
      case 'rabbit':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/50';
      case 'bird':
        return 'bg-purple-50 text-purple-800 border-purple-200/50';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200/50';
    }
  };

  // Humanize relative date added
  const getRelativeDate = (isoString) => {
    try {
      const date = new Date(isoString);
      const diff = new Date() - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return t('card.addedToday');
      if (days === 1) return t('card.addedYesterday');
      return t('card.addedDaysAgo', { days: days });
    } catch (e) {
      return t('card.recentlyAdded');
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

  const getAgeLabel = (age) => {
    const ageLower = age.toLowerCase();
    if (ageLower.includes('puppy') || ageLower.includes('kitten') || ageLower.includes('baby') || ageLower.includes('bébé') || ageLower.includes('رضيع') || ageLower.includes('جرو')) {
      // Return shortened if too long
      const text = t('grid.puppy');
      if (text.includes('/')) {
        return text.split(' / ')[1] || text.split(' / ')[0]; // puppy/chiot/جرو
      }
      return text;
    }
    if (ageLower === 'young' || ageLower === 'jeune' || ageLower === 'شاب') return t('grid.young');
    if (ageLower === 'adult' || ageLower === 'adulte' || ageLower === 'بالغ') return t('grid.adult');
    if (ageLower === 'senior' || ageLower === 'sénior' || ageLower === 'كبير السن') return t('grid.senior');
    return age; // fallback
  };

  return (
    <div
      onClick={onSelect}
      className="group bg-white rounded-3xl p-4 border border-cream-accent/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer flex flex-col h-full text-start font-sans"
    >
      {/* Visual Container */}
      <div className="relative w-full h-[200px] rounded-2xl overflow-hidden mb-4 bg-cream-bg select-none">
        <img
          src={pet.image}
          alt={pet.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop";
          }}
        />

        {/* Floating Species & Match Score Badges */}
        <div className="absolute top-3 ltr:left-3 rtl:right-3 flex flex-col gap-1.5 z-10">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getBadgeColors(pet.species)}`}>
            {getSpeciesLabel(pet.species)}
          </span>
        </div>

        {/* Dynamic Match Score Pill */}
        {matchScore !== undefined && matchScore !== null && (
          <div className="absolute top-3 ltr:right-3 rtl:left-3 bg-secondary text-cream-bg text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 z-10 animate-fade-in border border-secondary-dark/10">
            <Sparkles className="w-3 h-3 fill-current animate-pulse" />
            <span>{matchScore}% Match</span>
          </div>
        )}

        {/* Free Tag */}
        <span className="absolute bottom-3 ltr:right-3 rtl:left-3 bg-primary text-cream-bg text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm border border-primary-light/10">
          {t('card.freeAdoption')}
        </span>
      </div>

      {/* Info Block */}
      <div className="flex-1 flex flex-col">
        {/* Name and Breed */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-lg text-primary tracking-tight leading-tight group-hover:text-primary-light transition-colors text-start">
            {pet.name}
          </h3>
          <span className="text-[11px] font-bold bg-primary/5 text-primary-light px-2 py-0.5 rounded-md self-center shrink-0">
            {getAgeLabel(pet.age)}
          </span>
        </div>

        {/* Breed details */}
        <p className="text-xs text-primary-light/80 mb-3 truncate text-start">
          {pet.breed}
        </p>

        {/* Details Checklist tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {pet.vaccinated && (
            <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-500/10">
              {t('card.vaccinated')}
            </span>
          )}
          {pet.houseTrained && (
            <span className="text-[9px] font-semibold bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded-full border border-blue-500/10">
              {t('card.houseTrained')}
            </span>
          )}
          {pet.supplies && pet.supplies.length > 0 && (
            <span className="text-[9px] font-semibold bg-amber-500/10 text-amber-800 px-2 py-0.5 rounded-full border border-amber-500/10">
              {t('card.suppliesBadge')} ({pet.supplies.length})
            </span>
          )}
        </div>

        {/* Location and Date */}
        <div className="mt-auto pt-4 border-t border-cream-accent/50 flex items-center justify-between text-xs text-primary-light/60">
          <div className="flex items-center gap-1 min-w-0 text-start">
            <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span className="truncate">{pet.location}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ltr:ml-2 rtl:mr-2">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{getRelativeDate(pet.dateAdded)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
