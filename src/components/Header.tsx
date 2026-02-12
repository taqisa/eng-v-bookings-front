import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

// Original glowing effect for the user button
const glowingEffect = `
  @keyframes glow-circle {
    0% { box-shadow: 0 0 5px 1px rgba(59, 130, 246, 0.6), 0 0 10px 2px rgba(59, 130, 246, 0.3); }
    50% { box-shadow: 0 0 8px 2px rgba(59, 130, 246, 0.9), 0 0 16px 4px rgba(59, 130, 246, 0.5); }
    100% { box-shadow: 0 0 5px 1px rgba(59, 130, 246, 0.6), 0 0 10px 2px rgba(59, 130, 246, 0.3); }
  }
  .glow-circle-effect { display: inline-flex; align-items: center; border-radius: 9999px; animation: glow-circle 2.9s ease-in-out infinite; padding: 0.35rem 0.85rem; white-space: nowrap; transition: all 0.2s ease-in-out; }
  .glow-circle-effect > span { font-weight: 700; }
`;

// --- ✨ NEW: CSS for the Ethereal Waving "H" Logo ✨ ---
const etherealHLogoAnimation = `
  /* Entrance animation for the vertical strokes */
  @keyframes grow-in {
    from {
      opacity: 0;
      transform: scaleY(0.5);
    }
    to {
      opacity: 1;
      transform: scaleY(1);
    }
  }

  /* Continuous animation for the waving crossbar */
  @keyframes wave-flow {
    from {
      stroke-dashoffset: 0;
    }
    to {
      /* Animate by the total length of the pattern (dash + gap) for a seamless loop */
      stroke-dashoffset: -100; 
    }
  }

  .h-stroke {
    transform-origin: center;
    animation: grow-in 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  }
  .h-stroke.left { animation-delay: 0.1s; }
  .h-stroke.right { animation-delay: 0.3s; }

  .h-wave {
    /* Define a pattern: 50 units of solid line, 50 units of empty space */
    stroke-dasharray: 50 50;
    animation: wave-flow 3s linear infinite;
    filter: drop-shadow(0 0 3px rgba(129, 140, 248, 0.6)); /* Indigo glow */
    transition: filter 0.3s ease-in-out;
  }
  
  /* Make the wave glow brighter on hover */
  .group:hover .h-wave {
    filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.9)); /* Brighter blue glow */
  }
`;


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "الرئيسية", href: "#home" },
    { name: "الخدمات", href: "#services" },
    { name: "المدن", href: "#cities" },
    { name: "حول المنصة", href: "#about" },
    { name: "حجوزاتي", href: "/account" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsMenuOpen(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    if (isMenuOpen) setIsMenuOpen(false);
    await signOut();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  const handleAuthClick = () => {
    navigate("/auth");
    setIsMenuOpen(false);
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      if (window.location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
    setIsMenuOpen(false);
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    const metadata = user.user_metadata || {};
    return metadata.name || metadata.full_name || metadata.username || user.email?.split("@")[0] || "مستخدم ";
  };

  return (
    <>
      <style>{glowingEffect}</style>
      <style>{etherealHLogoAnimation}</style>

      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* --- ✨ NEW ETHEREAL WAVING "H" LOGO ✨ --- */}
            <div
              className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer group"
              onClick={() => navigate("/")}
            >
              {/* Logo Icon Container */}
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg">
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="regalBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" /> {/* White */}
                      <stop offset="100%" stopColor="#94a3b8" /> {/* Slate-400 */}
                    </linearGradient>
                  </defs>

                  {/* The two main vertical strokes with tails */}
                  <g fill="url(#regalBlue)" stroke="none">
                    <path d="M20 90 C 20 80, 25 85, 25 75 V 25 C 25 15, 20 20, 20 10 H 30 C 35 20, 30 15, 30 25 V 75 C 30 85, 35 80, 30 90 Z" className="h-stroke left" />
                    <path d="M70 90 C 65 80, 70 85, 70 75 V 25 C 70 15, 65 20, 70 10 H 80 C 80 20, 75 15, 75 25 V 75 C 75 85, 80 80, 80 90 Z" className="h-stroke right" />
                  </g>

                  {/* The perpetually waving crossbar */}
                  <path
                    d="M27 50 c 16 -10, 5 10, 46 0" // Smooth 'S' curve path
                    stroke="url(#regalBlue)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    className="h-wave"
                  />
                </svg>
              </div>

              {/* Logo Text */}
              <div>
                <h1 className="text-2xl h-9 font-black text-gray-800 tracking-tight" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
                  حجزك
                </h1>
              </div>
            </div>
            {/* --- END OF NEW LOGO --- */}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            {/* Auth Area - Desktop */}
            <div className="hidden md:flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-300 rounded-full p-1"
                    >
                      <span className="glow-circle-effect">
                        <span>{getUserDisplayName()}</span>
                        <ChevronDown className="h-4 w-4 mr-1" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>مرحباً، {getUserDisplayName()}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="flex items-center cursor-pointer">
                        <Settings className="ml-2 h-4 w-4" />
                        <span>إدارة الحساب</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer flex items-center"
                    >
                      <LogOut className="ml-2 h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Button
                    variant="ghost"
                    onClick={handleAuthClick}
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-300 flex items-center"
                  >
                    <User className="w-4 h-4 ml-2" />
                    تسجيل الدخول
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:shadow-lg"
                    onClick={handleAuthClick}
                  >
                    إنشاء حساب
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Auth and Menu Button */}
            <div className="flex items-center md:hidden space-x-3 rtl:space-x-reverse">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-300 rounded-full p-1"
                    >
                      <span className="glow-circle-effect">
                        <span>{getUserDisplayName()}</span>
                        <ChevronDown className="h-4 w-4 mr-1" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>مرحباً، {getUserDisplayName()}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="flex items-center cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>إدارة الحساب</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="transition-transform duration-300 hover:scale-110"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 animate-slide-down">
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2 w-full text-right"
                  >
                    {item.name}
                  </button>
                ))}
                {!user && (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <Button
                      variant="ghost"
                      onClick={handleAuthClick}
                      className="w-full text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-300 flex items-center justify-center"
                    >
                      <User className="w-4 h-4 ml-2" />
                      تسجيل الدخول
                    </Button>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleAuthClick}
                    >
                      إنشاء حساب
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;