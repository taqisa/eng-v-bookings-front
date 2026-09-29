
import { Instagram, Phone, Mail, MapPin, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = {
    platform: {
      title: "Platform",
      links: [
        { name: "About", href: "/about", type: "internal" },
        { name: "How it works", href: "/about#how-it-works", type: "internal" }
      ]
    },
    support: {
      title: "Support",
      links: [
        { name: "Help Center", href: "#", type: "external" },
        { name: "Contact Us", href: "#", type: "external" },
        { name: "FAQ", href: "/#faq", type: "internal" }
      ]
    }
  };

  return (
    <footer className="bg-[#020617] text-slate-300 border-t border-slate-800 relative overflow-hidden font-sans">
      {/* Premium Glow Effects */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-amber-900/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Brand Section - Span 4 */}
            <div className="lg:col-span-4 space-y-8">
              <Link to="/" className="flex items-center space-x-4 group w-fit">
                {/* Logo Icon Container - Whitish Navy Theme */}
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl border border-slate-700 shadow-2xl group-hover:border-amber-500/30 transition-all duration-500">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-lg"
                  >
                    <defs>
                      <linearGradient id="regalBlueFooter" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" /> {/* White */}
                        <stop offset="100%" stopColor="#94a3b8" /> {/* Slate-400 */}
                      </linearGradient>
                    </defs>

                    {/* The left vertical stroke */}
                    <g fill="url(#regalBlueFooter)" stroke="none">
                      <path d="M20 90 C 20 80, 25 85, 25 75 V 25 C 25 15, 20 20, 20 10 H 30 C 35 20, 30 15, 30 25 V 75 C 30 85, 35 80, 30 90 Z" className="h-stroke left" />
                    </g>

                    {/* The loops of the B */}
                    <path 
                      d="M 25 15 H 55 C 80 15, 80 50, 55 50 M 25 85 H 60 C 90 85, 90 50, 60 50" 
                      stroke="url(#regalBlueFooter)" 
                      strokeWidth="10" 
                      strokeLinecap="round" 
                      fill="none" 
                    />

                    {/* The perpetually waving crossbar serving as the middle of the B */}
                    <path
                      d="M27 50 c 12 -10, 5 10, 30 0"
                      stroke="url(#regalBlueFooter)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                      className="h-wave"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight font-sans transition-colors duration-300">

                  </h3>
                </div>
              </Link>

              <p className="text-slate-400 leading-relaxed text-lg max-w-md">
                The premier destination for booking appointments. A modern, fast, and reliable booking experience.
              </p>

              {/* Socials / Contact */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-4">
                  <a href="https://wa.me/970599000000" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all duration-300">
                    <Phone className="w-5 h-5" />
                  </a>
                  <a href="mailto:info@bookingpalestine.com" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all duration-300">
                    <Mail className="w-5 h-5" />
                  </a>
                  <a href="https://www.instagram.com/hajzk.ps/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all duration-300">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
                <div className="flex items-center space-x-2 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>United States</span>
                </div>
              </div>
            </div>

            {/* Links Sections - Span 2 each */}
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key} className="lg:col-span-2 space-y-6">
                <h4 className="text-lg font-bold text-white relative inline-block pb-2">
                  {section.title}
                  <span className="absolute bottom-0 left-0 w-8 h-1 bg-slate-700 rounded-full"></span>
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        target={link.type === 'external' ? "_blank" : undefined}
                        rel={link.type === 'external' ? "noopener noreferrer" : undefined}
                        className="flex items-center text-slate-400 hover:text-white transition-colors duration-200 group text-sm font-medium"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-slate-800/50 bg-[#020617]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-500 text-sm dir-ltr font-medium">
              © {new Date().getFullYear()} <span className="text-slate-300 font-bold">HAJZK</span>. All rights reserved.
            </div>

            <div className="flex items-center space-x-2 text-slate-600 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500/80 fill-current animate-pulse" />
              <span>Care</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
