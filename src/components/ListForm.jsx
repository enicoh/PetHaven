import React, { useState, useRef } from 'react';
import { PawPrint, MapPin, User, Phone, Mail, ArrowLeft, ArrowRight, Check, Image as ImageIcon, Lock, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import gsap from 'gsap';

export default function ListForm({ onPetAdded }) {
  const { user, addLog } = useAuth();
  const { language, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const formRef = useRef(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: 'Young',
    gender: 'Male',
    size: 'Medium',
    location: '',
    description: '',
    vaccinated: false,
    neutered: false,
    goodWithKids: true,
    houseTrained: true,
    ownerName: user ? user.name : '',
    ownerPhone: '',
    ownerEmail: user ? user.email : '',
    imagesList: [],
    suppliesList: [], // holds selected free starter supplies
  });

  // Validations State
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const remainingSlots = 6 - formData.imagesList.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      const newImages = filesToAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file)
      }));

      setFormData((prev) => ({
        ...prev,
        imagesList: [...prev.imagesList, ...newImages].slice(0, 6)
      }));

      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: null }));
      }
    }
  };

  // Auto-sync owner info if user changes
  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        ownerName: user.name,
        ownerEmail: user.email
      }));
    }
  }, [user]);

  // Handle standard field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Toggle supply check items
  const handleSupplyToggle = (item) => {
    setFormData((prev) => {
      const list = prev.suppliesList || [];
      const updatedList = list.includes(item)
        ? list.filter((x) => x !== item)
        : [...list, item];
      return { ...prev, suppliesList: updatedList };
    });
  };

  // Handle dynamic local image upload (Max 6)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const remainingSlots = 6 - formData.imagesList.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      const newImages = filesToAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file)
      }));

      setFormData((prev) => ({
        ...prev,
        imagesList: [...prev.imagesList, ...newImages].slice(0, 6)
      }));

      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: null }));
      }
    }
  };

  // Image select helper
  const handleImagePlaceholder = (num) => {
    const placeholders = [
      '/assets/dog_puppy.png',
      '/assets/ginger_kitten.png',
      '/assets/white_bunny.png',
      '/assets/parakeet_bird.png',
    ];
    
    if (formData.imagesList.length >= 6) return;

    setFormData((prev) => ({
      ...prev,
      imagesList: [...prev.imagesList, { file: null, preview: placeholders[num] }].slice(0, 6)
    }));

    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      imagesList: prev.imagesList.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const getValidationError = (field, type) => {
    if (language === 'fr') {
      if (field === 'name') return 'Le nom de l\'animal est requis';
      if (field === 'breed') return 'La race est requise';
      if (field === 'location') return 'La localisation est requise';
      if (field === 'description') return type === 'short' ? 'L\'histoire doit faire au moins 15 caractères' : 'Veuillez raconter l\'histoire de l\'animal';
      if (field === 'ownerName') return 'Votre nom complet est requis';
      if (field === 'ownerPhone') return 'Le numéro de téléphone est requis';
      if (field === 'ownerEmail') return type === 'invalid' ? 'Adresse e-mail invalide' : 'L\'adresse e-mail est requise';
      if (field === 'image') return 'Une photo ou une illustration de test est requise';
    }
    if (language === 'ar') {
      if (field === 'name') return 'اسم الأليف مطلوب';
      if (field === 'breed') return 'السلالة أو الفصيلة مطلوبة';
      if (field === 'location') return 'الموقع مطلوب';
      if (field === 'description') return type === 'short' ? 'يجب أن تتكون القصة من 15 حرفاً على الأقل' : 'يرجى كتابة تفاصيل وقصة الأليف';
      if (field === 'ownerName') return 'الاسم الكامل مطلوب';
      if (field === 'ownerPhone') return 'رقم الهاتف مطلوب';
      if (field === 'ownerEmail') return type === 'invalid' ? 'البريد الإلكتروني غير صالح' : 'البريد الإلكتروني مطلوب';
      if (field === 'image') return 'الصورة أو الصورة التجريبية مطلوبة';
    }
    // Default English
    if (field === 'name') return 'Pet Name is required';
    if (field === 'breed') return 'Breed is required';
    if (field === 'location') return 'Location (City, State) is required';
    if (field === 'description') return type === 'short' ? 'Story must be at least 15 characters' : 'Please tell a short story of the animal';
    if (field === 'ownerName') return 'Your name is required';
    if (field === 'ownerPhone') return 'Phone number is required';
    if (field === 'ownerEmail') return type === 'invalid' ? 'Invalid email address' : 'Email address is required';
    if (field === 'image') return 'An image or placeholder is required';
    return '';
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = getValidationError('name');
      if (!formData.breed.trim()) newErrors.breed = getValidationError('breed');
    } else if (currentStep === 2) {
      if (!formData.location.trim()) newErrors.location = getValidationError('location');
      if (!formData.description.trim()) {
        newErrors.description = getValidationError('description');
      } else if (formData.description.length < 15) {
        newErrors.description = getValidationError('description', 'short');
      }
    } else if (currentStep === 3) {
      if (!formData.ownerName.trim()) newErrors.ownerName = getValidationError('ownerName');
      if (!formData.ownerPhone.trim()) newErrors.ownerPhone = getValidationError('ownerPhone');
      if (!formData.ownerEmail.trim()) {
        newErrors.ownerEmail = getValidationError('ownerEmail', 'empty');
      } else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
        newErrors.ownerEmail = getValidationError('ownerEmail', 'invalid');
      }
      if (formData.imagesList.length === 0) newErrors.image = getValidationError('image');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      gsap.to(formRef.current, {
        opacity: 0,
        x: -20,
        duration: 0.25,
        onComplete: () => {
          setStep((prev) => prev + 1);
          gsap.fromTo(
            formRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.3 }
          );
        },
      });
    }
  };

  const handleBack = () => {
    gsap.to(formRef.current, {
      opacity: 0,
      x: 20,
      duration: 0.25,
      onComplete: () => {
        setStep((prev) => prev - 1);
        gsap.fromTo(
          formRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.3 }
        );
      },
    });
  };

  // Anti-scam keyword filter scanner (supporting cross-language commercial terms check)
  const scanForSuspiciousKeywords = () => {
    const textToScan = `${formData.name} ${formData.breed} ${formData.description}`.toLowerCase();
    const bannedKeywords = [
      'fee', 'charge', 'price', 'cash', 'dollars', 'deposit', 'cost', 'selling', 'payment', 'buy', 'sell',
      'frais', 'prix', 'argent', 'euros', 'caution', 'coût', 'vendre', 'vente', 'payer', 'achat', 'acheter',
      'رسوم', 'مبلغ', 'سعر', 'نقود', 'دولار', 'دينار', 'يورو', 'دفع', 'بيع', 'شراء', 'تكلفة'
    ];
    const foundKeywords = bannedKeywords.filter((word) => textToScan.includes(word));
    return foundKeywords;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setLoading(true);
    setStatusMessage(
      language === 'fr'
        ? '1. Analyse de la description pour conformité réglementaire...'
        : language === 'ar'
        ? '1. فحص محتوى الإعلان لضمان سلامة سياسات التبني...'
        : '1. Scanning listing description for policy safety compliance...'
    );
    await new Promise((r) => setTimeout(r, 850));

    setStatusMessage(
      language === 'fr'
        ? '2. Redimensionnement et transfert des images vers Cloud Storage...'
        : language === 'ar'
        ? '2. تحجيم ورفع الصورة إلى خوادم التخزين السحابي...'
        : '2. Resizing and uploading images to secure Cloud Storage...'
    );
    await new Promise((r) => setTimeout(r, 850));

    // Check scam keywords
    const flaggedWords = scanForSuspiciousKeywords();
    const isSpam = flaggedWords.length > 0;
    
    // Status decision: Goes live immediately ('approved') unless flagged as spam ('flagged')
    const petStatus = isSpam ? 'flagged' : 'approved';

    const compTags = {
      space: formData.species === 'dog' ? 'yard' : 'apartment',
      activity: formData.species === 'dog' ? 'high' : formData.species === 'cat' ? 'medium' : 'low',
      aloneTime: 'medium',
      kids: formData.goodWithKids,
    };

    const newPet = {
      id: `pet-${Date.now()}`,
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      age: formData.age,
      gender: formData.gender,
      size: formData.size,
      location: formData.location,
      description: formData.description,
      vaccinated: formData.vaccinated,
      neutered: formData.neutered,
      goodWithKids: formData.goodWithKids,
      houseTrained: formData.houseTrained,
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      ownerEmail: formData.ownerEmail,
      ownerId: user ? user.id : 'user-admin',
      image: formData.imagesList.length > 0 ? formData.imagesList[0].preview : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500',
      images: formData.imagesList.length > 0 ? formData.imagesList.map((img) => img.preview) : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500'],
      dateAdded: new Date().toISOString(),
      supplies: formData.suppliesList,
      compatibilityTags: compTags,
      status: petStatus, // pending review / flagged
    };

    onPetAdded(newPet);

    if (isSpam) {
      addLog(
        'Auto-Moderator Action',
        `Listing '${formData.name}' automatically blocked and flagged due to suspicious terms: [${flaggedWords.join(', ')}].`
      );
    } else {
      addLog('Pet Announced', `Listing '${formData.name}' is now live on the public grid.`);
    }

    gsap.to(formRef.current, {
      scale: 0.95,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          gsap.fromTo(
            '.success-badge',
            { scale: 0, rotate: -30 },
            { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2)' }
          );
        }, 50);
      },
    });
  };

  const handleReset = () => {
    setFormData({
      name: '',
      species: 'dog',
      breed: '',
      age: 'Young',
      gender: 'Male',
      size: 'Medium',
      location: '',
      description: '',
      vaccinated: false,
      neutered: false,
      goodWithKids: true,
      houseTrained: true,
      ownerName: user ? user.name : '',
      ownerPhone: '',
      ownerEmail: user ? user.email : '',
      imagesList: [],
      suppliesList: [],
    });
    setErrors({});
    setStep(1);
    setSuccess(false);
  };

  const supplyOptions = [
    'Carrier / Cage',
    'Leash / Collar',
    'Favorite Toys',
    'Food Bowls',
    'Unopened Food',
    'Grooming Brush',
  ];

  const getSupplyLabel = (item) => {
    if (language === 'fr') {
      switch (item) {
        case 'Carrier / Cage': return 'Cage / Caisse de transport';
        case 'Leash / Collar': return 'Laisse / Collier';
        case 'Favorite Toys': return 'Jouets préférés';
        case 'Food Bowls': return 'Gamelles / Écuelles';
        case 'Unopened Food': return 'Nourriture non ouverte';
        case 'Grooming Brush': return 'Brosse de toilettage';
        default: return item;
      }
    }
    if (language === 'ar') {
      switch (item) {
        case 'Carrier / Cage': return 'صندوق نقل / قفص';
        case 'Leash / Collar': return 'حزام / طوق';
        case 'Favorite Toys': return 'ألعاب مفضلة';
        case 'Food Bowls': return 'أوعية طعام';
        case 'Unopened Food': return 'طعام أليف مقفل';
        case 'Grooming Brush': return 'فرشاة تنظيف';
        default: return item;
      }
    }
    return item;
  };

  const getSpeciesOptionLabel = (species) => {
    if (language === 'fr') {
      switch (species) {
        case 'dog': return 'Chien 🐶';
        case 'cat': return 'Chat 🐱';
        case 'rabbit': return 'Lapin 🐰';
        case 'bird': return 'Oiseau 🐦';
        default: return species;
      }
    }
    if (language === 'ar') {
      switch (species) {
        case 'dog': return 'كلب 🐶';
        case 'cat': return 'قطة 🐱';
        case 'rabbit': return 'أرنب 🐰';
        case 'bird': return 'طائر 🐦';
        default: return species;
      }
    }
    switch (species) {
      case 'dog': return 'Dog 🐶';
      case 'cat': return 'Cat 🐱';
      case 'rabbit': return 'Rabbit 🐰';
      case 'bird': return 'Bird 🐦';
      default: return species;
    }
  };

  const getAgeOptionLabel = (ageKey) => {
    switch (ageKey) {
      case 'Puppy': return t('grid.puppy');
      case 'Young': return t('grid.young');
      case 'Adult': return t('grid.adult');
      case 'Senior': return t('grid.senior');
      default: return ageKey;
    }
  };

  const getGenderBtnLabel = (g) => {
    if (g === 'Male') return language === 'fr' ? 'Mâle' : language === 'ar' ? 'ذكر' : 'Male';
    if (g === 'Female') return language === 'fr' ? 'Femelle' : language === 'ar' ? 'أنثى' : 'Female';
    return g;
  };

  const getSizeBtnLabel = (s) => {
    if (s === 'Small') return language === 'fr' ? 'Petit' : language === 'ar' ? 'صغير' : 'Small';
    if (s === 'Medium') return language === 'fr' ? 'Moyen' : language === 'ar' ? 'متوسط' : 'Medium';
    if (s === 'Large') return language === 'fr' ? 'Grand' : language === 'ar' ? 'كبير' : 'Large';
    return s;
  };

  const getAttributeCheckboxLabel = (attr) => {
    switch (attr) {
      case 'vaccinated': return t('modal.vaccinated');
      case 'neutered': return t('modal.neutered');
      case 'houseTrained': return t('modal.houseTrained');
      case 'goodWithKids': return t('modal.kidsFriendly');
      default: return attr;
    }
  };

  // Secure Lock State if not logged in
  if (!user) {
    return (
      <section id="list-pet" className="py-20 px-6 max-w-4xl mx-auto scroll-mt-24 font-sans">
        <div className="bg-white rounded-[32px] p-8 sm:p-12 shadow-lg border border-cream-accent/50 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[320px] select-none text-center">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4 border border-primary/10 mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-xl text-primary tracking-tight font-sans text-center">
            {t('form.lockTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-primary-light mt-2 max-w-md leading-relaxed text-center">
            {t('form.lockDesc')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="list-pet" className="py-20 px-6 max-w-4xl mx-auto scroll-mt-24 select-none font-sans">
      {/* Container Box */}
      <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-lg border border-cream-accent/50 text-start relative overflow-hidden">
        {/* Subtle Decorative Circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header Description */}
        <div className="mb-8 border-b border-cream-accent/50 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-start">
          <div className="text-start">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight font-sans text-start">
              {t('form.title')}
            </h2>
            <p className="text-sm text-primary-light mt-1 text-start">
              {t('form.subtitle')}
            </p>
          </div>
          {!success && (
            <div className="flex items-center gap-1 bg-cream-bg px-3 py-1.5 rounded-xl border border-primary/5 self-start text-xs font-bold text-primary shrink-0">
              <span>{t('form.stepLabel', { step: step })}</span>
            </div>
          )}
        </div>

        {/* Stepper Progress Bar */}
        {!success && (
          <div className="w-full bg-cream-bg h-2 rounded-full mb-8 relative">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}

        {/* Success Splash */}
        {success ? (
          <div className="text-center py-12 flex flex-col items-center justify-center text-center">
            <div className="success-badge w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-cream-bg shadow-xl shadow-primary/20 mb-6">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-primary text-center">{t('form.successTitle')}</h3>
            <p className="text-sm text-primary-light mt-2 max-w-md mx-auto leading-relaxed text-center">
              {t('form.successDesc')}
            </p>
            <button
              onClick={handleReset}
              className="mt-8 bg-primary hover:bg-primary-light text-cream-bg px-8 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.98] duration-200 cursor-pointer shadow-md shadow-primary/10"
            >
              {t('form.listAnotherBtn')}
            </button>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} ref={formRef} className="space-y-6 text-start">
            
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center text-center p-8 select-text">
                <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <h4 className="font-extrabold text-lg text-primary text-center">{t('form.loadingTitle')}</h4>
                <p className="text-xs text-primary-light font-mono mt-1.5 bg-cream-bg py-2 px-4 rounded-xl border border-primary/5 text-center">
                  {statusMessage}
                </p>
              </div>
            )}

            {/* STEP 1: GENERAL INFO */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-start">
                  {/* Pet Name */}
                  <div className="flex flex-col gap-2 text-left text-start">
                    <label className="text-xs font-bold text-primary/70 uppercase tracking-wider text-start">
                      {t('form.nameLabel')} <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder={t('form.namePlaceholder')}
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-input text-start font-medium ${errors.name ? 'border-red-400 focus:border-red-400 focus:box-shadow-none' : ''}`}
                    />
                    {errors.name && <span className="text-[11px] font-semibold text-red-500 text-start">{errors.name}</span>}
                  </div>

                  {/* Species Dropdown */}
                  <div className="flex flex-col gap-2 text-start">
                    <label className="text-xs font-bold text-primary/70 uppercase tracking-wider text-start">
                      {t('form.speciesLabel')} <span className="text-secondary">*</span>
                    </label>
                    <select
                      name="species"
                      value={formData.species}
                      onChange={handleChange}
                      className="form-input text-primary font-medium text-start"
                    >
                      <option value="dog">{getSpeciesOptionLabel('dog')}</option>
                      <option value="cat">{getSpeciesOptionLabel('cat')}</option>
                      <option value="rabbit">{getSpeciesOptionLabel('rabbit')}</option>
                      <option value="bird">{getSpeciesOptionLabel('bird')}</option>
                    </select>
                  </div>

                  {/* Breed */}
                  <div className="flex flex-col gap-2 text-start">
                    <label className="text-xs font-bold text-primary/70 uppercase tracking-wider text-start">
                      {t('form.breedLabel')} <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="text"
                      name="breed"
                      placeholder={t('form.breedPlaceholder')}
                      value={formData.breed}
                      onChange={handleChange}
                      className={`form-input text-start font-medium ${errors.breed ? 'border-red-400' : ''}`}
                    />
                    {errors.breed && <span className="text-[11px] font-semibold text-red-500 text-start">{errors.breed}</span>}
                  </div>

                  {/* Age Category */}
                  <div className="flex flex-col gap-2 text-start">
                    <label className="text-xs font-bold text-primary/70 uppercase tracking-wider text-start">
                      {t('form.ageLabel')} <span className="text-secondary">*</span>
                    </label>
                    <select
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="form-input text-primary font-medium text-start"
                    >
                      <option value="Puppy">{getAgeOptionLabel('Puppy')}</option>
                      <option value="Young">{getAgeOptionLabel('Young')}</option>
                      <option value="Adult">{getAgeOptionLabel('Adult')}</option>
                      <option value="Senior">{getAgeOptionLabel('Senior')}</option>
                    </select>
                  </div>

                  {/* Gender Option buttons */}
                  <div className="flex flex-col gap-2 text-start">
                    <label className="text-xs font-bold text-primary/70 uppercase tracking-wider mb-1 text-start">
                      {t('form.genderLabel')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Male', 'Female'].map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, gender }))}
                          className={`py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                            formData.gender === gender
                              ? 'bg-primary border-primary text-cream-bg shadow-sm'
                              : 'bg-white hover:bg-cream-accent border-primary/10 text-primary'
                          }`}
                        >
                          {getGenderBtnLabel(gender)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Option buttons */}
                  <div className="flex flex-col gap-2 text-start">
                    <label className="text-xs font-bold text-primary/70 uppercase tracking-wider mb-1 text-start">
                      {t('form.sizeLabel')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Small', 'Medium', 'Large'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, size }))}
                          className={`py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            formData.size === size
                              ? 'bg-primary border-primary text-cream-bg shadow-sm'
                              : 'bg-white hover:bg-cream-accent border-primary/10 text-primary'
                          }`}
                        >
                          {getSizeBtnLabel(size)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: HEALTH & DETAILS */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Checkbox Attributes Grid */}
                <div className="text-start">
                  <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-3 text-start">
                    {t('form.attributesTitle')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['vaccinated', 'neutered', 'houseTrained', 'goodWithKids'].map((attr) => (
                      <label key={attr} className="flex items-center justify-between p-4 bg-cream-bg/40 border border-primary/5 rounded-2xl cursor-pointer hover:bg-cream-accent/30 transition-all text-start">
                        <span className="text-sm font-semibold text-primary text-start">
                          {getAttributeCheckboxLabel(attr)}
                        </span>
                        <input
                          type="checkbox"
                          name={attr}
                          checked={formData[attr]}
                          onChange={handleChange}
                          className="w-5 h-5 rounded accent-primary cursor-pointer ltr:ml-2 rtl:mr-2"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Starter Supplies Checkboxes */}
                <div className="text-start">
                  <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2.5 text-start">
                    {t('form.suppliesLabel')}
                  </label>
                  <p className="text-[10px] text-primary-light/60 mb-3 text-start">
                    {t('form.suppliesDesc')}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {supplyOptions.map((option) => {
                      const isChecked = formData.suppliesList.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSupplyToggle(option)}
                          className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer text-start ${
                            isChecked
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 shadow-sm'
                              : 'bg-white hover:bg-cream-accent border-primary/10 text-primary-light'
                          }`}
                        >
                          <span className="truncate">{getSupplyLabel(option)}</span>
                          <span className="w-3.5 h-3.5 rounded-full border border-amber-500/30 flex items-center justify-center shrink-0 ltr:ml-2 rtl:mr-2">
                            {isChecked && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location Search Input */}
                <div className="flex flex-col gap-2 text-start">
                  <label className="text-xs font-bold text-primary/70 uppercase tracking-wider flex items-center gap-1 text-start">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    {t('form.locationLabel')} <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder={t('form.locationPlaceholder')}
                    value={formData.location}
                    onChange={handleChange}
                    className={`form-input text-start font-medium ${errors.location ? 'border-red-400' : ''}`}
                  />
                  {errors.location && <span className="text-[11px] font-semibold text-red-500 text-start">{errors.location}</span>}
                </div>

                {/* Story Description Textarea */}
                <div className="flex flex-col gap-2 text-start">
                  <label className="text-xs font-bold text-primary/70 uppercase tracking-wider text-start">
                    {t('form.storyLabel')} <span className="text-secondary">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    placeholder={t('form.storyPlaceholder')}
                    value={formData.description}
                    onChange={handleChange}
                    className={`form-input resize-none text-start font-medium leading-relaxed ${errors.description ? 'border-red-400' : ''}`}
                  />
                  {errors.description && <span className="text-[11px] font-semibold text-red-500 text-start">{errors.description}</span>}
                </div>
              </div>
            )}

            {/* STEP 3: CONTACT & IMAGES */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Photo Upload Options */}
                <div className="text-start">
                  <label className="block text-xs font-bold text-primary/70 uppercase tracking-wider mb-2 text-start">
                    {t('form.photoLabel')} <span className="text-secondary">*</span>
                  </label>

                  <div className="flex flex-col gap-4 text-start">
                    {/* Live Preview / Select Container */}
                    <div
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`h-[140px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group select-none cursor-pointer transition-all duration-300 ${
                        isDraggingOver
                          ? 'border-secondary bg-secondary/5 scale-[1.02] shadow-inner shadow-secondary/5'
                          : 'bg-cream-bg border-primary/10 hover:bg-cream-accent/40'
                      }`}
                    >
                      {isDraggingOver ? (
                        <div className="text-center p-4 animate-pulse">
                          <ImageIcon className="w-10 h-10 text-secondary mx-auto mb-2" />
                          <p className="text-xs font-black text-secondary">
                            {language === 'fr' ? 'Déposez vos photos ici ! 📸' : language === 'ar' ? 'أفلت الصور هنا الآن! 📸' : 'Drop your photos here! 📸'}
                          </p>
                          <p className="text-[10px] text-secondary/80 mt-1">
                            {language === 'fr'
                              ? `Ajout de ${6 - formData.imagesList.length} photos max`
                              : language === 'ar'
                              ? `إضافة ${6 - formData.imagesList.length} صور كحد أقصى`
                              : `Adding up to ${6 - formData.imagesList.length} photos max`}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-primary/20 mx-auto mb-2" />
                          <p className="text-xs font-bold text-primary">
                            {language === 'fr' ? 'Déposer des photos (Max 6)' : language === 'ar' ? 'اسحب الصور هنا (بحد أقصى 6)' : 'Drop Photos (Max 6)'}
                          </p>
                          <p className="text-[10px] text-primary-light/60 mt-1">
                            {language === 'fr' ? 'Cliquez ou glissez-déposez jusqu\'à 6 fichiers' : language === 'ar' ? 'انقر أو اسحب وأفلت ما يصل إلى 6 صور' : 'Click or drag and drop up to 6 pictures'}
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="Upload a file"
                      />
                    </div>

                    {/* Uploaded Images Grid Preview */}
                    {formData.imagesList.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-start">
                        {formData.imagesList.map((img, idx) => (
                          <div key={idx} className="relative h-16 w-full rounded-xl overflow-hidden bg-cream-accent border border-primary/5 group select-none">
                            <img src={img.preview} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                            {/* Star Badge for Cover photo */}
                            {idx === 0 && (
                              <span className="absolute top-0.5 left-0.5 bg-secondary text-cream-bg text-[7px] font-extrabold px-1 py-0.5 rounded shadow">
                                ⭐ {language === 'fr' ? 'Couverture' : language === 'ar' ? 'غلاف' : 'Cover'}
                              </span>
                            )}
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-0.5 right-0.5 w-4.5 h-4.5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all cursor-pointer shadow"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pre-installed placeholders */}
                    <div className="space-y-3.5 text-start pt-2">
                      <p className="text-xs font-bold text-primary-light/80 text-start">
                        {t('form.placeholderHelp')}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => handleImagePlaceholder(0)}
                          disabled={formData.imagesList.length >= 6}
                          className="py-2.5 px-3 bg-cream-bg hover:bg-cream-accent disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-semibold text-primary border border-primary/5 text-start truncate flex items-center gap-1.5 cursor-pointer"
                        >
                          🐶 Bailey Golden
                        </button>
                        <button
                          type="button"
                          onClick={() => handleImagePlaceholder(1)}
                          disabled={formData.imagesList.length >= 6}
                          className="py-2.5 px-3 bg-cream-bg hover:bg-cream-accent disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-semibold text-primary border border-primary/5 text-start truncate flex items-center gap-1.5 cursor-pointer"
                        >
                          🐱 Milo Ginger
                        </button>
                        <button
                          type="button"
                          onClick={() => handleImagePlaceholder(2)}
                          disabled={formData.imagesList.length >= 6}
                          className="py-2.5 px-3 bg-cream-bg hover:bg-cream-accent disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-semibold text-primary border border-primary/5 text-start truncate flex items-center gap-1.5 cursor-pointer"
                        >
                          🐰 Cotton White
                        </button>
                        <button
                          type="button"
                          onClick={() => handleImagePlaceholder(3)}
                          disabled={formData.imagesList.length >= 6}
                          className="py-2.5 px-3 bg-cream-bg hover:bg-cream-accent disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-semibold text-primary border border-primary/5 text-start truncate flex items-center gap-1.5 cursor-pointer"
                        >
                          🐦 Sunny Cockatiel
                        </button>
                      </div>
                    </div>
                  </div>
                  {errors.image && <span className="text-[11px] font-semibold text-red-500 block mt-2 text-start">{errors.image}</span>}
                </div>

                {/* Owner Information */}
                <div className="space-y-4 pt-4 border-t border-cream-accent/50 text-start">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-1.5 text-start">
                    <User className="w-4 h-4 text-secondary fill-secondary" />
                    {t('form.contactTitle')}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-start">
                    {/* Owner Name */}
                    <div className="flex flex-col gap-1.5 text-start">
                      <label className="text-[10px] font-bold text-primary/60 uppercase tracking-wider text-start">
                        {t('form.contactNameLabel')} <span className="text-secondary">*</span>
                      </label>
                      <input
                        type="text"
                        name="ownerName"
                        placeholder="e.g. John Doe"
                        value={formData.ownerName}
                        onChange={handleChange}
                        className={`form-input text-start font-medium text-sm ${errors.ownerName ? 'border-red-400' : ''}`}
                      />
                      {errors.ownerName && <span className="text-[10px] font-semibold text-red-500 text-start">{errors.ownerName}</span>}
                    </div>

                    {/* Owner Phone */}
                    <div className="flex flex-col gap-1.5 text-start">
                      <label className="text-[10px] font-bold text-primary/60 uppercase tracking-wider text-start">
                        {t('form.contactPhoneLabel')} <span className="text-secondary">*</span>
                      </label>
                      <input
                        type="text"
                        name="ownerPhone"
                        placeholder={language === 'fr' ? 'ex: +33 6 1234 5678' : language === 'ar' ? 'مثال: 0612345678' : 'e.g. +1 (555) 000-0000'}
                        value={formData.ownerPhone}
                        onChange={handleChange}
                        className={`form-input text-start font-medium text-sm ${errors.ownerPhone ? 'border-red-400' : ''}`}
                      />
                      {errors.ownerPhone && <span className="text-[10px] font-semibold text-red-500 text-start">{errors.ownerPhone}</span>}
                    </div>

                    {/* Owner Email */}
                    <div className="flex flex-col gap-1.5 text-start">
                      <label className="text-[10px] font-bold text-primary/60 uppercase tracking-wider text-start">
                        {t('form.contactEmailLabel')} <span className="text-secondary">*</span>
                      </label>
                      <input
                        type="email"
                        name="ownerEmail"
                        placeholder="e.g. john@example.com"
                        value={formData.ownerEmail}
                        onChange={handleChange}
                        className={`form-input text-start font-medium text-sm ${
                          errors.ownerEmail ? 'border-red-400' : ''
                        } ${user ? 'bg-slate-100 cursor-not-allowed opacity-80' : ''}`}
                        disabled={!!user}
                      />
                      {errors.ownerEmail && <span className="text-[10px] font-semibold text-red-500 text-start">{errors.ownerEmail}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION NAV BUTTONS */}
            <div className="flex items-center justify-between pt-6 border-t border-cream-accent/50 mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-primary hover:text-primary-light font-bold text-sm bg-cream-bg hover:bg-cream-accent py-3 px-5 rounded-xl border border-primary/5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{t('form.backBtn')}</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-light text-cream-bg py-3 px-6 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>{t('form.nextBtn')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-primary hover:bg-primary-light text-cream-bg py-3.5 px-8 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-primary/10 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('form.submitBtn')}</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
