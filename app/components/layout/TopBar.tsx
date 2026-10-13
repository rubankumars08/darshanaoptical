import { MapPin, Phone, Clock } from "lucide-react";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa6";

export default function TopBar() {
  return (
    <div className="hidden bg-neutral-950 text-neutral-300 md:block">
      <div className="container-brand flex h-8 items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} strokeWidth={2} className="text-brand-orange" />
            Harur, Tamil Nadu
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={13} strokeWidth={2} className="text-brand-orange" />
            +91 88705 71536
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <Clock size={13} strokeWidth={2} className="text-brand-orange" />
            Mon - Sat : 9:30 AM - 8:30 PM
          </span>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/darshanaoptical3108/"
              target="_blank"
              rel="noreferrer"
              aria-label="Darshana Optical on Instagram"
              className="hover:text-brand-orange transition-colors"
            >
              <FaInstagram size={13} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-brand-orange transition-colors">
              <FaFacebookF size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
