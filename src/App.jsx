import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MatchmakerQuiz from './components/MatchmakerQuiz';
import PetGrid from './components/PetGrid';
import PetModal from './components/PetModal';
import SafetyFinder from './components/SafetyFinder';
import ListForm from './components/ListForm';
import SuccessGallery from './components/SuccessGallery';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import { useLenis } from './hooks/useLenis';
import { initialPets } from './data/initialPets';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { supabase } from './context/supabaseClient';

function AppContent() {
  // Activate Lenis smooth scrolling globally
  useLenis();

  const { user, addLog } = useAuth();

  // State to hold all pet announcements, synced to localStorage
  const [pets, setPets] = useState(() => {
    const saved = localStorage.getItem('pethaven_pets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure default initial pets have v3 supplies and compatibilityTags status
        const hasV3Keys = parsed.some((p) => p.status !== undefined);
        if (!hasV3Keys) {
          // Initialize existing pets with 'approved' status
          const upgraded = parsed.map((p) => {
            const defaults = initialPets.find((ip) => ip.id === p.id);
            return {
              ...p,
              status: 'approved',
              supplies: p.supplies || (defaults ? defaults.supplies : []),
              compatibilityTags: p.compatibilityTags || (defaults ? defaults.compatibilityTags : { space: 'apartment', activity: 'medium', aloneTime: 'medium', kids: true })
            };
          });
          localStorage.setItem('pethaven_pets', JSON.stringify(upgraded));
          return upgraded;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved pets from localStorage', e);
      }
    }
    // Initialize initial pets as 'approved'
    const seed = initialPets.map((p) => ({ ...p, status: 'approved' }));
    localStorage.setItem('pethaven_pets', JSON.stringify(seed));
    return seed;
  });

  // State for detail modal
  const [selectedPet, setSelectedPet] = useState(null);

  // State for quiz matching scores map
  const [quizScores, setQuizScores] = useState(null);

  // Sync state to local storage when changed (local backup support)
  useEffect(() => {
    localStorage.setItem('pethaven_pets', JSON.stringify(pets));
  }, [pets]);

  // ON MOUNT: Fetch real-time pets from Supabase if active
  useEffect(() => {
    if (!supabase) return;

    const fetchPets = async () => {
      try {
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .order('date_added', { ascending: false });

        if (!error && data) {
          const camelPets = data.map((p) => ({
            id: p.id,
            name: p.name,
            species: p.species,
            breed: p.breed,
            age: p.age,
            gender: p.gender,
            size: p.size,
            location: p.location,
            description: p.description,
            vaccinated: p.vaccinated,
            neutered: p.neutered,
            goodWithKids: p.good_with_kids,
            houseTrained: p.house_trained,
            ownerName: p.owner_name,
            ownerPhone: p.owner_phone,
            ownerEmail: p.owner_email,
            ownerId: p.owner_id,
            image: p.image,
            images: p.images,
            dateAdded: p.date_added,
            supplies: p.supplies,
            compatibilityTags: p.compatibility_tags,
            status: p.status
          }));
          setPets(camelPets);
        }
      } catch (err) {
        console.error('Failed to sync pets list with Supabase', err);
      }
    };

    fetchPets();
  }, []);

  // Listen for auto-moderator auto-deletion events from AuthContext
  useEffect(() => {
    const handleAutoDelete = (e) => {
      const { petId } = e.detail;
      setPets((prev) => prev.filter((p) => p.id !== petId));
      if (selectedPet && selectedPet.id === petId) {
        setSelectedPet(null);
      }
    };
    window.addEventListener('pethaven_pet_autodeleted', handleAutoDelete);
    return () => {
      window.removeEventListener('pethaven_pet_autodeleted', handleAutoDelete);
    };
  }, [selectedPet]);

  // Handle adding a new pet announcement (placed in local listings list)
  const handlePetAdded = async (newPet) => {
    if (supabase) {
      try {
        const dbPet = {
          id: newPet.id,
          name: newPet.name,
          species: newPet.species,
          breed: newPet.breed,
          age: newPet.age,
          gender: newPet.gender,
          size: newPet.size,
          location: newPet.location,
          description: newPet.description,
          vaccinated: newPet.vaccinated,
          neutered: newPet.neutered,
          good_with_kids: newPet.goodWithKids,
          house_trained: newPet.houseTrained,
          owner_name: newPet.ownerName,
          owner_phone: newPet.ownerPhone,
          owner_email: newPet.ownerEmail,
          owner_id: newPet.ownerId,
          image: newPet.image,
          images: newPet.images,
          date_added: newPet.dateAdded,
          supplies: newPet.supplies,
          compatibility_tags: newPet.compatibilityTags,
          status: newPet.status
        };
        await supabase.from('pets').insert([dbPet]);
      } catch (err) {
        console.error('Failed to upload pet to Supabase', err);
      }
    }
    setPets((prev) => [newPet, ...prev]);
  };

  // Moderator operations
  const handleApprovePet = async (petId) => {
    if (supabase) {
      try {
        await supabase
          .from('pets')
          .update({ status: 'approved' })
          .eq('id', petId);
      } catch (err) {
        console.error('Failed to update pet status in Supabase', err);
      }
    }
    setPets((prev) =>
      prev.map((pet) => (pet.id === petId ? { ...pet, status: 'approved' } : pet))
    );
  };

  const handleRejectPet = async (petId) => {
    if (supabase) {
      try {
        await supabase.from('pets').delete().eq('id', petId);
      } catch (err) {
        console.error('Failed to delete pet from Supabase', err);
      }
    }
    setPets((prev) => prev.filter((pet) => pet.id !== petId));
  };

  const handleRemovePet = async (petId) => {
    const petToRemove = pets.find((p) => p.id === petId);
    const petName = petToRemove ? petToRemove.name : 'Unknown Pet';
    
    if (supabase) {
      try {
        await supabase.from('pets').delete().eq('id', petId);
      } catch (err) {
        console.error('Failed to delete pet from Supabase', err);
      }
    }

    setPets((prev) => prev.filter((pet) => pet.id !== petId));
    if (selectedPet && selectedPet.id === petId) {
      setSelectedPet(null);
    }
    addLog('Pet Withdrawn', `Listing '${petName}' was deleted by its owner.`);
  };

  // Scroll navigation helpers
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      if (window.lenis) {
        window.lenis.scrollTo(element, { offset: -80, duration: 1.5 });
      } else {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Public listings show approved pets only
  const approvedPets = pets.filter((pet) => pet.status === 'approved');

  return (
    <div className="min-h-screen bg-cream-bg flex flex-col font-sans">
      {/* Floating Header */}
      <Navbar
        listCount={approvedPets.length}
        onAnnounceClick={() => scrollToSection('list-pet')}
        pets={pets}
        onPetSelect={setSelectedPet}
        onRemovePet={handleRemovePet}
      />

      {/* Main Sections */}
      <main className="flex-grow">
        {/* Animated Hero Header */}
        <Hero
          onAdoptClick={() => scrollToSection('adopt')}
          onAnnounceClick={() => scrollToSection('list-pet')}
        />

        {/* 1. Interactive Matchmaker Quiz */}
        <MatchmakerQuiz
          pets={approvedPets}
          onQuizComplete={(scores) => {
            setQuizScores(scores);
            setTimeout(() => scrollToSection('adopt'), 150);
          }}
          onQuizReset={() => setQuizScores(null)}
        />

        {/* Filterable Listings Section */}
        <PetGrid
          pets={approvedPets}
          onPetSelect={(pet) => setSelectedPet(pet)}
          quizScores={quizScores}
        />

        {/* 3. Safe Meetup Spots & Veterinary Partners (Deactivated for launch - uncomment to reactivate)
        <div className="bg-cream-accent/20 border-t border-b border-cream-accent/40">
          <SafetyFinder />
        </div>
        */}

        {/* Form Creation Stepper Section */}
        <div className="py-10">
          <ListForm key={user ? user.id : 'guest'} onPetAdded={handlePetAdded} />
        </div>

        {/* 2. Success Stories Gallery (Deactivated for launch - uncomment to reactivate)
        <div className="bg-white">
          <SuccessGallery />
        </div>
        */}

        {/* 5. Admin Command Console (Only visible to authenticated administrators) */}
        {user && user.role === 'admin' && (
          <div className="border-t border-slate-800 bg-slate-950">
            <AdminDashboard
              pets={pets}
              onApprovePet={handleApprovePet}
              onRejectPet={handleRejectPet}
              onRemovePet={handleRejectPet}
            />
          </div>
        )}
      </main>

      {/* Empathy Footer */}
      <Footer />

      {/* Detail Overlays */}
      {selectedPet && (
        <PetModal
          pet={selectedPet}
          onClose={() => setSelectedPet(null)}
          matchScore={quizScores ? quizScores[selectedPet.id] : null}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
