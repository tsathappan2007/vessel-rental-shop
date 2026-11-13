import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  CalendarCheck,
  Package,
  TrendingUp,
  AlertTriangle,
  Flame,
  Wallet,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  PlusCircle,
  IndianRupee,
  Activity
} from 'lucide-react';
import { getDashboardStats, getDateUtilization } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, u] = await Promise.all([getDashboardStats(), getDateUtilization()]);
        setStats(s.data.data);
        setUtilization(u.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-36 space-y-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-amber-400/20 border-t-amber-500 animate-spin" />
          <Activity className="w-6 h-6 text-amber-500 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase animate-pulse">
          Loading Store Intelligence...
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-md mx-auto text-center py-24 p-8 bg-white rounded-3xl border border-slate-200 shadow-md">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Failed to Load Dashboard</h3>
        <p className="text-xs text-slate-500 mt-1">{t('error_occurred')}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const barData = {
    labels: stats.monthlyTrend.map((m) => `${MN[m._id.month - 1]}'${String(m._id.year).slice(2)}`),
    datasets: [
      {
        label: 'Bookings',
        data: stats.monthlyTrend.map((m) => m.count),
        backgroundColor: 'rgba(245, 158, 11, 0.85)',
        hoverBackgroundColor: '#d97706',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const donutData = {
    labels: stats.statusDist.map((s) => s._id),
    datasets: [
      {
        data: stats.statusDist.map((s) => s.count),
        backgroundColor: ['#3b82f6', '#f59e0b', '#f97316', '#10b981'],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const lineData = {
    labels: utilization.slice(-14).map((u) => u.date.slice(5)),
    datasets: [
      {
        label: 'Stock Utilization %',
        data: utilization.slice(-14).map((u) => u.utilizationPercent),
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.12)',
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#0284c7',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(0,0,0,0.08)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        cornerRadius: 12,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
    },
  };

  const donutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#475569',
          font: { size: 11, weight: '600' },
          padding: 14,
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(0,0,0,0.08)',
        borderWidth: 1,
        cornerRadius: 12,
      },
    },
    cutout: '72%',
  };

  const rev = stats.revenueStats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* ── DASHBOARD HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-amber-200/80 shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Store Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('dashboard_title')} & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Real-time monitoring as of{' '}
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/bookings/new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('new_booking')}</span>
          </Link>

          <Link
            to="/bookings"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{t('nav_bookings')}</span>
          </Link>

          <Link
            to="/inventory"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>{t('nav_inventory')}</span>
          </Link>
        </div>
      </div>

      {/* ── TOP STAT METRICS (CARDS) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t('total_bookings'),
            value: stats.totalBookings,
            icon: CalendarCheck,
            color: 'border-blue-200 text-blue-600',
            iconBg: 'bg-blue-50 text-blue-600',
            sub: 'All-time reservations',
          },
          {
            label: t('active_bookings'),
            value: stats.activeBookings,
            icon: Flame,
            color: 'border-amber-200 text-amber-600',
            iconBg: 'bg-amber-50 text-amber-600',
            sub: 'Booked & Out on Event',
          },
          {
            label: t('total_inventory'),
            value: stats.totalInventory,
            icon: Package,
            color: 'border-emerald-200 text-emerald-600',
            iconBg: 'bg-emerald-50 text-emerald-600',
            sub: 'Unique vessel lines',
          },
          {
            label: t('low_stock_alerts'),
            value: stats.lowStockCount,
            icon: AlertTriangle,
            color: stats.lowStockCount > 0
              ? 'border-rose-300 bg-rose-50/50 text-rose-600'
              : 'border-slate-200 text-slate-600',
            iconBg: stats.lowStockCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600',
            sub: stats.lowStockCount > 0 ? 'Requires vendor backup' : 'Inventory healthy',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl bg-white border ${item.color} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {item.label}
                </span>
                <div className={`p-2 rounded-xl ${item.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</p>
                <p className="text-[11px] text-slate-500 mt-1">{item.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FINANCIAL MATRIX (REVENUE BREAKDOWN) ── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              {t('revenue_summary')}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">Indian Rupees (₹)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: t('total_revenue'),
              val: rev.totalRevenue,
              color: 'text-emerald-700',
              bg: 'bg-emerald-50/80 border-emerald-200',
              desc: 'Gross Booked Value',
            },
            {
              label: t('total_advance'),
              val: rev.totalAdvance,
              color: 'text-sky-700',
              bg: 'bg-sky-50/80 border-sky-200',
              desc: 'Advance Deposit Collected',
            },
            {
              label: 'Total Received (Post-Return)',
              val: rev.totalReceived,
              color: 'text-violet-700',
              bg: 'bg-violet-50/80 border-violet-200',
              desc: 'Final Balances Paid',
            },
            {
              label: t('total_balance'),
              val: rev.totalBalance,
              color: 'text-amber-700',
              bg: 'bg-amber-50/80 border-amber-200',
              desc: 'Outstanding Receivables',
            },
          ].map((r, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${r.bg} flex flex-col justify-between`}>
              <p className="text-xs font-semibold text-slate-700">{r.label}</p>
              <div className="my-2">
                <span className="text-xs text-slate-500 font-medium">₹ </span>
                <span className={`text-xl sm:text-2xl font-black ${r.color}`}>
                  {Number(r.val || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('monthly_trend')}
              </h2>
            </div>
            <span className="text-xs text-slate-500">Past 12 Months</span>
          </div>

          <div className="h-64 w-full">
            <Bar data={barData} options={chartOpts} />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t('status_distribution')}
            </h2>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {stats.statusDist.length > 0 ? (
              <Doughnut data={donutData} options={donutOpts} />
            ) : (
              <p className="text-slate-500 text-xs">{t('no_bookings')}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── 30-DAY CAPACITY UTILIZATION ── */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t('utilization')}
            </h2>
          </div>
          <span className="text-xs text-slate-500">Peak Rental Demand Timeline</span>
        </div>

        <div className="h-60 w-full">
          {utilization.length > 0 ? (
            <Line data={lineData} options={chartOpts} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              {t('no_bookings')}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM OPERATIONAL INTELLIGENCE PANELS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Busiest Dates */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('busiest_dates')}
              </h2>
            </div>
            <span className="text-xs text-slate-500">Top 10 High Demand Days</span>
          </div>

          {stats.busiestDates.length > 0 ? (
            <div className="space-y-2.5">
              {stats.busiestDates.map((d, idx) => (
                <div
                  key={d.date}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{d.date}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-600" />
                    <span>{d.count} bookings</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs py-4">{t('no_bookings')}</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('low_stock_alerts')}
              </h2>
            </div>
            <span className="text-xs text-slate-500">Active Stock Shortage Radar</span>
          </div>

          {stats.lowStockItems.length > 0 ? (
            <div className="space-y-2.5">
              {stats.lowStockItems.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-rose-800">{item.name}</p>
                    <p className="text-[11px] text-rose-600">
                      Available: {item.availableStock} / Total: {item.totalStock}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200">
                    Low Stock Alert
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <p className="text-sm font-bold text-emerald-700">✅ All Stock Levels Healthy</p>
              <p className="text-xs text-emerald-600">
                Sufficient stock available for today's active event schedules.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
