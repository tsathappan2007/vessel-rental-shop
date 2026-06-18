import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDashboardStats, getDateUtilization } from '../services/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, ArcElement, Title, Tooltip, Legend,
  PointElement, LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, PointElement, LineElement
);

const StatCard = ({ label, value, icon, border, sub }) => (
  <div className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${border} flex items-center gap-3 active:scale-95 transition-transform`}>
    <div className="text-3xl flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 leading-tight">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm p-4">
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
    {children}
  </div>
);

export default function Dashboard() {
  const { t }                       = useTranslation();
  const [stats, setStats]           = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, u] = await Promise.all([getDashboardStats(), getDateUtilization()]);
        setStats(s.data.data);
        setUtilization(u.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );

  if (!stats) return (
    <p className="text-center py-20 text-red-500 text-sm">{t('error_occurred')}</p>
  );

  const MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const barData = {
    labels: stats.monthlyTrend.map((m) => `${MN[m._id.month - 1]}'${String(m._id.year).slice(2)}`),
    datasets: [{
      data: stats.monthlyTrend.map((m) => m.count),
      backgroundColor: 'rgba(37,99,235,0.75)',
      borderRadius: 6,
    }],
  };

  const donutData = {
    labels: stats.statusDist.map((s) => s._id),
    datasets: [{
      data: stats.statusDist.map((s) => s.count),
      backgroundColor: ['#2563eb','#f59e0b','#f97316','#22c55e'],
      borderWidth: 2,
    }],
  };

  const lineData = {
    labels: utilization.slice(-14).map((u) => u.date.slice(5)),
    datasets: [{
      label: '%',
      data: utilization.slice(-14).map((u) => u.utilizationPercent),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245,158,11,0.15)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    }],
  };

  const chartOpts = (legend = false) => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: legend, position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } },
    scales: { x: { ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } },
  });

  const donutOpts = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } },
  };

  const rev = stats.revenueStats;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-primary">{t('dashboard_title')}</h1>

      {/* Stat cards — 2 col on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label={t('total_bookings')}  value={stats.totalBookings}  icon="📋" border="border-blue-500" />
        <StatCard label={t('total_inventory')} value={stats.totalInventory} icon="🏺" border="border-green-500" />
        <StatCard label={t('active_bookings')} value={stats.activeBookings} icon="✅" border="border-yellow-500" />
        <StatCard label={t('low_stock_alerts')} value={stats.lowStockCount} icon="⚠️" border="border-red-500" />
      </div>

      {/* Revenue — 1 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('total_revenue'),  val: rev.totalRevenue,  color: 'text-green-600' },
          { label: t('total_advance'),  val: rev.totalAdvance,  color: 'text-blue-600'  },
          { label: 'Total Received',    val: rev.totalReceived, color: 'text-indigo-600' },
          { label: t('total_balance'),  val: rev.totalBalance,  color: 'text-orange-600' },
        ].map((r) => (
          <div key={r.label} className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 leading-tight">{r.label}</p>
            <p className={`text-lg font-bold ${r.color} mt-1 leading-tight`}>
              Rs.&nbsp;{Number(r.val || 0).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title={t('monthly_trend')}>
          <Bar data={barData} options={chartOpts(false)} />
        </Card>
        <Card title={t('status_distribution')}>
          {stats.statusDist.length > 0
            ? <Doughnut data={donutData} options={donutOpts} />
            : <p className="text-center text-gray-400 py-8 text-sm">{t('no_bookings')}</p>
          }
        </Card>
      </div>

      <Card title={t('utilization')}>
        {utilization.length > 0
          ? <Line data={lineData} options={{ ...chartOpts(false), scales: { x: { ticks: { font: { size: 9 } } }, y: { ticks: { font: { size: 10 } } } } }} />
          : <p className="text-center text-gray-400 py-8 text-sm">{t('no_bookings')}</p>
        }
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Busiest dates */}
        <Card title={t('busiest_dates')}>
          {stats.busiestDates.length > 0 ? (
            <div className="space-y-2">
              {stats.busiestDates.map((d) => (
                <div key={d.date} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium">{d.date}</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                    {d.count} bookings
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">{t('no_bookings')}</p>}
        </Card>

        {/* Low stock */}
        <Card title={t('low_stock_alerts')}>
          {stats.lowStockItems.length > 0 ? (
            <div className="space-y-2">
              {stats.lowStockItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                  <span className="text-sm font-medium text-red-800 truncate">{item.name}</span>
                  <span className="text-xs text-red-600 flex-shrink-0 ml-2">Qty: {item.totalStock}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600 font-medium text-sm">✅ All stock levels healthy</p>
          )}
        </Card>
      </div>
    </div>
  );
}