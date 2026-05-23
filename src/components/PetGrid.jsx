import React, { useState, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import PetCard from './PetCard';

export default function PetGrid({ pets, onPetSelect, quizScores }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedAge, setSelectedAge] = useState('all');
  const [locationSearch, setLocationSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter the pets dynamically based on criteria
  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecies = selectedSpecies === 'all' || pet.species === selectedSpecies;
      const matchesAge = selectedAge === 'all' || pet.age.toLowerCase() === selectedAge.toLowerCase();
      const matchesLocation =
        locationSearch === '' || pet.location.toLowerCase().includes(locationSearch.toLowerCase());

      return matchesSearch && matchesSpecies && matchesAge && matchesLocation;
    });
  }, [pets, searchTerm, selectedSpecies, selectedAge, locationSearch]);

  const categories = [
    { id: 'all', label: t('grid.all'), count: pets.length },
    { id: 'dog', label: t('grid.dogs'), count: pets.filter((p) => p.species === 'dog').length },
    { id: 'cat', label: t('grid.cats'), count: pets.filter((p) => p.species === 'cat').length },
    { id: 'rabbit', label: t('grid.rabbits'), count: pets.filter((p) => p.species === 'rabbit').length },
    { id: 'bird', label: t('grid.birds'), count: pets.filter((p) => p.species === 'bird').length },
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecies('all');
    setSelectedAge('all');
    setLocationSearch('');
  };

  return (
    <section id="adopt" className="py-20 px-6 max-w-7xl mx-auto scroll-mt-24 font-sans">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary leading-tight font-sans">
          {t('grid.title')}
        </h2>
        <p className="text-primary-light mt-3 text-sm sm:text-base">
          {t('grid.subtitle')}
        </p>
      </div>

      {/* Categories Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedSpecies(category.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              selectedSpecies === category.id
                ? 'bg-primary text-cream-bg shadow-md shadow-primary/20 scale-[1.03]'
                : 'bg-white hover:bg-cream-accent text-primary border border-primary/10'
            }`}
          >
            <span>{category.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                selectedSpecies === category.id
                  ? 'bg-secondary text-cream-bg'
                  : 'bg-primary/5 text-primary'
              }`}
            >
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-cream-accent/50 mb-10 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Text Search */}
          <div className="relative md:col-span-5">
            <Search className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 text-primary/40" />
            <input
              type="text"
              placeholder={t('grid.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 bg-cream-bg/40 border border-primary/10 rounded-2xl text-sm outline-none focus:border-primary/40 focus:bg-white transition-all font-medium text-primary text-start"
            />
          </div>

          {/* Location Search */}
          <div className="relative md:col-span-4">
            <MapPin className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 text-primary/40" />
            <input
              type="text"
              placeholder={t('grid.locationPlaceholder')}
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 bg-cream-bg/40 border border-primary/10 rounded-2xl text-sm outline-none focus:border-primary/40 focus:bg-white transition-all font-medium text-primary text-start"
            />
          </div>

          {/* Advanced / Actions */}
          <div className="flex items-center gap-3 md:col-span-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-2xl text-sm font-semibold border border-primary/10 transition-colors cursor-pointer ${
                showAdvanced || selectedAge !== 'all'
                  ? 'bg-primary/5 border-primary/20 text-primary'
                  : 'bg-white hover:bg-cream-accent text-primary-light'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t('grid.filtersBtn')}</span>
            </button>
            {(searchTerm || locationSearch || selectedSpecies !== 'all' || selectedAge !== 'all') && (
              <button
                onClick={clearFilters}
                className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl transition-colors cursor-pointer"
                title="Clear all filters"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-cream-accent/50 text-start">
            <div className="text-start">
              <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-2 text-start">
                {t('grid.ageLabel')}
              </label>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="w-full px-3 py-2 bg-cream-bg/40 border border-primary/10 rounded-xl text-sm outline-none focus:border-primary/40 text-primary font-medium text-start"
              >
                <option value="all">{t('grid.allAges')}</option>
                <option value="puppy">{t('grid.puppy')}</option>
                <option value="young">{t('grid.young')}</option>
                <option value="adult">{t('grid.adult')}</option>
                <option value="senior">{t('grid.senior')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid Results */}
      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} onSelect={() => onPetSelect(pet)} matchScore={quizScores ? quizScores[pet.id] : null} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-cream-accent/50 shadow-sm max-w-2xl mx-auto p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-cream-bg rounded-2xl flex items-center justify-center text-primary/40 mx-auto mb-4">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-primary text-center">{t('grid.noMatches')}</h3>
          <p className="text-sm text-primary-light mt-2 max-w-md mx-auto text-center">
            {t('grid.noMatchesDesc')}
          </p>
          <button
            onClick={clearFilters}
            className="mt-6 bg-primary text-cream-bg px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-all cursor-pointer"
          >
            {t('quiz.reset')}
          </button>
        </div>
      )}
    </section>
  );
}
