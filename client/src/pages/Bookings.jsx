import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBookings, deleteBooking, downloadPDF } from '../services/api';

const STATUS_COLORS = {
  Booked:             'bg-blue-100 text-blue-800',
  Issued:             'bg-yellow-100 text-yellow-800',
  'Partially Returned': 'bg-orange-100 text-orange-800',
  Returned:           'bg-green-100 text-green-800',
};

export default function Bookings() {
  const { t } = useTranslation();
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch]         = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate)   params.date   = filterDate;
      if (search)       params.search = search;
      const res = await getBookings(params);
      setBookings(res.data.data);
    } catch { toast.error(t('error_occurred')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus, filterDate, search]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_confirm'))) return;
    try { await deleteBooking(id); toast.success(t('success_deleted')); load(); }
    catch { toast.error(t('error_occurred')); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-primary">{t('bookings_title')}</h1>
        <Link to="/bookings/new"
          className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 active:scale-95 transition-all shadow-sm">
          + {t('new_booking')}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <input type="text" placeholder={t('search_placeholder')} value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <div className="flex gap-2 flex-wrap">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 min-w-[130px] border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">{t('all')} {t('status')}</option>
            <option value="Booked">{t('status_booked')}</option>
            <option value="Issued">{t('status_issued')}</option>
            <option value="Partially Returned">{t('status_partial')}</option>
            <option value="Returned">{t('status_returned')}</option>
          </select>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            className="flex-1 min-w-[140px] border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {(filterStatus || filterDate || search) && (
            <button onClick={() => { setFilterStatus(''); setFilterDate(''); setSearch(''); }}
              className="px-3 py-2.5 text-sm text-gray-500 underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">
          {t('no_bookings')}
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-primary text-sm font-mono">{b.bookingNumber}</p>
                    <p className="font-semibold text-gray-800 mt-0.5">{b.customerName}</p>
                    <p className="text-xs text-gray-500">{b.phone}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-700'}`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>📅 {new Date(b.eventDate).toLocaleDateString('en-IN')}</span>
                  <span className="font-semibold text-gray-700">Rs. {b.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Link to={`/bookings/${b._id}`}
                    className="flex-1 text-center bg-blue-50 text-blue-700 py-2.5 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-all">
                    👁️ {t('view_details')}
                  </Link>
                  <a href={downloadPDF(b._id)} target="_blank" rel="noreferrer"
                    className="flex-1 text-center bg-green-50 text-green-700 py-2.5 rounded-xl text-xs font-semibold hover:bg-green-100 transition-all">
                    📥 PDF
                  </a>
                  <button onClick={() => handleDelete(b._id)}
                    className="flex-1 bg-red-50 text-red-700 py-2.5 rounded-xl text-xs font-semibold hover:bg-red-100 transition-all">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">{t('booking_number')}</th>
                  <th className="px-4 py-3">{t('customer_name')}</th>
                  <th className="px-4 py-3">{t('phone')}</th>
                  <th className="px-4 py-3">{t('event_date')}</th>
                  <th className="px-4 py-3">{t('total_amount')}</th>
                  <th className="px-4 py-3">{t('status')}</th>
                  <th className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-blue-700 font-semibold">{b.bookingNumber}</td>
                    <td className="px-4 py-3 font-medium">{b.customerName}</td>
                    <td className="px-4 py-3 text-gray-500">{b.phone}</td>
                    <td className="px-4 py-3">{new Date(b.eventDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 font-semibold">Rs. {b.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[b.status] || 'bg-gray-100'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/bookings/${b._id}`}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all">
                          {t('view_details')}
                        </Link>
                        <a href={downloadPDF(b._id)} target="_blank" rel="noreferrer"
                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-all">
                          PDF
                        </a>
                        <button onClick={() => handleDelete(b._id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-all">
                          {t('delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}