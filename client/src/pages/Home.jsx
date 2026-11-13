import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  UtensilsCrossed,
  Flame,
  Award,
  Users,
  Lock,
  ArrowRight,
  Search,
  Soup,
  Coffee,
  Check,
  ChefHat
} from 'lucide-react';
import { getInventory, getShopInfo } from '../services/api';

// Curated high-res imagery for the sliding hero carousel & celebrations
const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1600&q=85',
    title: 'Grand Feast Cooking Vessels',
    tamilTitle: 'பாரம்பரிய சமையல் சட்டி & பிரியாணி தேக்',
    subtitle: 'Heavy-duty aluminum, brass & stainless steel cauldrons engineered for massive wedding feasts & family celebrations.',
    badge: 'WEDDINGS & RECEPTIONS',
    vessels: 'Biryani Deg • Dum Covers • Kedaari'
  },
  {
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
    title: 'Festivals & Annadhanam Essentials',
    tamilTitle: 'கோவில் திருவிழா & அன்னதான பாத்திரங்கள்',
    subtitle: 'Extra-large capacity cooking pots, giant Thuzhavu Karandi, and boiling tubs tailored for non-stop community feeding.',
    badge: 'TEMPLE FESTIVALS & ANNADHANAM',
    vessels: 'Anda • Pongal Paanai • Long Karandi'
  },
  {
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1600&q=85',
    title: 'Pristine Polished Serving Sets',
    tamilTitle: 'பளபளக்கும் பரிமாறும் பாத்திரங்கள் & கரண்டிகள்',
    subtitle: 'Thoroughly sanitized and mirror-polished serving buckets, sambar tubs, chafing dishes, and dining plate collections.',
    badge: 'HYGIENICALLY SANITIZED',
    vessels: 'Sambar Buckets • Dining Plates • Chafing Dishes'
  },
  {
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1600&q=85',
    title: 'Hot Beverage & Idli Infrastructure',
    tamilTitle: 'டீ, காபி பாய்லர் & இட்லி கொப்பரை',
    subtitle: 'Heavy-capacity double-walled tea & coffee boilers, commercial Idli Kopparai, and water storage drums.',
    badge: 'HOT BUFFET INFRASTRUCTURE',
    vessels: 'Tea Boilers 20L-100L • Idli Kopparai'
  }
];

const MARQUEE_ITEMS = [
  '🍲 பிரியாணி தேக் (Biryani Deg)',
  '🥘 சமையல் சட்டி (Cooking Satti)',
  '🥄 துழாவு கரண்டி (Thuzhavu Karandi)',
  '☕ டீ பாய்லர் (Tea Boilers 20L-100L)',
  '🍳 சல்லி கரண்டி (Salli Karandi)',
  '🍽️ சாப்பாட்டு தட்டு (Dining Plates)',
  '🥣 சாம்பார் வாளி (Sambar Buckets)',
  '🥟 இட்லி கொப்பரை (Idli Kopparai)',
  '🪣 தண்ணீர் டிரம்கள் (Water Drums)',
  '🥘 தம் மூடி (Dum Lids & Covers)',
  '🔥 கமர்ஷியல் அடுப்பு (Commercial Stoves)',
  '🏺 பித்தளை உருளி (Brass Uruli)'
];

const OCCASIONS = [
  {
    title: 'Weddings & Receptions',
    tamil: 'திருமண விழா & வரவேற்பு',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    desc: 'Grand multi-course feast setups for 200 to 5,000+ guests. Complete biryani cooking degs, dum covers, and dining plate sets.',
    highlight: 'Full Feast Package',
  },
  {
    title: 'Temple Festivals & Annadhanam',
    tamil: 'கோவில் திருவிழா & அன்னதானம்',
    image: 'https://images.unsplash.com/photo-1609137144822-44f2d3a37b3d?auto=format&fit=crop&w=800&q=80',
    desc: 'Massive cooking cauldrons, pongal paanai, boiling tubs, and sturdy long-handled ladles for mass prasadam preparation.',
    highlight: 'Mega Scale Capacity',
  },
  {
    title: 'Birthdays & Private Parties',
    tamil: 'பிறந்தநாள் & சுபநிகழ்ச்சிகள்',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    desc: 'Medium-sized pots, modern food warmers, dessert bowls, and stainless steel snack vessels for family gatherings.',
    highlight: 'Intimate & Modern',
  },
  {
    title: 'Housewarming & Poojas',
    tamil: 'கிரகப்பிரவேசம் & பூஜைகள்',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    desc: 'Traditional milk-boiling vessels, brass uruli, payasam pots, and sanitized serving utensils for sacred rituals.',
    highlight: 'Traditional Sacred Sets',
  },
];

export default function Home() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [shop, setShop] = useState({
    name: 'Amman Vessels Rental Shop',
    phone: '+91 9443401815',
    address: '110 N-1, Manthoppu Street, Devakottai - 630302',
  });
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const timerRef = useRef(null);

  // Auto-advance hero slides
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => clearInterval(timerRef.current);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  // Load inventory & shop details
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

  const filteredItems = inventory.filter((item) => {
    return item.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-20 pb-16 overflow-hidden">
      {/* ── HERO SECTION WITH SLIDING IMAGES ── */}
      <section className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center justify-center overflow-hidden rounded-b-[3rem] shadow-2xl bg-slate-950">
        {/* Background Images with smooth fade transition */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-105 transition-transform duration-10000 ease-out"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
          </div>
        ))}

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center sm:text-left flex flex-col justify-center min-h-[580px]">
          <div className="space-y-6">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs sm:text-sm font-semibold text-amber-300 shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{HERO_SLIDES[currentSlide].badge}</span>
              <span className="text-white/40">•</span>
              <span className="text-slate-200">Devakottai</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {HERO_SLIDES[currentSlide].title}
              </h1>
              <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                {HERO_SLIDES[currentSlide].tamilTitle}
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {HERO_SLIDES[currentSlide].subtitle}
            </p>

            {/* Quick Vessel Specs */}
            <div className="inline-block px-4 py-2 rounded-2xl bg-slate-900/70 border border-white/15 backdrop-blur-md text-xs sm:text-sm text-slate-200">
              <span className="text-amber-400 font-bold">Featured Essentials:</span>{' '}
              {HERO_SLIDES[currentSlide].vessels}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <Link
                to="/bookings/new"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Reserve Vessels for Event / முன்பதிவு</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#catalogue"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base backdrop-blur-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>View Catalogue / பாத்திரங்கள்</span>
              </a>

              <a
                href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Store</span>
              </a>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all z-20 group"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all z-20 group"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Slide Indicators / Thumbnails */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-slate-950/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-8 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── INFINITE SLIDING MARQUEE TICKER ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3.5 shadow-lg transform -rotate-1">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 font-black text-slate-950 text-sm tracking-wide">
          {MARQUEE_ITEMS.concat(MARQUEE_ITEMS).map((item, idx) => (
            <span key={idx} className="flex items-center gap-4">
              <span>{item}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950/40" />
            </span>
          ))}
        </div>
      </div>

      {/* ── TAMIL SLANG & SIGNATURE SPECIALTY SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold tracking-wider uppercase">
            <span>🏺</span>
            <span>பாரம்பரிய & நவீன பாத்திரங்கள்</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Specialty Vessels in Tamil Tradition
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            From the authentic <span className="text-amber-300 font-semibold">Satti, Moodi, and Karandi</span> to modern hot buffet boilers — complete cooking and catering infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'சமையல் சட்டி & தேக்',
              english: 'Cooking Cauldrons & Degs',
              desc: 'Heavy-gauge Biryani Dum Degs (10kg to 100kg), Kedaari, Uruli, Vada Chatti, and large Saadam Anda.',
              icon: Soup,
              tag: 'Cooking Pots',
              gradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/30'
            },
            {
              title: 'கரண்டி வகைகள்',
              english: 'Feast Ladles & Stirrers',
              desc: 'Extra long-handled Thuzhavu Karandi, Salli Karandi for deep frying, Sambar Thuppi, and Halwa paddles.',
              icon: UtensilsCrossed,
              tag: 'Stirring & Serving',
              gradient: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30'
            },
            {
              title: 'மூடி & தட்டுகள்',
              english: 'Dum Lids & Plates',
              desc: 'Heavy-gauge Dum Moodi for airtight aroma trapping, Sapphire meals plates, serving trays, and snack bowls.',
              icon: Award,
              tag: 'Covers & Dining',
              gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30'
            },
            {
              title: 'டீ பாய்லர் & கொப்பரை',
              english: 'Boilers & Food Warmers',
              desc: 'Commercial Tea/Coffee Boilers (20L to 100L), Idli Kopparai, stainless steel water drums, and chafing dishes.',
              icon: Coffee,
              tag: 'Hot Buffets',
              gradient: 'from-purple-500/20 to-pink-500/10 border-purple-500/30'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`group p-6 rounded-3xl bg-slate-900/80 border ${item.gradient} hover:border-amber-400/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90">
                      {item.tag}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{item.english}</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Available for Rent</span>
                  <span className="group-hover:translate-x-1 transition-transform">➔</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── OCCASIONS SLIDING GALLERY ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span>🎉</span>
              <span>சுபகாரிய நிகழ்வுகள்</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Tailored for Every Occasion
            </h2>
            <p className="text-sm text-slate-400">
              We cater complete vessel infrastructure for intimate ceremonies to mega gatherings.
            </p>
          </div>

          <Link
            to="/bookings/new"
            className="self-start sm:self-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            <span>+ Book for Your Event</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {OCCASIONS.map((occ, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 hover:border-amber-400/50 shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image with zoom effect */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={occ.image}
                  alt={occ.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-amber-300 border border-white/10 backdrop-blur-md">
                  {occ.highlight}
                </span>
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {occ.title}
                  </h3>
                  <p className="text-xs text-amber-400 font-semibold mb-2">{occ.tamil}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{occ.desc}</p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <Link
                    to="/bookings/new"
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 group-hover:shadow-lg"
                  >
                    <span>Reserve Event Set</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VESSEL CATALOGUE & SEARCH SECTION (NO PRICE, NO STOCK) ── */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 shadow-2xl">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              பாத்திரங்கள் பட்டியல்
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Vessel Catalogue & Event Essentials
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Browse our verified, food-grade polished inventory available for instant online reservation.
            </p>
          </div>

          <div className="w-full sm:w-auto min-w-[280px]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Satti, Karandi, Boiler, Moodi..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all backdrop-blur-md"
              />
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl p-12 text-center text-slate-400 border border-white/10 backdrop-blur-xl">
            <ChefHat className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">No vessels found matching your search</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for Satti, Karandi, Boiler or Plates</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="group bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-amber-400/40 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all duration-300">
                      <Soup className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Commercial Event Grade
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hygienically Sanitized & Polished</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  <Link
                    to="/bookings/new"
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Select for Booking / முன்பதிவு</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 4-STEP BOOKING WORKFLOW ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            எளிய 4 படிகள்
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            How Rental Booking Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Hassle-free reservations with complete transparency from booking to return.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Pick Event Date',
              tamil: 'தேதி தேர்வு',
              desc: 'Select your event date and return date for your celebration.',
            },
            {
              step: '02',
              title: 'Choose Vessels',
              tamil: 'பாத்திரங்கள் தேர்வு',
              desc: 'Select exact counts of Satti, Karandi, Moodi, Boilers, and plates.',
            },
            {
              step: '03',
              title: 'Confirm Booking',
              tamil: 'முன்பதிவு உறுதி',
              desc: 'Confirm your reservation with immediate dynamic PDF receipt.',
            },
            {
              step: '04',
              title: 'Return & Settle',
              tamil: 'திரும்ப ஒப்படைப்பு',
              desc: 'Return vessels post-event with easy unit verification and final settlement.',
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl transition-all duration-300 group overflow-hidden"
            >
              <div className="text-5xl font-black text-white/5 absolute top-3 right-4 select-none group-hover:text-amber-400/10 transition-colors">
                {s.step}
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-3">
                Step {s.step} • {s.tamil}
              </span>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LOCATION & DIRECT CALL HERO BANNER ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 p-8 sm:p-12 text-slate-950 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left z-10">
            <span className="px-3 py-1 rounded-full bg-slate-950/10 text-slate-950 text-xs font-black uppercase tracking-wider">
              DIRECT STORE ASSISTANCE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">{shop.name}</h2>
            <div className="text-xs sm:text-sm font-semibold space-y-1 text-slate-900/90">
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <MapPin className="w-4 h-4" />
                <span>{shop.address}</span>
              </p>
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <Clock className="w-4 h-4" />
                <span>Open 7 Days a Week: 7:00 AM - 9:30 PM</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
            <a
              href={`tel:${shop.phone.replace(/[^0-9+]/g, '')}`}
              className="px-6 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-sm shadow-xl active:scale-95 transition-all text-center flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Helpline</span>
            </a>

            <Link
              to="/bookings/new"
              className="px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Book Online ➔</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── MODERN FOOTER (WITH EXCLUSIVE ADMIN LOGIN) ── */}
      <footer className="border-t border-white/10 bg-slate-950 pt-16 pb-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Col 1 */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 shadow-md">
                  <ChefHat className="w-5 h-5" />
                </div>
                <span className="font-black text-lg text-white">{shop.name}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Devakottai’s premier event and wedding vessels rental center. Supplying heavy-gauge Satti, Moodi, Karandi, Boilers, and dining plate sets.
              </p>
              <p className="text-xs text-amber-400/90 font-medium">
                சுபகாரியங்களுக்கு தேவையான அனைத்து வாடகை பாத்திரங்களும் சிறந்த முறையில் கிடைக்கும்.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <Link to="/" className="hover:text-amber-400 transition-colors">Home / முகப்பு</Link>
                </li>
                <li>
                  <Link to="/bookings/new" className="hover:text-amber-400 transition-colors">Reserve Vessels / முன்பதிவு</Link>
                </li>
                <li>
                  <a href="#catalogue" className="hover:text-amber-400 transition-colors">Vessel Catalogue</a>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Occasions</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>• Weddings & Receptions (திருமணம்)</li>
                <li>• Temple Festivals (கோவில் திருவிழா)</li>
                <li>• Annadhanam Feasts (அன்னதானம்)</li>
                <li>• Birthdays & Poojas (பிறந்தநாள்)</li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Store Location</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{shop.address}</p>
              <p className="text-xs text-slate-300 font-semibold">Phone: {shop.phone}</p>
              <p className="text-[11px] text-slate-500">Hours: Mon-Sun: 7:00 AM - 9:30 PM</p>
            </div>
          </div>

          {/* Bottom Bar with Copyright & ADMIN LOGIN EXCLUSIVELY HERE */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {shop.name}. All rights reserved.</p>

            {/* ── ADMIN LOGIN (EXCLUSIVE TO FOOTER) ── */}
            <div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-400/40 text-xs font-bold transition-all shadow-md group"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Admin Login / நிர்வாகி உள்நுழைவு</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
