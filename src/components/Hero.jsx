import React, { useEffect, useRef, useState } from 'react';
import { Heart, ArrowRight, ShieldCheck, Smile, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import gsap from 'gsap';

export default function Hero({ onAdoptClick, onAnnounceClick }) {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  // Swipeable Premium Card Deck State
  const [deck, setDeck] = useState([
    {
      id: 1,
      name: 'Bailey',
      breed: 'Golden Mix',
      species: 'Puppy',
      location: 'Seattle, WA',
      image: '/assets/dog_puppy.png',
      badgeClass: 'bg-secondary',
      tag: 'Puppy'
    },
    {
      id: 2,
      name: 'Milo',
      breed: 'Ginger Tabby',
      species: 'Kitten',
      location: 'Portland, OR',
      image: '/assets/ginger_kitten.png',
      badgeClass: 'bg-primary',
      tag: 'Kitten'
    },
    {
      id: 3,
      name: 'Cotton',
      breed: 'White Rabbit',
      species: 'Rabbit',
      location: 'San Francisco, CA',
      image: '/assets/white_bunny.png',
      badgeClass: 'bg-emerald-600',
      tag: 'Rabbit'
    },
    {
      id: 4,
      name: 'Sunny',
      breed: 'Cockatiel',
      species: 'Bird',
      location: 'Los Angeles, CA',
      image: '/assets/parakeet_bird.png',
      badgeClass: 'bg-purple-600',
      tag: 'Bird'
    }
  ]);

  // Initial resting state offsets to match fanned-out preview aesthetics perfectly
  const restX = -12;
  const restY = -8;
  const restRot = -3;

  const [dragStart, setDragStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs to control elements directly in DOM to prevent React re-render lags
  const topCardRef = useRef(null);
  const middleCardRef = useRef(null);
  const bottomCardRef = useRef(null);
  const dragOffsetRef = useRef({ x: restX, y: restY });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered text animations in the left panel
      gsap.fromTo(
        leftRef.current.children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.4
        }
      );

      // Deck loading spring animation
      gsap.fromTo(
        rightRef.current,
        { scale: 0.8, opacity: 0, rotate: 10 },
        { scale: 1, opacity: 1, rotate: 0, duration: 1.2, ease: 'elastic.out(1, 0.75)', delay: 0.8 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Pointer dragging handlers
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    // Track cursor relative to mutable ref offsets
    setDragStart({
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Save current offset in mutable ref
    dragOffsetRef.current = { x: dx, y: dy };

    const dragDist = Math.abs(dx - restX);
    const progress = Math.min(1, dragDist / 120);

    // 1. Move top card (hardware accelerated direct DOM update)
    if (topCardRef.current) {
      gsap.set(topCardRef.current, {
        x: dx,
        y: dy,
        rotation: (dx - restX) / 12,
      });
    }

    // 2. Morph middle card (hardware accelerated direct DOM update)
    if (middleCardRef.current) {
      const scale = 0.98 + progress * 0.02;
      const rotation = 3 - progress * 6; // goes from +3° to -3° (next resting rotation)
      const tx = 12 - progress * 24;     // goes from +12px to -12px (next resting X)
      const ty = 8 - progress * 16;      // goes from +8px to -8px (next resting Y)
      gsap.set(middleCardRef.current, {
        scale: scale,
        rotation: rotation,
        x: tx,
        y: ty,
      });
    }

    // 3. Morph bottom card (hardware accelerated direct DOM update)
    if (bottomCardRef.current) {
      const scale = 0.96 + progress * 0.02; // goes from 0.96 to 0.98
      const rotation = 9 - progress * 6;     // goes from +9° to +3° (middle resting rotation)
      const tx = 36 - progress * 24;        // goes from +36px to +12px
      const ty = 24 - progress * 16;        // goes from +24px to +8px
      gsap.set(bottomCardRef.current, {
        scale: scale,
        rotation: rotation,
        x: tx,
        y: ty,
      });
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const threshold = 120;
    const dx = dragOffsetRef.current.x - restX;
    const dy = dragOffsetRef.current.y - restY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX > threshold || absY > threshold) {
      // Toss Card Away!
      const flyX = dx > 0 ? window.innerWidth : -window.innerWidth;
      const flyY = dy * 2; // maintain slope

      gsap.to(topCardRef.current, {
        x: flyX,
        y: flyY,
        rotation: dx / 5,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => {
          // Push top card to the bottom of the stack (React state updates once here)
          setDeck((prev) => {
            const nextDeck = [...prev];
            const topItem = nextDeck.shift();
            nextDeck.push(topItem);
            return nextDeck;
          });
          // Reset offsets and hardware state immediately
          dragOffsetRef.current = { x: restX, y: restY };
          gsap.set(topCardRef.current, { x: restX, y: restY, rotation: restRot, opacity: 1 });
          gsap.set(middleCardRef.current, { scale: 0.98, rotation: 3, x: 12, y: 8 });
          gsap.set(bottomCardRef.current, { scale: 0.96, rotation: 9, x: 36, y: 24 });
        }
      });
    } else {
      // Snap Back all cards synchronously with a bouncy spring
      gsap.to(topCardRef.current, {
        x: restX,
        y: restY,
        rotation: restRot,
        duration: 0.6,
        ease: 'elastic.out(1, 0.65)'
      });
      gsap.to(middleCardRef.current, {
        scale: 0.98,
        rotation: 3,
        x: 12,
        y: 8,
        duration: 0.6,
        ease: 'elastic.out(1, 0.65)'
      });
      gsap.to(bottomCardRef.current, {
        scale: 0.96,
        rotation: 9,
        x: 36,
        y: 24,
        duration: 0.6,
        ease: 'elastic.out(1, 0.65)',
        onComplete: () => {
          dragOffsetRef.current = { x: restX, y: restY };
        }
      });
    }
    setDragStart(null);
  };

  // Render cards from bottom to top
  const visibleDeck = deck.slice(0, 3).reverse();

  return (
    <section
      ref={containerRef}
      className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden min-h-[90vh] flex items-center font-sans"
    >
      {/* Decorative background grid and gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
        {/* Left Side: Copy and CTAs */}
        <div ref={leftRef} className="lg:col-span-7 flex flex-col gap-6 text-start">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full w-fit border border-secondary/20">
            <Heart className="w-4 h-4 text-secondary fill-secondary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              {t('hero.badge')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-[1.1] font-sans text-start">
            {t('hero.title')}{' '}
            <span className="relative inline-block text-secondary">
              {t('hero.titleHighlight')}
              <span className="absolute bottom-1.5 left-0 w-full h-[6px] bg-secondary/15 -z-10 rounded-full"></span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-primary-light max-w-xl leading-relaxed text-start">
            {t('hero.subtitle')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onAdoptClick}
              className="flex items-center gap-2 bg-primary hover:bg-primary-light text-cream-bg px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.98] duration-250 shadow-lg shadow-primary/15 cursor-pointer"
            >
              <span>{t('hero.meetAnimals')}</span>
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
            <button
              onClick={onAnnounceClick}
              className="flex items-center gap-2 bg-cream-card hover:bg-cream-accent text-primary px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.98] duration-250 border border-primary/10 shadow-sm cursor-pointer"
            >
              <span>{t('hero.giveAnimal')}</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 pt-6 border-t border-cream-accent">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-start">
                <h4 className="font-semibold text-sm text-primary">{t('hero.freeTitle')}</h4>
                <p className="text-xs text-primary-light/80 mt-0.5">{t('hero.freeDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <Smile className="w-5 h-5" />
              </div>
              <div className="text-start">
                <h4 className="font-semibold text-sm text-primary">{t('hero.meetTitle')}</h4>
                <p className="text-xs text-primary-light/80 mt-0.5">{t('hero.meetDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-start">
                <h4 className="font-semibold text-sm text-primary">{t('hero.transTitle')}</h4>
                <p className="text-xs text-primary-light/80 mt-0.5">{t('hero.transDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Drag & Swipeable Cards Stack */}
        <div
          ref={rightRef}
          className="lg:col-span-5 relative h-[380px] sm:h-[480px] flex items-center justify-center lg:justify-end mt-10 lg:mt-0 select-none"
        >
          {/* Card Deck Wrapper */}
          <div className="relative w-[250px] sm:w-[280px] h-[310px] sm:h-[350px]">
            {visibleDeck.map((card, idx) => {
              // Real index relative to active deck list (top is 0)
              const realIdx = 2 - idx; 

              if (realIdx === 0) {
                // TOP CARD (Draggable & Swappable)
                return (
                  <div
                    key={card.id}
                    ref={topCardRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{
                      zIndex: 30,
                      touchAction: 'none',
                      transform: `translate3d(${restX}px, ${restY}px, 0px) rotate(${restRot}deg)`
                    }}
                    className={`absolute inset-0 bg-white rounded-3xl p-4 shadow-xl border border-cream-accent/50 select-none flex flex-col justify-between transition-shadow duration-300 ${
                      isDragging ? 'cursor-grabbing shadow-2xl' : 'cursor-grab'
                    }`}
                  >
                    <div className="w-full h-[180px] sm:h-[220px] rounded-2xl overflow-hidden relative select-none">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-cover pointer-events-none select-none"
                        draggable="false"
                      />
                      <span className={`absolute top-3 left-3 ${card.badgeClass} text-cream-bg text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                        {card.tag}
                      </span>
                      <span className="absolute bottom-3 right-3 bg-primary text-cream-bg text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md opacity-85">
                        {t('card.freeAdoption')}
                      </span>
                    </div>

                    <div className="pt-3 text-start flex flex-col gap-0.5 select-none pointer-events-none">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-lg text-primary">{card.name}</h3>
                        <span className="text-xs text-primary-light/80 font-semibold">{card.breed}</span>
                      </div>
                      <p className="text-[10px] text-primary-light/60 flex items-center gap-0.5">
                        📍 {card.location}
                      </p>
                    </div>
                  </div>
                );
              }

              if (realIdx === 1) {
                // MIDDLE CARD (Peeks out to the bottom-right, transitions to center on swiping)
                return (
                  <div
                    key={card.id}
                    ref={middleCardRef}
                    style={{
                      zIndex: 20,
                      transform: `scale(0.98) rotate(3deg) translate3d(12px, 8px, 0px)`
                    }}
                    className="absolute inset-0 bg-white rounded-3xl p-4 shadow-lg border border-cream-accent/40 select-none pointer-events-none transition-shadow flex flex-col justify-between"
                  >
                    <div className="w-full h-[180px] sm:h-[220px] rounded-2xl overflow-hidden relative">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-cover opacity-90 select-none"
                        draggable="false"
                      />
                    </div>
                    <div className="pt-3 text-start flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-lg text-primary">{card.name}</h3>
                        <span className="text-xs text-primary-light/80 font-semibold">{card.breed}</span>
                      </div>
                      <p className="text-[10px] text-primary-light/60">📍 {card.location}</p>
                    </div>
                  </div>
                );
              }

              if (realIdx === 2) {
                // BOTTOM CARD (Peeks out further to the bottom-right, transitions to middle slot on swiping)
                return (
                  <div
                    key={card.id}
                    ref={bottomCardRef}
                    style={{
                      zIndex: 10,
                      transform: `scale(0.96) rotate(9deg) translate3d(36px, 24px, 0px)`
                    }}
                    className="absolute inset-0 bg-white rounded-3xl p-4 shadow-md border border-cream-accent/40 select-none pointer-events-none flex flex-col justify-between"
                  >
                    <div className="w-full h-[180px] sm:h-[220px] rounded-2xl overflow-hidden relative">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-cover opacity-80 select-none"
                        draggable="false"
                      />
                    </div>
                    <div className="pt-3 text-start flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-lg text-primary">{card.name}</h3>
                        <span className="text-xs text-primary-light/80 font-semibold">{card.breed}</span>
                      </div>
                      <p className="text-[10px] text-primary-light/60">📍 {card.location}</p>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
