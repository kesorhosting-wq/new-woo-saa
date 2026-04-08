import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SiteProvider } from "./contexts/SiteContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import TopupPage from "./pages/TopupPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";
import UserProfilePage from "./pages/UserProfilePage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import WalletPage from "./pages/WalletPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import DocsPage from "./pages/DocsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <SiteProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/game/:gameSlug" element={<TopupPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/admin/*" element={<AdminPage />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                    <Route path="/history" element={<OrderHistoryPage />} />
                    <Route path="/wallet" element={<WalletPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/api-docs" element={<DocsPage />} />
                    <Route path="/docs/*" element={<DocsPage />} />
                    <Route path="/privacy" element={<div className="min-h-screen bg-white flex items-center justify-center font-black uppercase tracking-widest text-black/20">Privacy Protocol Terminal</div>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </CartProvider>
            </SiteProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
