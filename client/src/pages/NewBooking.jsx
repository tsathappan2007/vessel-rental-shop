import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getInventory, checkAvailability, createBooking } from '../services/api';

const EVENT_TYPES = ['Wedding','Temple Festival','Birthday','Corporate','Other'];

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
    <h2 className="text-base font-bold text-gray-700">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

export default function NewBooking() {
  const { t }      = useTranslation();
  const navigate   = useNavigate();
  const [inventory, setInventory]   = useState([]);
  const [form, setForm]             = useState({
    customerName: '', phone: '', eventDate: '',
    returnDate: '', eventType: 'Wedding', advanceAmount: '', notes: '',
  });
  const [itemRows, setItemRows]         = useState([{ itemId: '', quantity: 1 }]);
  const [availability, setAvailability] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => {
    getInventory().then((r) => setInventory(r.data.data)).catch(() => {});
  }, []);

  const set      = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const addRow   = () => setItemRows([...itemRows, { itemId: '', quantity: 1 }]);
  const removeRow = (i) => setItemRows(itemRows.filter((_, idx) => idx !== i));
  const updateRow = (i, f, v) => {
    const r = [...itemRows]; r[i] = { ...r[i], [f]: v };
    setItemRows(r); setAvailability(null);
  };

  const getPrice   = (id) => inventory.find((i) => i._id === id)?.pricePerUnit || 0;
  const getRowTotal = (row) => row.itemId ? getPrice(row.itemId) * Number(row.quantity || 0) : 0;
  const grandTotal  = itemRows.reduce((s, r) => s + getRowTotal(r), 0);
  const advance     = Number(form.advanceAmount || 0);
  const balance     = grandTotal - advance;

  const handleCheck = async () => {
    if (!form.eventDate) { toast.warning('Select event date'); return; }
    if (form.returnDate && form.returnDate < form.eventDate) {
      toast.warning('Return date cannot be earlier than event date');
      return;
    }
    const valid = itemRows.filter((r) => r.itemId && r.quantity > 0);
    if (!valid.length) { toast.warning('Add at least one item'); return; }
    setCheckLoading(true);
    try {
      const r = await checkAvailability({
        eventDate: form.eventDate,
        returnDate: form.returnDate || null,
        items: valid,
      });
      setAvailability(r.data);
    } catch { toast.error(t('error_occurred')); }
    finally { setCheckLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.customerName || !form.phone || !form.eventDate) {
      toast.warning('Fill all required fields'); return;
    }
    if (form.returnDate && form.returnDate < form.eventDate) {
      toast.warning('Return date cannot be earlier than event date');
      return;
    }
    if (advance > grandTotal && grandTotal > 0) {
      toast.warning('Advance amount cannot exceed total amount');
      return;
    }
    const valid = itemRows.filter((r) => r.itemId && r.quantity > 0);
    if (!valid.length) { toast.warning('Add at least one item'); return; }
    setSubmitting(true);
    try {
      const res = await createBooking({ ...form, totalAmount: grandTotal, items: valid });
      toast.success(t('booking_created'));
      navigate(`/bookings/${res.data.data._id}`);
    } catch (e) { toast.error(e.response?.data?.message || t('error_occurred')); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-primary">{t('new_booking')}</h1>

      {/* Customer */}
      <Section title="👤 Customer Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={`${t('customer_name')} *`}>
            <input name="customerName" value={form.customerName} onChange={set} className={inputCls} />
          </Field>
          <Field label={`${t('phone')} *`}>
            <input name="phone" value={form.phone} onChange={set} inputMode="tel" className={inputCls} />
          </Field>
          <Field label={`${t('event_date')} *`}>
            <input type="date" name="eventDate" value={form.eventDate} onChange={set} className={inputCls} />
          </Field>
          <Field label={t('return_date')}>
            <input type="date" name="returnDate" value={form.returnDate} onChange={set} className={inputCls} />
          </Field>
          <Field label={t('event_type')}>
            <select name="eventType" value={form.eventType} onChange={set} className={inputCls}>
              {EVENT_TYPES.map((e) => <option key={e}>{e}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      {/* Items */}
      <Section title={`🏺 ${t('items')}`}>
        <div className="space-y-3">
          {itemRows.map((row, i) => {
            const price = getPrice(row.itemId);
            const sub   = getRowTotal(row);
            return (
              <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">Item {i + 1}</p>
                  {itemRows.length > 1 && (
                    <button onClick={() => removeRow(i)}
                      className="text-red-500 text-lg leading-none hover:text-red-700 w-7 h-7 flex items-center justify-center">
                      ×
                    </button>
                  )}
                </div>
                <select value={row.itemId} onChange={(e) => updateRow(i, 'itemId', e.target.value)}
                  className={inputCls}>
                  <option value="">-- Select Item --</option>
                  {inventory.map((item) => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
                </select>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">{t('quantity')}</p>
                    <input type="number" inputMode="numeric" min={1} value={row.quantity}
                      onChange={(e) => updateRow(i, 'quantity', parseInt(e.target.value) || 1)}
                      className={inputCls} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Price/Unit</p>
                    <div className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-100 text-gray-600">
                      {row.itemId ? `Rs. ${price.toLocaleString('en-IN')}` : '—'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                    <div className="w-full border rounded-xl px-3 py-2.5 text-sm bg-green-50 font-bold text-green-700">
                      {row.itemId ? `Rs. ${sub.toLocaleString('en-IN')}` : '—'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={addRow}
          className="w-full border-2 border-dashed border-blue-300 text-blue-600 py-3 rounded-xl text-sm font-semibold hover:border-blue-400 hover:bg-blue-50 transition-all">
          {t('add_item_row')}
        </button>

        <button onClick={handleCheck} disabled={checkLoading}
          className="w-full bg-secondary text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
          {checkLoading ? t('loading') : `🔍 ${t('check_stock')}`}
        </button>

        {/* Availability result */}
        {availability && (
          <div className={`rounded-xl p-3 border text-sm ${
            availability.available ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            {availability.available ? (
              <p className="text-green-700 font-semibold">✅ {t('stock_ok')}</p>
            ) : (
              <>
                <p className="text-red-700 font-bold mb-1">⚠️ {t('shortage_warning')}</p>
                {availability.shortages.map((s, i) => (
                  <p key={i} className="text-red-600 text-xs">
                    • {s.itemName}: Need {s.shortageQty} more
                    {s.externalVendor && ` (${s.externalVendor})`}
                  </p>
                ))}
              </>
            )}
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs min-w-[400px]">
                <thead>
                  <tr className="bg-white bg-opacity-60">
                    <th className="text-left px-2 py-1">Item</th>
                    <th className="px-2 py-1">Avail</th>
                    <th className="px-2 py-1">Req</th>
                    <th className="px-2 py-1">OK?</th>
                  </tr>
                </thead>
                <tbody>
                  {availability.details?.map((d) => (
                    <tr key={d.itemId} className="border-t">
                      <td className="px-2 py-1 font-medium">{d.name}</td>
                      <td className="px-2 py-1 text-center">{d.availableQty}</td>
                      <td className="px-2 py-1 text-center">{d.requestedQty}</td>
                      <td className="px-2 py-1 text-center">
                        {d.canFulfill
                          ? <span className="text-green-600">✅</span>
                          : <span className="text-red-600">⚠️ -{d.shortageQty}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

      {/* Payment */}
      <Section title="💰 Payment Details">
        {/* Grand total banner */}
        <div className="bg-primary text-white rounded-xl px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-medium opacity-90">Grand Total</span>
          <span className="text-xl font-bold">Rs. {grandTotal.toLocaleString('en-IN')}</span>
        </div>

        <Field label={`${t('advance_amount')} (Rs.)`}>
          <input type="number" inputMode="numeric" name="advanceAmount"
            value={form.advanceAmount} onChange={set} className={inputCls} />
        </Field>

        <div className={`rounded-xl px-4 py-3 flex justify-between items-center border ${
          balance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <span className={`text-sm font-medium ${balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {t('balance_due')}
          </span>
          <span className={`text-lg font-bold ${balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
            Rs. {balance.toLocaleString('en-IN')}
          </span>
        </div>

        <Field label={t('notes')}>
          <textarea name="notes" value={form.notes} onChange={set} rows={3} className={inputCls} />
        </Field>
      </Section>

      {/* Submit */}
      <div className="flex gap-3 pb-2">
        <button onClick={handleSubmit} disabled={submitting}
          className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-800 active:scale-95 transition-all shadow-md disabled:opacity-50">
          {submitting ? t('loading') : `✅ ${t('submit_booking')}`}
        </button>
        <button onClick={() => navigate('/bookings')}
          className="px-5 bg-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-300 active:scale-95 transition-all">
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}