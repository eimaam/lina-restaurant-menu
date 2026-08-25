import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import { Logo, WhatsAppIcon, InstagramIcon, TikTokIcon, FacebookIcon, GoogleMapsIcon } from '@lina/ui';

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#161311] text-[#DDD7CB] border-t border-[#2E2722] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <Logo size="md" className="brightness-125" />
            <p className="text-xs text-[#A89F91] leading-relaxed">
              Lina Restaurant, Bar And Street Food — Where Good Food Meets Great Vibes. Authentic Nigerian kitchen, charcoal grills, cocktail lounge, shisha, and SAF Arabian tea in Gwarinpa, Abuja.
            </p>
          </div>

          {/* Location & Opening Times */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Location & Hours
            </h4>
            <div className="space-y-2 text-xs text-[#DDD7CB]">
              <a
                href="https://www.google.com/maps/search/?api=1&query=7%2F29+6th+Avenue+Gwarinpa+Abuja"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-[#DDD7CB] hover:text-primary transition-colors group"
              >
                <GoogleMapsIcon size={15} className="text-primary shrink-0 mt-0.5" />
                <span className="leading-snug">
                  7/29 6th Avenue, Gwarinpa, Abuja
                  <span className="inline-block ml-1 opacity-70 group-hover:opacity-100 text-[10px]">↗</span>
                </span>
              </a>

              <div className="flex items-start gap-2 pt-1">
                <Clock size={15} className="text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p>
                    <span className="text-[#A89F91]">Restaurant & Lounge:</span> 12:00 PM – Late
                  </p>
                  <p>
                    <span className="text-[#A89F91]">Street Food Section:</span> 5:00 PM – Late
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Contacts */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Direct Contacts
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://wa.me/2349165196622?text=Hello%20Lina%20Restaurant%2C%20I%20would%20like%20to%20place%20an%20order%20or%20inquire."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#DDD7CB] hover:text-primary transition-colors"
                >
                  <WhatsAppIcon size={14} className="text-[#25D366] shrink-0" />
                  <span>09165196622</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:09165196622"
                  className="flex items-center gap-2 text-[#DDD7CB] hover:text-primary transition-colors"
                >
                  <Phone size={14} className="text-primary shrink-0" />
                  <span>09165196622</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:linarestaurantandbar@gmail.com"
                  className="flex items-center gap-2 text-[#DDD7CB] hover:text-primary transition-colors"
                >
                  <Mail size={14} className="text-primary shrink-0" />
                  <span>linarestaurantandbar@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation & Social */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs text-[#DDD7CB]">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Home & Experiences
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-primary transition-colors">
                  Digital Menu & Ordering
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-primary transition-colors">
                  Cart & WhatsApp Checkout
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-6 border-t border-[#2E2722] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7E72]">
          <p>© {currentYear} Lina Restaurant, Bar And Street Food. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://www.tiktok.com/@lina_restaurant?_r=1&_t=ZS-999dMxzyRjV"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <TikTokIcon size={14} className="text-[#EE1D52]" />
              <span>TikTok</span>
            </a>
            <a
              href="https://www.instagram.com/lina_restaurant_and_streetfood?igsi=MTBndGluYnhyNDY5aA=="
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <InstagramIcon size={14} className="text-[#E4405F]" />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/share/1EjgzWAGvT/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <FacebookIcon size={14} className="text-[#1877F2]" />
              <span>Facebook</span>
            </a>
            <a
              href="https://wa.me/2349165196622"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <WhatsAppIcon size={14} className="text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=7%2F29+6th+Avenue+Gwarinpa+Abuja"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <GoogleMapsIcon size={14} className="text-primary" />
              <span>Directions</span>
            </a>
          </div>

          <p className="text-[11px] text-[#A89F91]">
            Designed by <span className="font-semibold text-primary">Tech Flair</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
