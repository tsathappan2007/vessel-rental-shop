import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  PlusCircle,
  Home as HomeIcon,
  Globe,
  LogOut,
  Sparkles,
  Menu,
  X,
  ChefHat
} from 'lucide-react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Bookings from './pages/Bookings';
import NewBooking from './pages/NewBooking';
import BookingDetail from './pages/BookingDetail';
import PrintReceipt from './pages/PrintReceipt';
import Login from './pages/Login';
import i18n from './i18n/i18n';
import { AuthProvider, useAuth } from './context/AuthContext';

const NAV_LINKS = (t, isAdmin) => {
  if (isAdmin) {
    return [
      { to: '/', label: t('nav_dashboard'), icon: LayoutDashboard, end: true },
      { to: '/inventory', label: t('nav_inventory'), icon: Package, end: false },
      { to: '/bookings', label: t('nav_bookings'), icon: CalendarCheck, end: false },
      { to: '/bookings/new', label: t('nav_new_booking'), icon: PlusCircle, end: false, highlight: true },
    ];
  }
  return [
    { to: '/', label: 'Home', icon: HomeIcon, end: true },
    { to: '/bookings/new', label: t('nav_new_booking'), icon: PlusCircle, end: false, highlight: true },
  ];
};

function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAdmin, logout } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
  };

  const links = NAV_LINKS(t, isAdmin);

  return (
    <>
      <header
        className={`sticky top-0 z-50 no-print transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-md py-2.5'
            : 'bg-white border-b border-slate-200/60 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo / Brand */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                  {t('shop_name')}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {isAdmin ? 'ADMIN' : 'RENTALS'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
                Devakottai • Catering & Event Vessels
              </p>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                      l.highlight
                        ? isActive
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25 font-bold'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md font-bold'
                        : isActive
                        ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200/80 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{l.label}</span>
                </NavLink>
              );
            })}

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="ml-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('lang_toggle')}</span>
            </button>

            {/* Admin Logout */}
            {isAdmin && (
              <button
                onClick={logout}
                className="ml-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 hover:text-rose-800 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5"
                title="Log out from Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-amber-700 text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('lang_toggle')}</span>
            </button>

            <button
              onClick={() => setOpen((o) => !o)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
              aria-label="Toggle navigation menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {open && (
          <div className="md:hidden border-t border-slate-200 px-4 pt-3 pb-4 space-y-1.5 bg-white shadow-xl">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      l.highlight
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-md'
                        : isActive
                        ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{l.label}</span>
                </NavLink>
              );
            })}

            {isAdmin && (
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout from Admin</span>
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
}

function BottomTabs() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const links = NAV_LINKS(t, isAdmin);

  if (location.pathname.includes('/print')) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl no-print">
      <div className="flex">
        {links.map((l) => {
          const Icon = l.icon;
          const isActive = l.end
            ? location.pathname === l.to
            : location.pathname.startsWith(l.to);
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all relative ${
                isActive ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : ''}`} />
              <span className="text-[10px] leading-tight text-center">{l.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-1 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function AppRoutes() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-amber-400/20 border-t-amber-500 animate-spin" />
          <ChefHat className="w-5 h-5 text-amber-500 absolute inset-0 m-auto" />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root: Shows Dashboard directly when logged in as admin; Shows Landing Page for public visitors */}
      <Route path="/" element={isAdmin ? <Dashboard /> : <Home />} />

      {/* Public booking route */}
      <Route path="/bookings/new" element={<NewBooking />} />

      {/* Admin Login: Accessible only if not logged in */}
      <Route path="/login" element={!isAdmin ? <Login /> : <Navigate to="/" replace />} />

      {/* Protected Admin routes */}
      <Route path="/inventory" element={isAdmin ? <Inventory /> : <Navigate to="/login" replace />} />
      <Route path="/bookings" element={isAdmin ? <Bookings /> : <Navigate to="/login" replace />} />
      <Route path="/bookings/:id" element={isAdmin ? <BookingDetail /> : <Navigate to="/login" replace />} />
      <Route path="/bookings/:id/print" element={isAdmin ? <PrintReceipt /> : <Navigate to="/login" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
          <Navbar />
          <main className="flex-1 w-full pb-20 md:pb-6">
            <AppRoutes />
          </main>
          <BottomTabs />
          <ToastContainer
            position="top-center"
            autoClose={2500}
            theme="light"
            toastClassName="text-sm rounded-2xl shadow-xl bg-white border border-slate-200 text-slate-800"
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
