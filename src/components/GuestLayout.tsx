import { Outlet, useLocation } from 'react-router-dom';
import { GuestHeader } from './GuestHeader';

export const GuestLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/guest';

  return (
    <div className="min-h-screen bg-white">
      <GuestHeader />
      <main className={isHome ? '' : 'max-w-4xl mx-auto px-4 py-6'}>
        <Outlet />
      </main>
    </div>
  );
};
