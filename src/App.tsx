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
import GuestAttractions from "./pages/guest/GuestAttractions";
import GuestPool from "./pages/guest/GuestPool";
import GuestPlayground from "./pages/guest/GuestPlayground";
import GuestDeparted from "./pages/guest/GuestDeparted";
import PaymentSuccess from "./pages/guest/PaymentSuccess";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminBakery from "./pages/admin/AdminBakery";
import AdminPool from "./pages/admin/AdminPool";
import AdminPlayground from "./pages/admin/AdminPlayground";
import AdminDashboardImages from "./pages/admin/AdminDashboardImages";
import AdminCabin from "./pages/admin/AdminCabin";
import AdminCafe from "./pages/admin/AdminCafe";
import AdminExternalEvents from "./pages/admin/AdminExternalEvents";
import AdminAttractions from "./pages/admin/AdminAttractions";
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
            <Route path="/m/:bookingId/:token" element={<MagicLink />} />
            <Route path="/guest" element={<GuestLayout />}>
              <Route index element={<GuestWelcome />} />
              <Route path="power" element={<GuestPower />} />
              <Route path="bakery" element={<GuestBakery />} />
              <Route path="events" element={<GuestEvents />} />
              <Route path="cafe" element={<GuestCafe />} />
              <Route path="practical" element={<GuestPractical />} />
              <Route path="attractions" element={<GuestAttractions />} />
              <Route path="cabin" element={<GuestCabin />} />
              <Route path="pool" element={<GuestPool />} />
              <Route path="playground" element={<GuestPlayground />} />
              <Route path="departed" element={<GuestDeparted />} />
            </Route>
            {/* Payment routes */}
            <Route path="/betaling-gennemfoert" element={<PaymentSuccess />} />
            <Route path="/betaling-annulleret" element={<Navigate to="/guest/power" replace />} />
            {/* Admin routes */}
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/bakery" element={<AdminBakery />} />
            <Route path="/admin/pool" element={<AdminPool />} />
            <Route path="/admin/playground" element={<AdminPlayground />} />
            <Route path="/admin/dashboard-images" element={<AdminDashboardImages />} />
            <Route path="/admin/cabin" element={<AdminCabin />} />
            <Route path="/admin/cafe" element={<AdminCafe />} />
            <Route path="/admin/external-events" element={<AdminExternalEvents />} />
            <Route path="/admin/attractions" element={<AdminAttractions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GuestProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
