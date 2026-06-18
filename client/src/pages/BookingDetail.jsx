import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBookingById, updateBooking, updateReturn, downloadPDF } from '../services/api';

const STATUS_OPTIONS = ['Booked','Issued','Partially Returned','Returned'];
const STATUS_COLORS  = {
  Booked:               'bg-blue-100 text-blue-800',
  Issued:               'bg-yellow-100 text-yellow-800',
  'Partially Returned': 'bg-orange-100 text-orange-800',
  Returned:             'bg-green-100 text-green-800',
};

function FinancialPanel({ booking, onUpdate }) {
  const { t }                   = useTranslation();
  const [received, setReceived] = useState(Number(booking.receivedAmount || 0));
  const [saving, setSaving]     = useState(false);

  const total   = Number(booking.totalAmount   || 0);
  const advance = Number(booking.advanceAmount || 0);
  const balance = total - advance - received;

  const handleSave = async () => {
    setSaving(true);
    try { await updateBooking(booking._id, { receivedAmount: received }); toast.success('Payment updated'); onUpdate(); }
    catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <h2 className="text-base font-bold text-gray-700">💰 {t('financial_summary')}</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-1.5 border-b">
          <span className="text-gray-500">Total Amount</span>
          <span className="font-bold">Rs. {total.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b">
          <span className="text-gray-500">Advance Paid</span>
          <span className="font-bold text-green-600">Rs. {advance.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-700">Amount Received After Return (Rs.)</p>
        <div className="flex gap-2">
          <input type="number" inputMode="numeric" min={0} value={received}
            onChange={(e) => setReceived(Number(e.target.value) || 0)}
            className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={handleSave} disabled={saving}
            className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-50">
            {saving ? '...' : 'Update'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Collected: Rs. {(advance + received).toLocaleString('en-IN')}
          {' '}(Advance Rs. {advance.toLocaleString('en-IN')} + Received Rs. {received.toLocaleString('en-IN')})
        </p>
      </div>

      <div className={`flex justify-between items-center px-4 py-3 rounded-xl border ${
        balance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
      }`}>
        <span className="font-bold text-gray-700">Balance Due</span>
        <span className={`font-bold text-xl ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
          Rs. {balance.toLocaleString('en-IN')}
          {balance <= 0 && <span className="ml-1 text-sm">✅</span>}
        </span>
      </div>
    </div>
  );
}

export default function BookingDetail() {
  const { t }  = useTranslation();
  const { id } = useParams();
  const [booking, setBooking]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [returnedItems, setReturnedItems] = useState([]);
  const [newStatus, setNewStatus]         = useState('');

  const load = async () => {
    try {
      const res = await getBookingById(id);
      setBooking(res.data.data);
      setReturnedItems(res.data.data.items.map((i) => ({
        itemId: i.itemId?._id || i.itemId,
        returnedQuantity: i.returnedQuantity || 0,
      })));
      setNewStatus(res.data.data.status);
    } catch { toast.error(t('error_occurred')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleReturnUpdate = async () => {
    try { await updateReturn(id, { returnedItems }); toast.success(t('success_saved')); load(); }
    catch { toast.error(t('error_occurred')); }
  };

  const handleStatusUpdate = async () => {
    try { await updateBooking(id, { status: newStatus }); toast.success(t('success_saved')); load(); }
    catch { toast.error(t('error_occurred')); }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
  if (!booking) return (
    <p className="text-center py-20 text-red-500 text-sm">{t('error_occurred')}</p>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Link to="/bookings" className="text-gray-400 hover:text-gray-600 flex-shrink-0">←</Link>
          <h1 className="font-bold text-primary font-mono text-lg">{booking.bookingNumber}</h1>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[booking.status]}`}>
            {booking.status}
          </span>
        </div>
        <div className="flex gap-2">
          <a href={downloadPDF(booking._id)} target="_blank" rel="noreferrer"
            className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm">
            📥 PDF
          </a>
          <Link to={`/bookings/${id}/print`}
            className="bg-gray-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-800 active:scale-95 transition-all shadow-sm">
            🖨️ Print
          </Link>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-700 mb-3">👤 Customer Details</h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          {[
            [t('customer_name'), booking.customerName],
            [t('phone'),         booking.phone],
            [t('event_date'),    new Date(booking.eventDate).toLocaleDateString('en-IN')],
            booking.returnDate && [t('return_date'), new Date(booking.returnDate).toLocaleDateString('en-IN')],
            [t('event_type'),    booking.eventType],
          ].filter(Boolean).map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium text-gray-800">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-700 mb-3">🏺 {t('items_booked')}</h2>
        <div className="space-y-3">
          {booking.items.map((item, i) => {
            const ret     = returnedItems.find((r) => r.itemId === (item.itemId?._id || item.itemId));
            const retQty  = ret?.returnedQuantity || 0;
            const missing = item.quantity - retQty;
            return (
              <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-sm text-gray-800">{item.itemName}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    missing > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {missing > 0 ? `-${missing}` : '✅'}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex-1 text-xs text-gray-500">
                    Booked: <strong className="text-gray-700">{item.quantity}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 flex-shrink-0">{t('returned_qty')}:</label>
                    <input type="number" inputMode="numeric" min={0} max={item.quantity} value={retQty}
                      onChange={(e) => {
                        const upd = returnedItems.map((r) =>
                          r.itemId === (item.itemId?._id || item.itemId)
                            ? { ...r, returnedQuantity: parseInt(e.target.value) || 0 }
                            : r
                        );
                        setReturnedItems(upd);
                      }}
                      className="w-16 border rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={handleReturnUpdate}
          className="mt-3 w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-800 active:scale-95 transition-all">
          {t('update_return')}
        </button>
      </div>

      {/* Shortage */}
      {booking.shortageItems?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <h2 className="text-sm font-bold text-orange-700 mb-2">⚠️ {t('shortage_items')}</h2>
          {booking.shortageItems.map((s, i) => (
            <p key={i} className="text-sm text-orange-700">• {s.itemName}: {s.shortageQty} units from external vendor</p>
          ))}
        </div>
      )}

      {/* Financial */}
      <FinancialPanel booking={booking} onUpdate={load} />

      {/* Status */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-700 mb-3">🔄 {t('update_status')}</h2>
        <div className="flex gap-2">
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
            className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={handleStatusUpdate}
            className="bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all">
            {t('save')}
          </button>
        </div>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-medium text-gray-400 mb-1">{t('notes')}</p>
          <p className="text-sm text-gray-700">{booking.notes}</p>
        </div>
      )}
    </div>
  );
}