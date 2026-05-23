import React from 'react';
import { Quote, Heart, MapPin, Smile } from 'lucide-react';
import { successStories } from '../data/successStories';
import { useLanguage } from '../context/LanguageContext';

export default function SuccessGallery() {
  const { language, t } = useLanguage();

  const getStories = () => {
    if (language === 'fr') {
      return [
        {
          id: 1,
          petName: "Luna",
          family: "La Famille Martin",
          story: "Luna est la meilleure chose qui nous soit arrivée cette année ! Trouver un compagnon gratuitement grâce à une communauté bienveillante nous a permis d'investir pleinement dans son confort.",
          location: "Paris, FR",
          dateAdopted: "il y a 2 mois",
          image: "/assets/happy_dog.png"
        },
        {
          id: 2,
          petName: "Oliver",
          family: "Les Dupuis",
          story: "Oliver s'est adapté à notre appartement dès le premier jour. Nous avons rencontré son ancienne propriétaire dans une clinique vétérinaire partenaire, l'échange a été d'une fluidité et d'une sécurité exemplaires !",
          location: "Lyon, FR",
          dateAdopted: "il y a 3 semaines",
          image: "/assets/happy_cat.png"
        },
        {
          id: 3,
          petName: "Pip",
          family: "Sarah & Thomas",
          story: "Pip est d'une gaieté communicative ! Le donneur nous a également offert sa caisse de transport et ses jouets préférés sans demander un seul centime. Nous recommandons vivement PetHaven.",
          location: "Marseille, FR",
          dateAdopted: "le mois dernier",
          image: "/assets/happy_bird.png"
        }
      ];
    }
    if (language === 'ar') {
      return [
        {
          id: 1,
          petName: "لونا",
          family: "عائلة سليم",
          story: "لونا هي أفضل شيء حدث لنا هذا العام! العثور على أليف مجاناً عبر مجتمع مبني على اللطف سمح لنا بتركيز كل ميزانيتنا على راحتها وتدليلها.",
          location: "الجزائر العاصمة",
          dateAdopted: "منذ شهرين",
          image: "/assets/happy_dog.png"
        },
        {
          id: 2,
          petName: "أوليفر",
          family: "عائلة كريم",
          story: "تأقلم أوليفر مع شقتنا منذ اليوم الأول. التقينا بمالكته السابقة في عيادة بيطرية شريكة وآمنة، وكان اللقاء في غاية السلاسة واللطف والاطمئنان!",
          location: "وهران",
          dateAdopted: "منذ 3 أسابيع",
          image: "/assets/happy_cat.png"
        },
        {
          id: 3,
          petName: "بيب",
          family: "سارة وخالد",
          story: "بيب يملأ بيتنا بالبهجة والتغريد! قدم لنا صاحب الطائر الأصلي قفصه وألعابه المفضلة مجاناً بالكامل دون قبول أي مبلغ. منصة رائعة وأنصح بها بشدة.",
          location: "قسنطينة",
          dateAdopted: "الشهر الماضي",
          image: "/assets/happy_bird.png"
        }
      ];
    }
    return successStories;
  };

  return (
    <section id="about" className="py-20 px-6 max-w-7xl mx-auto border-t border-cream-accent/50 scroll-mt-24 font-sans">
      {/* Title block */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 mb-3 mx-auto">
          <Smile className="w-3.5 h-3.5 fill-current" />
          <span>{t('success.badge')}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary leading-tight font-sans text-center">
          {t('success.title')}
        </h2>
        <p className="text-primary-light mt-3 text-center">
          {t('success.subtitle')}
        </p>
      </div>

      {/* Grid of Stories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {getStories().map((story) => (
          <div
            key={story.id}
            className="group bg-white rounded-[32px] border border-cream-accent/50 hover:border-primary/10 transition-all duration-300 hover:shadow-xl flex flex-col overflow-hidden text-start"
          >
            {/* Story Image */}
            <div className="relative h-[220px] w-full overflow-hidden select-none bg-cream-bg">
              <img
                src={story.image}
                alt={`${story.petName}'s new family`}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 ltr:left-4 rtl:right-4 bg-emerald-600 text-cream-bg text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Heart className="w-3 h-3 fill-current" />
                {t('success.adoptedLabel', { date: story.dateAdopted })}
              </span>
            </div>

            {/* Story Copy */}
            <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between text-start">
              <div className="text-start">
                <div className="flex items-center justify-between mb-3 text-start">
                  <h3 className="font-extrabold text-xl text-primary tracking-tight text-start">
                    {story.petName}
                  </h3>
                  <span className="text-xs font-semibold text-primary-light/70 bg-cream-bg px-2.5 py-1 rounded-lg shrink-0">
                    {story.family}
                  </span>
                </div>

                <div className="relative text-start">
                  <Quote className="w-8 h-8 text-secondary/15 absolute -top-3 ltr:-left-3 rtl:-right-3" />
                  <p className="text-xs sm:text-sm text-primary-light/90 leading-relaxed italic pt-2 ltr:pl-4 rtl:pr-4 text-start">
                    "{story.story}"
                  </p>
                </div>
              </div>

              {/* Location footer */}
              <div className="mt-6 pt-4 border-t border-cream-accent/50 flex items-center gap-1 text-xs text-primary-light/60 text-start">
                <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>{t('success.locationLabel', { loc: story.location })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
