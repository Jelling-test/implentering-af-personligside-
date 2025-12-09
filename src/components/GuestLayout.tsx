import { Outlet, useLocation } from 'react-router-dom';
import { GuestHeader } from './GuestHeader';
import { useGuest } from '@/contexts/GuestContext';
import GuestDeparted from '@/pages/guest/GuestDeparted';

export const GuestLayout = () => {
  const location = useLocation();
  const { guest } = useGuest();
  const isHome = location.pathname === '/guest';

  // Hvis gæsten er tjekket ud → vis kun afskedsside (ingen header/navigation)
  if (guest.checkedOut) {
    return <GuestDeparted />;
  }

  return (
    <div className="min-h-screen bg-white">
      <GuestHeader />
      <main className={isHome ? '' : 'max-w-4xl mx-auto px-4 py-6'}>
        <Outlet />
      </main>
    </div>
  );
};
