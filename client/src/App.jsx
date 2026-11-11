import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard    from './pages/Dashboard';
import Inventory    from './pages/Inventory';
import Bookings     from './pages/Bookings';
import NewBooking   from './pages/NewBooking';
import BookingDetail from './pages/BookingDetail';
import PrintReceipt from './pages/PrintReceipt';
import Login        from './pages/Login';
import i18n from './i18n/i18n';
import { AuthProvider, useAuth } from './context/AuthContext';

const NAV_LINKS = (t, isAdmin) => {
  if (isAdmin) {
    return [
      { to: '/',             label: t('nav_dashboard'),   icon: '📊', end: true  },
      { to: '/inventory',    label: t('nav_inventory'),   icon: '🏺', end: false },
      { to: '/bookings',     label: t('nav_bookings'),    icon: '📋', end: false },
      { to: '/bookings/new', label: t('nav_new_booking'), icon: '➕', end: false },
    ];
  }
  return [
    { to: '/bookings/new', label: t('nav_new_booking'), icon: '➕', end: false },
    { to: '/login',        label: 'Admin Login',        icon: '🔑', end: false },
  ];
};

function Navbar() {
  const { t }                   = useTranslation();
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location                = useLocation();
  const { isAdmin, logout }     = useAuth();

  // close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // shadow on scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const toggleLang = () =>
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');

  const links = NAV_LINKS(t, isAdmin);

  return (
    <>
      {/* ── Top bar ── */}
      <nav className={`bg-primary text-white sticky top-0 z-50 no-print transition-shadow duration-200 ${
        scrolled ? 'shadow-xl' : 'shadow-md'
      }`}>
        <div className="flex items-center justify-between px-4 h-14">

          {/* Brand */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xl flex-shrink-0">🏺</span>
            <span className="font-bold text-sm sm:text-base truncate">
              {t('shop_name')}
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    l.to === '/bookings/new'
                      ? isActive
                        ? 'bg-yellow-500 text-white'
                        : 'bg-accent text-white hover:bg-yellow-500'
                      : isActive
                      ? 'bg-blue-700'
                      : 'hover:bg-blue-800'
                  }`
                }
              >
                <span className="text-base">{l.icon}</span>
                <span>{l.label}</span>
              </NavLink>
            ))}

            {isAdmin && (
              <button
                onClick={logout}
                className="ml-1 px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-700 text-xs font-semibold transition-all duration-150"
              >
                🚪 Logout
              </button>
            )}

            <button
              onClick={toggleLang}
              className="ml-1 px-3 py-2 rounded-lg border border-blue-400 text-xs font-semibold hover:bg-blue-800 transition-all duration-150"
            >
              {t('lang_toggle')}
            </button>
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-lg border border-blue-400 text-xs font-semibold hover:bg-blue-800 transition-all"
            >
              {t('lang_toggle')}
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="p-2 rounded-lg hover:bg-blue-800 transition-all"
              aria-label="Menu"
            >
              <div className="w-5 flex flex-col gap-1 items-end">
                <span className={`block h-0.5 bg-white rounded transition-all duration-300 ${open ? 'w-5 rotate-45 translate-y-1.5' : 'w-5'}`} />
                <span className={`block h-0.5 bg-white rounded transition-all duration-300 ${open ? 'opacity-0 w-0' : 'w-4'}`} />
                <span className={`block h-0.5 bg-white rounded transition-all duration-300 ${open ? 'w-5 -rotate-45 -translate-y-1.5' : 'w-5'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-3 pb-3 space-y-1 border-t border-blue-700 pt-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    l.to === '/bookings/new'
                      ? 'bg-accent text-white mt-1'
                      : isActive
                      ? 'bg-blue-700'
                      : 'hover:bg-blue-800'
                  }`
                }
              >
                <span className="text-lg">{l.icon}</span>
                <span>{l.label}</span>
              </NavLink>
            ))}
            {isAdmin && (
              <button
                onClick={logout}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-red-600/80 text-white mt-2"
              >
                <span className="text-lg">🚪</span>
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

/* Bottom tab bar — mobile only */
function BottomTabs() {
  const { t }          = useTranslation();
  const location       = useLocation();
  const { isAdmin }    = useAuth();
  const links          = NAV_LINKS(t, isAdmin);

  // hide on print page
  if (location.pathname.includes('/print')) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl no-print">
      <div className="flex">
        {links.map((l) => {
          const isActive = l.end
            ? location.pathname === l.to
            : location.pathname.startsWith(l.to);
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            >
              <span className={`text-xl transition-all ${isActive ? 'scale-110' : 'opacity-60'}`}>
                {l.icon}
              </span>
              <span className={`text-[10px] font-medium leading-tight text-center ${
                isActive ? 'text-primary font-bold' : 'text-gray-500'
              }`}>
                {l.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
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
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/bookings/new" element={<NewBooking />} />
      <Route path="/login" element={!isAdmin ? <Login /> : <Navigate to="/" replace />} />

      {/* Protected Admin routes */}
      <Route path="/" element={isAdmin ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/inventory" element={isAdmin ? <Inventory /> : <Navigate to="/login" replace />} />
      <Route path="/bookings" element={isAdmin ? <Bookings /> : <Navigate to="/login" replace />} />
      <Route path="/bookings/:id" element={isAdmin ? <BookingDetail /> : <Navigate to="/login" replace />} />
      <Route path="/bookings/:id/print" element={isAdmin ? <PrintReceipt /> : <Navigate to="/login" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAdmin ? "/" : "/bookings/new"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="px-3 py-4 sm:px-5 sm:py-6 max-w-7xl mx-auto pb-24 md:pb-6">
            <AppRoutes />
          </main>
          <BottomTabs />
          <ToastContainer
            position="top-center"
            autoClose={2500}
            toastClassName="text-sm rounded-xl shadow-lg"
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
