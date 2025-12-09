import { Link, useLocation } from 'react-router-dom';
import { Tent, Home, Zap, CalendarDays, Info, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useGuest } from '@/contexts/GuestContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export const GuestHeader = () => {
  const location = useLocation();
  const { t, language } = useGuest();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/guest', label: language === 'da' ? 'Forside' : 'Home', exact: true },
    { to: '/guest/power', label: language === 'da' ? 'Strøm' : 'Power' },
    { to: '/guest/bakery', label: language === 'da' ? 'Bageri' : 'Bakery' },
    { to: '/guest/events', label: 'Events' },
    { to: '/guest/attractions', label: language === 'da' ? 'Attraktioner' : 'Attractions' },
    { to: '/guest/cafe', label: 'Café' },
    { to: '/guest/practical', label: language === 'da' ? 'Information' : 'Info' },
    { to: '/guest/pool', label: language === 'da' ? 'Friluftsbad' : language === 'de' ? 'Freibad' : 'Pool' },
    { to: '/guest/playground', label: language === 'da' ? 'Legeplads' : language === 'de' ? 'Spielplatz' : 'Playground' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/guest" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-full">
            <Tent className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-gray-800 hidden sm:block">
            Family Camping Jelling
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                isActive(item.to, item.exact)
                  ? 'text-orange-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="flex flex-col p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg ${
                  isActive(item.to, item.exact)
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
