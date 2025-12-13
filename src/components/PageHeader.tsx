import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  image: string;
  backTo?: string;
  children?: ReactNode;
  guestName?: string;
  bookingId?: string | number;
}

export const PageHeader = ({ title, subtitle, image, backTo = '/guest', children, guestName, bookingId }: PageHeaderProps) => {
  return (
    <div className="relative h-48 sm:h-56 bg-cover bg-center" style={{ backgroundImage: `url('${image}')` }}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      
      {/* Back button */}
      <Link 
        to={backTo}
        className="absolute top-4 left-4 flex items-center gap-1 text-white/90 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Tilbage
      </Link>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <h1 className="text-white text-3xl sm:text-4xl font-serif font-light mb-1">
          {title}
          {guestName && bookingId && (
            <span className="text-white/70 text-lg sm:text-xl ml-3 font-normal">
              {guestName} (#{bookingId})
            </span>
          )}
        </h1>
        {subtitle && (
          <p className="text-white/80 text-sm sm:text-base">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};
