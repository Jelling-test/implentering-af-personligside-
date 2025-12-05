import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GuestProvider } from "./contexts/GuestContext";
import { GuestLayout } from "./components/GuestLayout";
import MagicLink from "./pages/MagicLink";
import GuestWelcome from "./pages/guest/GuestWelcome";
import GuestPower from "./pages/guest/GuestPower";
import GuestBakery from "./pages/guest/GuestBakery";
import GuestEvents from "./pages/guest/GuestEvents";
import GuestCafe from "./pages/guest/GuestCafe";
import GuestPractical from "./pages/guest/GuestPractical";
import GuestCabin from "./pages/guest/GuestCabin";
import AdminEvents from "./pages/admin/AdminEvents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GuestProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/guest" replace />} />
            <Route path="/m/:token" element={<MagicLink />} />
            <Route path="/guest" element={<GuestLayout />}>
              <Route index element={<GuestWelcome />} />
              <Route path="power" element={<GuestPower />} />
              <Route path="bakery" element={<GuestBakery />} />
              <Route path="events" element={<GuestEvents />} />
              <Route path="cafe" element={<GuestCafe />} />
              <Route path="practical" element={<GuestPractical />} />
              <Route path="cabin" element={<GuestCabin />} />
            </Route>
            {/* Admin routes */}
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GuestProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
