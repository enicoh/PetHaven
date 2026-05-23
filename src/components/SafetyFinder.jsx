import React, { useState } from 'react';
import { ShieldCheck, MapPin, ChevronDown, ChevronUp, FileText, CheckCircle2, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SafetyFinder() {
  const { language, t } = useLanguage();
  const [openAccordion, setOpenAccordion] = useState(null);

  const locations = [
    {
      id: 1,
      title: language === 'fr' ? "Clinique Vétérinaire Greenwood (Partenaire)" : language === 'ar' ? "عيادة Greenwood البيطرية (شريك)" : "Greenwood Veterinary Clinic (Partner)",
      type: language === 'fr' ? "Vétérinaire Partenaire Agréé" : language === 'ar' ? "شريك بيطري معتمد" : "Certified Vet Partner",
      desc: language === 'fr' ? "Notre clinique partenaire propose un espace de rencontre sécurisé dans son hall et un premier bilan de santé 100% gratuit pour les adoptions PetHaven (sur rendez-vous)." : language === 'ar' ? "توفر العيادة الشريكة منطقة لقاء آمنة في الردهة وفحصاً أولياً مجانياً 100% لعمليات التبني عبر الموقع (يتطلب حجز موعد مسبق)." : "Our partner clinic offers a secure lobby meetup area and a 100% free first wellness inspection for PetHaven exchanges (appointment required).",
      location: language === 'fr' ? "Seattle, WA" : language === 'ar' ? "سياتل، واشنطن" : "Seattle, WA",
      tag: language === 'fr' ? "Bilan Vétérinaire Offert" : language === 'ar' ? "فحص طبي مجاني" : "Free Vet Check",
      color: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20"
    },
    {
      id: 2,
      title: language === 'fr' ? "Espace Bibliothèque Municipale" : language === 'ar' ? "ردهة المكتبة العامة المركزية" : "Central Library Community Lounge",
      type: language === 'fr' ? "Zone Publique Surveillée" : language === 'ar' ? "منطقة عامة مراقبة" : "Public Monitored Zone",
      desc: language === 'fr' ? "Hall public équipé de caméras de sécurité et avec présence de personnel. Recommandé pour les adoptions en journée de chats ou petits animaux." : language === 'ar' ? "ردهة عامة مراقبة بالكاميرات الأمنية مع تواجد موظفي المكتبة. موصى بها لتسليم القطط والحيوانات الصغيرة خلال النهار." : "Public lobby lounge with secure camera monitoring and helpful staff nearby. Recommended for daytime cat/small-pet exchanges.",
      location: language === 'fr' ? "Portland, OR" : language === 'ar' ? "بورتلاند، أوريغون" : "Portland, OR",
      tag: language === 'fr' ? "Vidéoprotection active" : language === 'ar' ? "مراقبة بالكاميرات" : "Camera Monitored",
      color: "bg-blue-500/10 text-blue-800 border-blue-500/20"
    },
    {
      id: 3,
      title: language === 'fr' ? "Place Municipale Sécurisée Mission" : language === 'ar' ? "الساحة العامة الآمنة Mission" : "Mission Municipal Safe Square",
      type: language === 'fr' ? "Zone d'Échange Municipale" : language === 'ar' ? "منطقة تسليم بلدية" : "Municipal Exchange Zone",
      desc: language === 'fr' ? "Place publique bien éclairée, surveillée par des caméras. Emplacement central idéal en journée pour la remise en main propre de chiens." : language === 'ar' ? "ساحة عامة مضاءة جيداً ومراقبة مباشرة بالكاميرات الأمنية. موقع مركزي ممتاز لتسليم الكلاب خلال النهار." : "Well-lit public town square directly monitored by safety cameras. Excellent daytime central location for dog handovers.",
      location: language === 'fr' ? "San Francisco, CA" : language === 'ar' ? "سان فرانسيسكو، كاليفورنيا" : "San Francisco, CA",
      tag: language === 'fr' ? "Sécurité 24h/24" : language === 'ar' ? "أمن على مدار الساعة" : "24/7 Security",
      color: "bg-purple-500/10 text-purple-800 border-purple-500/20"
    }
  ];

  const safetySteps = [
    {
      title: language === 'fr' ? "1. Le contrôle vétérinaire (Santé d'abord)" : language === 'ar' ? "1. الفحص البيطري (الصحة أولاً)" : "1. The Vet Checkup (Health First)",
      desc: language === 'fr' ? "Dans la mesure du possible, planifiez votre rencontre finale chez un vétérinaire. Faites réaliser un examen de santé de base pour vérifier le poids, l'état de la peau et le rythme cardiaque avant l'adoption finale." : language === 'ar' ? "كلما أمكن، حدد موعد المقابلة النهائية في عيادة بيطرية. اطلب إجراء فحص صحي أساسي للتحقق من الوزن وحالة الجلد ومعدل ضربات القلب قبل إتمام التبني." : "Whenever possible, schedule your final meetup at a veterinary office. Have a basic health screening performed to verify weight, skin conditions, and heart rate before final rehoming."
    },
    {
      title: language === 'fr' ? "2. Vérifier le carnet de santé et de vaccination" : language === 'ar' ? "2. التحقق من السجل الطبي والتطعيمات" : "2. Verify Medical & Vaccine Records",
      desc: language === 'fr' ? "Demandez au donneur d'apporter le carnet de vaccination d'origine. Vérifiez les tampons, signatures et dates correspondant à la rage et aux autres vaccins obligatoires." : language === 'ar' ? "اطلب من المالك إحضار دفتر التطعيمات البيطري الأصلي. تحقق من الأختام والتوقيعات والتواريخ المطابقة لداء الكلب والتطعيمات الأساسية للأليف." : "Ask the owner to bring the original veterinary vaccination card. Check for stamps, signed signatures, and dates matching rabies and core combination shots (DHPP for dogs, FVRCP for cats)."
    },
    {
      title: language === 'fr' ? "3. Comportement & Bilan de confiance" : language === 'ar' ? "3. التحقق من سلوك وراحة الحيوان" : "3. Behavior & Comfort Check",
      desc: language === 'fr' ? "Asseyez-vous sur le sol et laissez l'animal s'approcher de vous naturellement. Apportez une couverture ou des friandises. Ne pressez jamais l'animal. Vérifiez qu'il ne montre pas de signes d'agressivité ou d'anxiété." : language === 'ar' ? "اجلس على الأرض ودع الحيوان يقترب منك بشكل طبيعي. أحضر بطانية أو بعض المكافآت. لا تستعجل الحيوان أبداً. تأكد من خلوه من العدوانية أو القلق المفرط." : "Sit on the floor and let the animal approach you naturally. Bring a blanket or treats. Never rush the animal. Verify if they show aggression, high anxiety, or ease around you."
    },
    {
      title: language === 'fr' ? "4. Règle absolue de gratuité" : language === 'ar' ? "4. تطبيق مبدأ المجانية التامة والصارمة" : "4. Strict Zero-Fee Enforcement",
      desc: language === 'fr' ? "Ne payez jamais de frais d'adoption, d'acompte de transport ou de frais de dossier. Aucun échange d'argent n'est autorisé. Si l'annonceur vous demande ne serait-ce qu'un euro, signalez-le immédiatement à khelifatihocinemahmoud@gmail.com." : language === 'ar' ? "لا تدفع أبداً أي رسوم تبني، أو عربون نقل، أو رسوم تقديم. لا يُسمح بأي أموال تحت أي ظرف من الظروف. إذا طلب صاحب الإعلان ولو مبلغاً بسيطاً، يرجى التبليغ عنه فوراً لـ khelifatihocinemahmoud@gmail.com." : "Never pay a rehoming fee, transport deposit, or application charge. Zero money is allowed under any circumstances. If the lister requests even a tiny fee, report them to khelifatihocinemahmoud@gmail.com immediately."
    }
  ];

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto border-t border-cream-accent/50 scroll-mt-24 text-left font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Mock Locations List */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-start">
          <div className="text-start">
            <div className="inline-flex items-center gap-1 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold border border-secondary/20 mb-3">
              <MapPin className="w-3.5 h-3.5 fill-current" />
              <span>{t('safety.badge')}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-primary tracking-tight font-sans leading-tight text-start">
              {t('safety.title')}
            </h2>
            <p className="text-sm text-primary-light mt-2 max-w-lg leading-relaxed text-start">
              {t('safety.subtitle')}
            </p>
          </div>

          <div className="space-y-4 text-start">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white rounded-2xl p-5 border border-cream-accent/50 hover:border-primary/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all text-start"
              >
                <div className="max-w-md text-start">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5 text-start">
                    <span className="text-[10px] font-semibold text-primary-light/60 uppercase tracking-wider text-start">
                      {loc.type}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${loc.color}`}>
                      {loc.tag}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-primary tracking-tight text-start">
                    {loc.title}
                  </h4>
                  <p className="text-xs text-primary-light/80 mt-1 leading-relaxed text-start">
                    {loc.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-primary shrink-0 bg-cream-bg/40 border border-primary/5 py-2 px-3.5 rounded-xl ltr:ml-2 rtl:mr-2">
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                  <span>{loc.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Accordion Safety checklist */}
        <div className="lg:col-span-6 flex flex-col gap-6 bg-white rounded-3xl p-6 sm:p-8 border border-cream-accent/50 shadow-sm text-start">
          <div className="flex items-center gap-3 border-b border-cream-accent/50 pb-4 mb-2 text-start">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-start">
              <h3 className="font-extrabold text-lg text-primary tracking-tight text-start">
                {t('safety.checklistTitle')}
              </h3>
              <p className="text-xs text-primary-light/60 text-start">
                {t('safety.checklistSubtitle')}
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-start">
            {safetySteps.map((step, index) => (
              <div
                key={index}
                className="border border-cream-accent/50 rounded-2xl overflow-hidden bg-cream-bg/10 text-start"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-4 font-bold text-sm text-primary hover:bg-cream-accent/30 transition-all text-start cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 text-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {step.title}
                  </span>
                  {openAccordion === index ? (
                    <ChevronUp className="w-4 h-4 text-primary-light" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-primary-light" />
                  )}
                </button>
                {openAccordion === index && (
                  <div className="p-4 bg-white border-t border-cream-accent/50 text-xs sm:text-sm text-primary-light/90 leading-relaxed animate-slide-down text-start">
                    {step.desc}
                    {index === 3 && (
                      <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl font-bold flex items-center gap-2 text-start">
                        <Heart className="w-4 h-4 fill-current text-red-500 animate-pulse shrink-0" />
                        <span>{t('safety.adoptionFreeWarn')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
