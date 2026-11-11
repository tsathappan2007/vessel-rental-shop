import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getInventory, getShopInfo } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [shop, setShop] = useState({
    name: 'Amman Vessels Rental Shop',
    phone: '+91 9443401815',
    address: '110 N-1, Manthoppu Street, Devakottai - 630302',
  });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    getInventory()
      .then((res) => {
        if (res.data?.data) setInventory(res.data.data);
      })
      .catch(() => {});

    getShopInfo()
      .then((res) => {
        if (res.data?.data) setShop(res.data.data);
      })
      .catch(() => {});
  }, []);

  const OCCASIONS = [
    {
      title: 'Weddings & Receptions',
      tamil: 'திருமண விழா & வரவேற்பு',
      icon: '💒',
      desc: 'Complete mega feast packages with giant Biryani Degs, Anda, Sambar buckets, and dining plates for 100 to 5,000+ guests.',
      popular: 'Biryani Deg, Kedaari, Big Karandi',
    },
    {
      title: 'Temple Festivals & Annadhanam',
      tamil: 'கோவில் திருவிழா & அன்னதானம்',
      icon: '🛕',
      desc: 'Heavy-gauge commercial cooking cauldrons, Pongal paanai, and mass serving ladles designed for continuous community feasts.',
      popular: 'Periya Satti, Thuzhavu Karandi, Drums',
    },
    {
      title: 'Birthdays & Family Parties',
      tamil: 'பிறந்தநாள் & குடும்ப சுபநிகழ்ச்சிகள்',
      icon: '🎂',
      desc: 'Medium-sized vessels, elegant chafing dish sets, dessert bowls, and food warmers for intimate celebrations.',
      popular: 'Chafing Dishes, Vada Chatti, Lids',
    },
    {
      title: 'Housewarming & Poojas',
      tamil: 'கிரகப்பிரவேசம் & பூஜைகள்',
      icon: '🏡',
      desc: 'Traditional brass uruli, milk boiling paanai, payasam pots, and pristine sanitized serving utensils.',
      popular: 'Paal Paanai, Uruli, Serving Trays',
    },
  ];

  const TAMIL_VESSEL_HIGHLIGHTS = [
    {
      name: 'சமையல் சட்டி & அண்டா (Satti & Anda)',
      sub: 'Cooking Cauldrons & Degs',
      icon: '🍲',
      examples: 'Biryani Deg (10kg - 100kg), Kedaari, Vada Chatti, Uruli, Saadam Anda',
      desc: 'Thick-base commercial aluminum and brass vessels engineered for perfect heat retention on woodfire or gas stoves.',
    },
    {
      name: 'கரண்டி வகைகள் (Karandi & Ladles)',
      sub: 'Heavy Feast Utensils',
      icon: '🥄',
      examples: 'Thuzhavu Karandi, Salli Karandi, Sambar Thuppi, Halwa Paddles',
      desc: 'Long-handled sturdy stainless steel and wooden ladles for safe, effortless stirring in giant vessels.',
    },
    {
      name: 'மூடி & தட்டுகள் (Moodi & Lids)',
      sub: 'Dum Covers & Dining Plates',
      icon: '🥘',
      examples: 'Airtight Dum Moodi, Serving Trays, Sapphire Meals Plates, Tubs',
      desc: 'Heavy-gauge lids that lock in heat and aroma for dum cooking, plus sparkling clean dining plate sets.',
    },
    {
      name: 'பாய்லர் & கொப்பரை (Boilers & Warmers)',
      sub: 'Hot Serving Infrastructure',
      icon: '☕',
      examples: 'Tea/Coffee Boilers (20L - 100L), Idli Kopparai, Water Drums, Warmers',
      desc: 'Keeps beverages and meals piping hot throughout the entire event duration.',
    },
  ];

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    if (selectedCategory === 'All') return matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="space-y-16 -mt-4 -mx-3 sm:-mx-5 pb-10">

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#244876] to-[#142841] text-white py-16 px-4 sm:px-8 rounded-b-[2.5rem] shadow-2xl">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-amber-300">
            <span>🏺</span>
            <span>{shop.name} • Devakottai</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Traditional & Modern Vessels <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent">
              For Rent for Every Occasion
            </span>
          </h1>

          {/* Tamil Sub-headline */}
          <p className="text-base sm:text-xl font-medium text-blue-100 max-w-3xl mx-auto leading-relaxed">
            திருமணம், கோவில் திருவிழா, பிறந்தநாள், அன்னதானம் போன்ற அனைத்து சுபநிகழ்ச்சிகளுக்கும் தேவையான 
            <span className="text-amber-300 font-semibold"> சமையல் சட்டி, மூடி, கரண்டி, அண்டா, பாய்லர் </span> 
            வாடகைக்கு உடனே கிடைக்கும்!
          </p>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto">
            From 50-person family poojas to 5,000+ guest grand feasts — sanitized, commercial-grade vessels with prompt delivery and honest daily rates.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              to="/bookings/new"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-8 py-4 rounded-2xl text-base shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>✨ Reserve Vessels Now / முன்பதிவு</span>
              <span>➔</span>
            </Link>

            <a
              href="#vessels"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-semibold px-6 py-4 rounded-2xl text-base active:scale-95 transition-all text-center"
            >
              Explore Vessel Types / பாத்திரங்கள்
            </a>

            <a
              href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-4 rounded-2xl text-base active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>📞 Call Us</span>
            </a>
          </div>

          {/* Quick trust highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 max-w-4xl mx-auto border-t border-white/10 text-left">
            <div className="flex items-center gap-2.5 p-2 bg-white/5 rounded-xl border border-white/10">
              <span className="text-2xl">🧼</span>
              <div>
                <p className="font-bold text-xs sm:text-sm">100% Sanitized</p>
                <p className="text-[10px] text-gray-300">Cleaned & Polished</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 bg-white/5 rounded-xl border border-white/10">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-bold text-xs sm:text-sm">50 to 5000+ Guests</p>
                <p className="text-[10px] text-gray-300">Feast Capacity</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 bg-white/5 rounded-xl border border-white/10">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-bold text-xs sm:text-sm">Instant Booking</p>
                <p className="text-[10px] text-gray-300">Fast Confirmation</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 bg-white/5 rounded-xl border border-white/10">
              <span className="text-2xl">🧾</span>
              <div>
                <p className="font-bold text-xs sm:text-sm">Transparent Bills</p>
                <p className="text-[10px] text-gray-300">Instant PDF Receipts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TAMIL SLANG & SPECIALTY VESSELS SECTION ── */}
      <section id="vessels" className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase font-bold tracking-widest text-primary">
            எங்களிடம் கிடைக்கும் பாத்திரங்கள்
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
            Signature Vessel Collections (Satti, Moodi & Karandi)
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Traditional and heavy-gauge event essentials designed for South Indian catering and community celebrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TAMIL_VESSEL_HIGHLIGHTS.map((cat, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex gap-4 items-start group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="font-bold text-base text-gray-800">{cat.name}</h3>
                <p className="text-xs font-semibold text-primary">{cat.sub}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{cat.desc}</p>
                <div className="pt-2 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="font-semibold text-gray-700">Available:</span> {cat.examples}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OCCASIONS WE CATER ── */}
      <section className="bg-blue-50/60 py-12 px-4 rounded-3xl border border-blue-100 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase font-bold tracking-widest text-primary">
            நிகழ்ச்சிகளுக்கு ஏற்ப பாத்திரங்கள்
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
            Catering to Every Auspicious Event
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            We provide tailor-made vessel setups tailored specifically to the nature and scale of your special day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OCCASIONS.map((occ, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all"
            >
              <div className="space-y-2">
                <span className="text-4xl block">{occ.icon}</span>
                <h3 className="font-bold text-base text-gray-800 leading-snug">{occ.title}</h3>
                <p className="text-xs font-semibold text-primary">{occ.tamil}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{occ.desc}</p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 mb-2 font-medium">Includes: {occ.popular}</p>
                <Link
                  to="/bookings/new"
                  className="w-full text-center block bg-blue-50 hover:bg-primary hover:text-white text-primary text-xs font-bold py-2 rounded-xl transition-all"
                >
                  Book for this Event ➔
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VESSEL CATALOGUE & COLLECTION ── */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold tracking-widest text-primary">
              பாத்திரங்கள் பட்டியல்
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              Vessel Catalogue & Event Essentials
            </h2>
            <p className="text-sm text-gray-500">
              Explore our extensive collection of cooking vessels, satti, moodi, karandi, boilers, and dining sets.
            </p>
          </div>

          <Link
            to="/bookings/new"
            className="self-start sm:self-auto bg-primary text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+ Create Booking / முன்பதிவு</span>
            <span>➔</span>
          </Link>
        </div>

        {/* Search input */}
        <div className="max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vessels (e.g. Satti, Deg, Karandi, Moodi)..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
            <span className="text-3xl block mb-2">🏺</span>
            <p className="text-sm">No vessels found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-blue-50 text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                    🏺
                  </span>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Cleaned & Polished Commercial Grade
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-gray-50">
                  <Link
                    to="/bookings/new"
                    className="w-full block text-center bg-blue-50 hover:bg-primary hover:text-white text-primary text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    Select for Booking / முன்பதிவு ➔
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase font-bold tracking-widest text-primary">
            எளிய 4 படிகள்
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
            How Rental Booking Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Pick Event Date', desc: 'Select your event date and return date for your celebration.' },
            { step: '02', title: 'Choose Vessels', desc: 'Pick exact quantities of Satti, Karandi, Moodi, Boilers, and serving plates.' },
            { step: '03', title: 'Pay Advance', desc: 'Confirm your booking with instant PDF receipt and transparent billing.' },
            { step: '04', title: 'Return & Settle', desc: 'Return vessels post-event with easy unit-by-unit count and clear balance billing.' },
          ].map((s, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
              <span className="text-4xl font-black text-gray-100 absolute top-2 right-3 select-none">
                {s.step}
              </span>
              <p className="text-xs font-bold text-amber-600 mb-1">Step {s.step}</p>
              <h3 className="font-bold text-base text-gray-800 mb-1.5">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT & LOCATION CALLOUT ── */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Contact & Direct Booking</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">{shop.name}</h2>
            <p className="text-xs sm:text-sm text-blue-200">📍 {shop.address}</p>
            <p className="text-xs sm:text-sm text-blue-200">📞 Phone: {shop.phone}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
              className="bg-white text-blue-900 font-bold px-6 py-3.5 rounded-xl text-center text-sm hover:bg-blue-50 transition-all shadow-md"
            >
              Direct Call Now
            </a>
            <Link
              to="/bookings/new"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3.5 rounded-xl text-center text-sm transition-all shadow-md"
            >
              Online Booking
            </Link>
          </div>
        </div>
      </section>

      {/* ── MODERN FOOTER WITH ADMIN LOGIN ── */}
      <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 px-4 sm:px-8 rounded-t-[2.5rem] mt-20 border-t border-gray-800">
        <div className="max-w-6xl mx-auto space-y-10">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Bio */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl">🏺</span>
                <span className="font-extrabold text-base">{shop.name}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Devakottai's premier catering vessels rental store. Providing spotless Satti, Moodi, Karandi, and full catering infrastructure for weddings, festivals, and parties.
              </p>
              <p className="text-[11px] text-amber-400/80 font-medium">
                சுபகாரியங்களுக்கு தேவையான அனைத்து வாடகை பாத்திரங்களும் சிறந்த முறையில் கிடைக்கும்.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">Home / முகப்பு</Link>
                </li>
                <li>
                  <Link to="/bookings/new" className="hover:text-white transition-colors">New Booking / புதிய முன்பதிவு</Link>
                </li>
                <li>
                  <a href="#vessels" className="hover:text-white transition-colors">Vessel Catalogue</a>
                </li>
              </ul>
            </div>

            {/* Col 3: Occasions */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Events Catered</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• Weddings & Receptions (திருமணம்)</li>
                <li>• Temple Festivals (கோவில் திருவிழா)</li>
                <li>• Annadhanam Feasts (அன்னதானம்)</li>
                <li>• Birthdays & Poojas (பிறந்தநாள்)</li>
              </ul>
            </div>

            {/* Col 4: Shop Address & Admin link */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Store Location</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {shop.address}
              </p>
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-white">Helpline:</span> {shop.phone}
              </p>
              <p className="text-[11px] text-gray-500">
                Open: All 7 Days (7:00 AM - 9:30 PM)
              </p>
            </div>
          </div>

          {/* Bottom Bar with Copyright & ADMIN LOGIN */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} {shop.name}. All rights reserved.</p>

            {/* ── ADMIN LOGIN LINK REQUIRED BY USER ── */}
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold border border-gray-700 transition-all shadow-sm group"
              >
                <span className="text-sm group-hover:scale-110 transition-transform">🔐</span>
                <span>Admin Login / நிர்வாகி உள்நுழைவு</span>
              </Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
