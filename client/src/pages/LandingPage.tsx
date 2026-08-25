import React from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Flame,
  Wine,
  Sparkles,
  Clock,
  Coffee,
  ArrowRight,
  PhoneCall,
  Search,
  CheckCircle2,
  CalendarDays,
  ShoppingBag,
  Truck,
  Sofa,
  Armchair,
} from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader';
import { PublicFooter } from '../components/layout/PublicFooter';
import { Button, Logo, WhatsAppIcon, InstagramIcon, TikTokIcon, FacebookIcon, GoogleMapsIcon } from '@lina/ui';
import heroBg from '../assets/images/hero-bg.jpg';

export const LandingPage: React.FC = () => {
  const pillars = [
    {
      id: 'kitchen',
      title: 'Authentic Kitchen',
      tag: 'Native Delicacies',
      desc: 'Rich native soups, seafood fisherman soup, village rice, isi ewu and local delicacies cooked with authentic herbs and traditional recipes.',
      icon: <UtensilsCrossed size={22} className="text-primary" />,
    },
    {
      id: 'grills',
      title: 'Grills & Shawarma Bar',
      tag: 'Charcoal & Smoked',
      desc: 'Charcoal-roasted whole catfish, spicy asun and loaded beef/chicken shawarmas with single and double sausage options.',
      icon: <Flame size={22} className="text-secondary" />,
    },
    {
      id: 'bar',
      title: 'Lounge & Premium Bar',
      // tag: 'Craft Mixology',
      desc: 'Signature cocktails, refreshing mocktails, ice-cold beers and top-shelf spirits served in our relaxing dining bar.',
      icon: <Wine size={22} className="text-primary" />,
    },
    {
      id: 'lounge',
      title: 'VIP Lounge & Shisha',
      tag: 'Nightlife & Ambience',
      desc: 'Ambient lounge space featuring smooth, flavored shisha pots, plush seating and curated music for evening unwind.',
      icon: <Armchair size={22} className="text-secondary" />,
    },
    {
      id: 'street-food',
      title: 'Evening Street Food Corner',
      tag: 'Opens 5:00 PM Daily',
      desc: 'Quick evening bites, grilled treats, suya and street-style favorites prepared fresh on the open coals every evening.',
      icon: <Clock size={22} className="text-primary" />,
    },
    {
      id: 'tea',
      title: 'SAF Arabian Tea Space',
      // tag: 'Herbal Botanicals',
      desc: 'Freshly brewed traditional herbal teas served in shared jugs with aromatic Middle Eastern spices and natural herbs.',
      icon: <Coffee size={22} className="text-secondary" />,
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Scan or Browse',
      desc: 'Pick your native dishes, fresh charcoal grills, or drinks from our live catalog.',
      icon: <Search size={20} className="text-primary" />,
    },
    {
      num: '02',
      title: 'Place Order',
      desc: 'Direct one-tap checkout with your address or table number sent straight to our kitchen.',
      icon: <WhatsAppIcon size={20} className="text-[#25D366]" />,
    },
    {
      num: '03',
      title: 'Fast Delivery / Table Service',
      desc: 'Freshly prepared by our culinary team and served steaming hot right to you.',
      icon: <Truck size={20} className="text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between selection:bg-primary/20">
      <PublicHeader />

      <main className="flex-1">
        {/* 1. HERO SECTION: Warm, Moody, Elegant Hospitality */}
        <section className="relative bg-[#161311] text-[#FAF7F2] pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-[#2E2722] overflow-hidden">
          {/* Authentic Warm Background Image with Solid Dark Overlay (Zero Gradients) */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBg}
              alt="Lina Restaurant, Bar And Street Food Ambience"
              className="w-full h-full object-cover object-center scale-105"
            />
            <div className="absolute inset-0 bg-[#161311]/85" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              {/* Brand Logo Visual Badge */}
              <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-xl bg-[#1E1A17]/90 border border-[#3D332A] shadow-xs backdrop-blur-xs">
                <Logo size="xl" />
              </div>

              {/* Headline & Subtitle */}
              <div className="space-y-4">
                <div className="inline-block px-3.5 py-1 rounded-full bg-[#2E2722] border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest">
                  Gwarinpa, Abuja
                </div>
                <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[#FAF7F2] leading-tight tracking-tight">
                  Lina Restaurant, Bar And Street Food
                </h1>
                <p className="text-xl sm:text-2xl font-serif italic text-primary font-medium">
                  Where Good Food Meets Great Vibes.
                </p>
                <p className="text-sm sm:text-base text-[#DDD7CB] max-w-2xl mx-auto leading-relaxed pt-1">
                  From steaming fisherman soups and charcoal grills to exotic Arabian teas and ambient VIP shisha sessions. Order online straight to our Kitchen or dine with us.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link to="/menu" className="w-full sm:w-auto">
                  <Button variant="gold" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                    <span>Browse Menu & Order</span>
                  </Button>
                </Link>

                <a
                  href="https://wa.me/2349165196622?text=Hello%20Lina%20Restaurant%2C%20I%20would%20like%20to%20book%20a%20table%20%2F%20VIP%20lounge."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-sm sm:text-base border-[#3D332A] text-[#FAF7F2] hover:bg-[#2E2722] hover:text-primary gap-2"
                  >
                    <span>Book Catering / Table</span>
                  </Button>
                </a>
              </div>

              {/* Quick Hours Pill */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#A89F91] border-t border-[#2E2722]">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary" />
                  <span>Restaurant & Lounge: <strong className="text-[#FAF7F2]">12:00 PM – Late</strong></span>
                </div>
                <div className="hidden sm:inline text-[#3D332A]">•</div>
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-primary" />
                  <span>Street Food: <strong className="text-[#FAF7F2]">5:00 PM – Late</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. QUICK "HOW IT WORKS" BAR */}
        <section className="py-12 bg-surface-container-low border-b border-outline-variant">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Effortless Direct Ordering
              </span>
              <h2 className="font-serif font-bold text-2xl text-on-surface mt-1">
                How It Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 relative flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant/60">
                      {step.icon}
                    </div>
                    <span className="font-serif font-black text-2xl text-primary/40">
                      {step.num}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-base text-on-surface">
                      {step.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. EXPERIENCE & SERVICE PILLARS (6-CARD GRID) */}
        <section className="py-16 lg:py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Experience & Service Pillars
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-on-surface">
                Crafted for Every Craving & Occasion
              </h2>
              <p className="text-sm text-on-surface-variant">
                Explore our signature kitchen offerings, vibrant nightlife and relaxed social spaces.
              </p>
            </div>

            {/* 6-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pillars.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col justify-between space-y-4 hover:border-primary/60 transition-colors shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant/50">
                        {item.icon}
                      </div>
                      {
                        item.tag &&
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container border border-primary/20">
                          {item.tag}
                        </span>
                      }
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-serif font-bold text-lg text-on-surface">
                        {item.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/menu"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                    >
                      <span>Explore Menu</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Link to="/menu">
                <Button variant="gold" size="md">
                  <span>Browse Full Digital Menu</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. OUTDOOR CATERING & EVENT BOOKINGS BANNER */}
        <section className="py-12 bg-surface-container-low border-y border-outline-variant">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#1E1A17] text-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#3D332A] grid grid-cols-1 lg:grid-cols-3 gap-8 items-center shadow-sm">
              <div className="lg:col-span-2 space-y-4">


                <h2 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-[#FAF7F2] leading-tight">
                  Hosting an Event? Let Lina Handle the Feast.
                </h2>

                <p className="text-sm text-[#DDD7CB] leading-relaxed max-w-2xl">
                  Full-scale catering for birthdays, private parties, corporate events and traditional ceremonies. We bring live grill stations, rich native soups, cocktail bars and Arabian tea service directly to your venue.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-4">
                <a
                  href="https://wa.me/2349165196622?text=Hello%20Lina%2C%20I%E2%80%99d%20like%20to%20inquire%20about%20event%20catering%20services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto lg:w-full"
                >
                  <Button variant="gold" size="lg" className="w-full justify-center gap-2">
                    <WhatsAppIcon size={18} className="text-[#161311]" />
                    <span>Inquire About Catering</span>
                  </Button>
                </a>

                <a
                  href="tel:09165196622"
                  className="text-xs text-[#A89F91] hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <PhoneCall size={14} />
                  <span>Or call us directly at 09165196622</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 5. LOCATION, OPENING TIMES & DIRECT CONTACTS */}
        <section className="py-16 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 shadow-xs">
              {/* Address */}
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center border border-primary/20">
                  <GoogleMapsIcon size={20} className="text-primary" />
                </div>
                <h3 className="font-serif font-bold text-lg text-on-surface">
                  Our Location
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  7/29 6th Avenue, Gwarinpa, Abuja, Nigeria.
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=7%2F29+6th+Avenue+Gwarinpa+Abuja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover pt-1"
                >
                  <span>Open in Google Maps</span>
                  <ArrowRight size={13} />
                </a>
              </div>

              {/* Opening Hours */}
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center border border-primary/20">
                  <Clock size={20} className="text-primary" />
                </div>
                <h3 className="font-serif font-bold text-lg text-on-surface">
                  Opening Hours
                </h3>
                <div className="space-y-1 text-sm text-on-surface-variant">
                  <p>
                    <strong className="text-on-surface font-semibold">Restaurant & Lounge:</strong> 12:00 PM – Late
                  </p>
                  <p>
                    <strong className="text-on-surface font-semibold">Street Food Section:</strong> 5:00 PM – Late
                  </p>
                  <p className="text-xs text-on-surface-variant/80 pt-1">
                    Open Every Day (Monday – Sunday)
                  </p>
                </div>
              </div>

              {/* Direct Contacts */}
              <div className="space-y-3 md:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center border border-primary/20">
                  <PhoneCall size={20} className="text-primary" />
                </div>
                <h3 className="font-serif font-bold text-lg text-on-surface">
                  Direct Contacts
                </h3>
                <div className="space-y-2.5">
                  <a
                    href="https://wa.me/2349165196622"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-on-surface font-semibold hover:text-primary transition-colors"
                  >
                    <WhatsAppIcon size={16} className="text-[#25D366]" />
                    <span>09165196622 (WhatsApp)</span>
                  </a>
                  <a
                    href="tel:09165196622"
                    className="flex items-center gap-2 text-sm text-on-surface font-semibold hover:text-primary transition-colors"
                  >
                    <PhoneCall size={16} className="text-primary" />
                    <span>09165196622 (Direct Line)</span>
                  </a>

                  {/* Social Handles */}
                  <div className="pt-2 border-t border-outline-variant/60 flex items-center gap-3">
                    <a
                      href="https://www.tiktok.com/@lina_restaurant?_r=1&_t=ZS-999dMxzyRjV"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface-container hover:bg-primary/10 text-on-surface hover:text-primary transition-all"
                      title="TikTok @lina_restaurant"
                    >
                      <TikTokIcon size={16} className="text-[#EE1D52]" />
                    </a>
                    <a
                      href="https://www.instagram.com/lina_restaurant_and_streetfood?igsi=MTBndGluYnhyNDY5aA=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface-container hover:bg-primary/10 text-on-surface hover:text-primary transition-all"
                      title="Instagram @lina_restaurant_and_streetfood"
                    >
                      <InstagramIcon size={16} className="text-[#E4405F]" />
                    </a>
                    <a
                      href="https://www.facebook.com/share/1EjgzWAGvT/?mibextid=wwXIfr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface-container hover:bg-primary/10 text-on-surface hover:text-primary transition-all"
                      title="Facebook Page"
                    >
                      <FacebookIcon size={16} className="text-[#1877F2]" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};
