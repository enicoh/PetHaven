import React, { useState, useRef } from 'react';
import { HelpCircle, ChevronRight, RotateCcw, Sparkles, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import gsap from 'gsap';

export default function MatchmakerQuiz({ pets, onQuizComplete, onQuizReset }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(1);
  const [answers, setFormData] = useState({
    space: 'apartment',
    activity: 'medium',
    aloneTime: 'medium',
    kids: false,
  });

  const quizBoxRef = useRef(null);

  const startQuiz = () => {
    setActive(true);
    setStep(1);
    gsap.fromTo(
      quizBoxRef.current,
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  };

  const handleSelect = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      // Calculate compatibilities!
      const matchMap = {};

      pets.forEach((pet) => {
        let score = 70; // baseline

        const tags = pet.compatibilityTags;
        if (!tags) {
          matchMap[pet.id] = 85; // default fallback
          return;
        }

        // 1. Space
        if (answers.space === tags.space) {
          score += 10;
        } else if (answers.space === 'apartment' && tags.space === 'yard') {
          score -= 15; // dogs needing yard are penalized in apartments
        }

        // 2. Activity
        if (answers.activity === tags.activity) {
          score += 10;
        } else {
          // slight mismatch
          score += 5;
        }

        // 3. Alone Time
        if (answers.aloneTime === tags.aloneTime) {
          score += 10;
        } else if (answers.aloneTime === 'long' && tags.aloneTime === 'short') {
          score -= 20; // animal needing constant presence penalized for long alone times
        }

        // 4. Kids
        if (answers.kids) {
          if (tags.kids) {
            score += 10;
          } else {
            score -= 25; // pets not good with kids heavily penalized
          }
        } else {
          score += 10; // quiet homes are generally fine for all pets
        }

        // Bound between 40% and 98%
        matchMap[pet.id] = Math.max(40, Math.min(98, score));
      });

      onQuizComplete(matchMap);
      setStep(5); // completion step
    }
  };

  const handleReset = () => {
    setFormData({
      space: 'apartment',
      activity: 'medium',
      aloneTime: 'medium',
      kids: false,
    });
    setStep(1);
    setActive(false);
    onQuizReset();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 mb-12 scroll-mt-24 font-sans" id="matchmaker-section">
      {!active ? (
        /* Static Callout State */
        <div className="bg-gradient-to-r from-primary to-primary-light text-cream-bg rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-primary/10 border border-primary-light/20 relative overflow-hidden text-start">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="text-start max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-secondary text-cream-bg text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 shadow-sm shadow-secondary/15">
              <Sparkles className="w-3 h-3 fill-current" />
              {t('quiz.staticBadge')}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold font-sans tracking-tight text-start">
              {t('quiz.staticTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-cream-accent/80 mt-1.5 leading-relaxed text-start">
              {t('quiz.staticDesc')}
            </p>
          </div>
          <button
            onClick={startQuiz}
            className="bg-secondary hover:bg-secondary-dark text-cream-bg px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.98] duration-200 cursor-pointer shadow-md shadow-secondary/15 shrink-0"
          >
            {t('quiz.startBtn')}
          </button>
        </div>
      ) : (
        /* Active Quiz Stepper Container */
        <div
          ref={quizBoxRef}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-cream-accent/50 text-start relative overflow-hidden"
        >
          {/* Subtle logo */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary/5 rounded-full blur-xl pointer-events-none" />

          {/* Stepper Headers */}
          <div className="flex items-center justify-between border-b border-cream-accent/50 pb-4 mb-6">
            <h3 className="font-extrabold text-lg text-primary tracking-tight font-sans flex items-center gap-1.5 text-start">
              <HelpCircle className="w-5 h-5 text-secondary animate-pulse" />
              {t('quiz.title')}
            </h3>
            {step < 5 && (
              <span className="text-xs font-bold bg-primary/5 text-primary px-3 py-1 rounded-lg">
                {t('quiz.questionLabel', { step: step })}
              </span>
            )}
          </div>

          {/* Stepper Progress bar */}
          {step < 5 && (
            <div className="w-full bg-cream-bg h-1.5 rounded-full mb-6">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          )}

          {/* STEP 1: SPACE */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-primary mb-3 text-start">{t('quiz.q1')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSelect('space', 'apartment')}
                  className={`p-5 rounded-2xl border text-start flex items-start gap-4 transition-all cursor-pointer ${
                    answers.space === 'apartment'
                      ? 'bg-primary/5 border-primary text-primary shadow-sm'
                      : 'bg-white hover:bg-cream-accent border-primary/10 text-primary-light'
                  }`}
                >
                  <span className="text-2xl mt-0.5 select-none">🏢</span>
                  <div className="text-start">
                    <h5 className="font-bold text-sm text-primary">{t('quiz.apartmentTitle')}</h5>
                    <p className="text-xs text-primary-light/80 mt-0.5 leading-relaxed">{t('quiz.apartmentDesc')}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect('space', 'yard')}
                  className={`p-5 rounded-2xl border text-start flex items-start gap-4 transition-all cursor-pointer ${
                    answers.space === 'yard'
                      ? 'bg-primary/5 border-primary text-primary shadow-sm'
                      : 'bg-white hover:bg-cream-accent border-primary/10 text-primary-light'
                  }`}
                >
                  <span className="text-2xl mt-0.5 select-none">🏡</span>
                  <div className="text-start">
                    <h5 className="font-bold text-sm text-primary">{t('quiz.yardTitle')}</h5>
                    <p className="text-xs text-primary-light/80 mt-0.5 leading-relaxed">{t('quiz.yardDesc')}</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ENERGY */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-primary mb-3 text-start">{t('quiz.q2')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'low', label: t('quiz.actLow'), icon: '🛋️', desc: t('quiz.actLowDesc') },
                  { id: 'medium', label: t('quiz.actMed'), icon: '🌳', desc: t('quiz.actMedDesc') },
                  { id: 'high', label: t('quiz.actHigh'), icon: '🏃', desc: t('quiz.actHighDesc') }
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => handleSelect('activity', act.id)}
                    className={`p-5 rounded-2xl border text-start flex flex-col gap-2 transition-all cursor-pointer ${
                      answers.activity === act.id
                        ? 'bg-primary/5 border-primary text-primary shadow-sm'
                        : 'bg-white hover:bg-cream-accent border-primary/10 text-primary-light'
                    }`}
                  >
                    <span className="text-2xl select-none">{act.icon}</span>
                    <h5 className="font-bold text-sm text-primary mt-1 text-start">{act.label}</h5>
                    <p className="text-xs text-primary-light/80 leading-relaxed text-start">{act.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: ALONE TIME */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-primary mb-3 text-start">{t('quiz.q3')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'short', label: t('quiz.aloneShort'), icon: '🏠', desc: t('quiz.aloneShortDesc') },
                  { id: 'medium', label: t('quiz.aloneMed'), icon: '💼', desc: t('quiz.aloneMedDesc') },
                  { id: 'long', label: t('quiz.aloneLong'), icon: '🌇', desc: t('quiz.aloneLongDesc') }
                ].map((alone) => (
                  <button
                    key={alone.id}
                    type="button"
                    onClick={() => handleSelect('aloneTime', alone.id)}
                    className={`p-5 rounded-2xl border text-start flex flex-col gap-2 transition-all cursor-pointer ${
                      answers.aloneTime === alone.id
                        ? 'bg-primary/5 border-primary text-primary shadow-sm'
                        : 'bg-white hover:bg-cream-accent border-primary/10 text-primary-light'
                    }`}
                  >
                    <span className="text-2xl select-none">{alone.icon}</span>
                    <h5 className="font-bold text-sm text-primary mt-1 text-start">{alone.label}</h5>
                    <p className="text-xs text-primary-light/80 leading-relaxed text-start">{alone.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: KIDS */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-primary mb-3 text-start">{t('quiz.q4')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSelect('kids', true)}
                  className={`p-5 rounded-2xl border text-start flex items-start gap-4 transition-all cursor-pointer ${
                    answers.kids === true
                      ? 'bg-primary/5 border-primary text-primary shadow-sm'
                      : 'bg-white hover:bg-cream-accent border-primary/10 text-primary-light'
                  }`}
                >
                  <span className="text-2xl mt-0.5 select-none">🧒</span>
                  <div className="text-start">
                    <h5 className="font-bold text-sm text-primary">{t('quiz.kidsYes')}</h5>
                    <p className="text-xs text-primary-light/80 mt-0.5 leading-relaxed">{t('quiz.kidsYesDesc')}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect('kids', false)}
                  className={`p-5 rounded-2xl border text-start flex items-start gap-4 transition-all cursor-pointer ${
                    answers.kids === false
                      ? 'bg-primary/5 border-primary text-primary shadow-sm'
                      : 'bg-white hover:bg-cream-accent border-primary/10 text-primary-light'
                  }`}
                >
                  <span className="text-2xl mt-0.5 select-none">🧑</span>
                  <div className="text-start">
                    <h5 className="font-bold text-sm text-primary">{t('quiz.kidsNo')}</h5>
                    <p className="text-xs text-primary-light/80 mt-0.5 leading-relaxed">{t('quiz.kidsNoDesc')}</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS & SCORE TRIGGER */}
          {step === 5 && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-cream-bg mx-auto mb-4 animate-bounce">
                <Sparkles className="w-6 h-6 fill-current" />
              </div>
              <h4 className="font-extrabold text-xl text-primary">{t('quiz.calculating')}</h4>
              <p className="text-sm text-primary-light mt-1.5 max-w-md mx-auto leading-relaxed">
                {t('quiz.calcDesc')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => {
                    const grid = document.getElementById('adopt');
                    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-primary hover:bg-primary-light text-cream-bg py-3 px-6 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{t('quiz.seeBelow')}</span>
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </button>
                <button
                  onClick={handleReset}
                  className="bg-cream-bg hover:bg-cream-accent border border-primary/5 text-primary py-3 px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('quiz.reset')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Footer for Quiz Steps */}
          {step < 5 && (
            <div className="flex items-center justify-end pt-5 border-t border-cream-accent/50 mt-6">
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-light text-cream-bg py-3 px-6 rounded-xl font-bold text-xs transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                <span>{step === 4 ? t('quiz.calcBtn') : t('quiz.next')}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
