import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-white/10 bg-[#111319] text-[#92959b]">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 text-xs sm:px-6 lg:px-8">
      <Link to="/account" className="font-semibold tracking-[0.12em] text-[#e7e4dc] transition-colors hover:text-white">
        BOOKINGS
      </Link>
      <div className="flex items-center gap-3">
        <span>© {new Date().getFullYear()} BOOKINGS</span>
        <span aria-hidden="true" className="text-white/25">·</span>
        <Link to="/account" className="transition-colors hover:text-white">My Bookings</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
