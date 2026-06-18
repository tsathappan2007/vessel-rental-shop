import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  getInventory, createInventory, updateInventory,
  deleteInventory, bulkInsertInventory, checkStockForDate,
} from '../services/api';

function ItemForm({ initial, onSave, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(
    initial || { name: '', totalStock: '', pricePerUnit: '', alertThreshold: 20, externalVendor: '' }
  );
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="bg-blue-50 rounded-2xl p-4 space-y-3 border border-blue-100">
      <p className="font-semibold text-primary text-sm">
        {initial ? '✏️ Edit Item' : '➕ New Item'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('item_name')} *</label>
          <input name="name" value={form.name} onChange={set}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('total_stock')} *</label>
          <input name="totalStock" type="number" inputMode="numeric" value={form.totalStock} onChange={set}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Price / Unit (Rs.) *</label>
          <input name="pricePerUnit" type="number" inputMode="decimal" min="0" value={form.pricePerUnit} onChange={set}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('alert_threshold')}</label>
          <input name="alertThreshold" type="number" inputMode="numeric" value={form.alertThreshold} onChange={set}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('external_vendor')}</label>
          <input name="externalVendor" value={form.externalVendor} onChange={set}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)}
          className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 active:scale-95 transition-all">
          {t('save')}
        </button>
        <button onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-300 active:scale-95 transition-all">
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}

export default function Inventory() {
  const { t } = useTranslation();
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editItem, setEditItem]         = useState(null);
  const [search, setSearch]             = useState('');
  const [showBulk, setShowBulk]         = useState(false);
  const [bulkText, setBulkText]         = useState('');
  const [checkDate, setCheckDate]       = useState('');
  const [availability, setAvailability] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const load = async () => {
    try { const r = await getInventory(); setItems(r.data.data); }
    catch { toast.error(t('error_occurred')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    try {
      editItem ? await updateInventory(editItem._id, form) : await createInventory(form);
      toast.success(t('success_saved'));
      setShowForm(false); setEditItem(null); load();
    } catch { toast.error(t('error_occurred')); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_confirm'))) return;
    try { await deleteInventory(id); toast.success(t('success_deleted')); load(); }
    catch { toast.error(t('error_occurred')); }
  };

  const handleBulk = async () => {
    try {
      await bulkInsertInventory(JSON.parse(bulkText));
      toast.success(t('success_saved')); setShowBulk(false); setBulkText(''); load();
    } catch (e) { toast.error('Invalid JSON: ' + e.message); }
  };

  const handleCheckDate = async () => {
    if (!checkDate) return;
    setCheckLoading(true);
    try { const r = await checkStockForDate(checkDate); setAvailability(r.data.data); }
    catch { toast.error(t('error_occurred')); }
    finally { setCheckLoading(false); }
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-primary">{t('inventory_title')}</h1>
        <div className="flex gap-2">
          <button onClick={() => { setShowForm(true); setEditItem(null); }}
            className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 active:scale-95 transition-all shadow-sm">
            + {t('add_item')}
          </button>
          <button onClick={() => setShowBulk(!showBulk)}
            className="bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm">
            {t('bulk_insert')}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && !editItem && (
        <ItemForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {/* Bulk insert */}
      {showBulk && (
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <p className="text-sm font-semibold">{t('paste_bulk_items')}</p>
          <p className="text-xs text-gray-500">{`[{"name":"...","totalStock":100,"pricePerUnit":5}]`}</p>
          <textarea rows={4} value={bulkText} onChange={(e) => setBulkText(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder='[{"name":"Steel Plate","totalStock":200,"pricePerUnit":5}]' />
          <div className="flex gap-2">
            <button onClick={handleBulk}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-all">
              {t('insert')}
            </button>
            <button onClick={() => setShowBulk(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-300 transition-all">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Date check */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">{t('check_availability')}</p>
        <div className="flex gap-2">
          <input type="date" value={checkDate}
            onChange={(e) => { setCheckDate(e.target.value); setAvailability(null); }}
            className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={handleCheckDate} disabled={!checkDate || checkLoading}
            className="bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
            {checkLoading ? '...' : t('check')}
          </button>
        </div>

        {availability && (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs min-w-[500px]">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="text-left px-3 py-2 rounded-l-lg">{t('item_name')}</th>
                  <th className="px-3 py-2">{t('total_stock')}</th>
                  <th className="px-3 py-2">{t('booked')}</th>
                  <th className="px-3 py-2">{t('available')}</th>
                  <th className="px-3 py-2">Rs./Unit</th>
                  <th className="px-3 py-2 rounded-r-lg">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {availability.map((a) => (
                  <tr key={a._id} className={`border-t ${a.isLow ? 'bg-red-50' : ''}`}>
                    <td className="px-3 py-2 font-medium">{a.name}</td>
                    <td className="px-3 py-2 text-center">{a.totalStock}</td>
                    <td className="px-3 py-2 text-center">{a.bookedQty}</td>
                    <td className="px-3 py-2 text-center font-bold">{a.availableQty}</td>
                    <td className="px-3 py-2 text-center">{a.pricePerUnit || 0}</td>
                    <td className="px-3 py-2 text-center">
                      {a.isLow
                        ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">⚠️ Low</span>
                        : <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ OK</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-3 border-b">
          <input type="text" placeholder={t('search_placeholder')} value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        {/* Mobile: card list */}
        <div className="md:hidden divide-y">
          {filtered.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">{t('no_items')}</p>
          ) : filtered.map((item) => (
            <div key={item._id}>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                  <span className="text-sm font-bold text-green-700 flex-shrink-0">
                    Rs. {(item.pricePerUnit || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Stock: <strong className="text-gray-700">{item.totalStock}</strong></span>
                  <span>Alert: <strong className="text-gray-700">{item.alertThreshold}%</strong></span>
                  {item.externalVendor && <span className="truncate">Vendor: {item.externalVendor}</span>}
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setEditItem(item)}
                    className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-all">
                    ✏️ {t('edit')}
                  </button>
                  <button onClick={() => handleDelete(item._id)}
                    className="flex-1 bg-red-50 text-red-700 py-2 rounded-xl text-xs font-semibold hover:bg-red-100 transition-all">
                    🗑️ {t('delete')}
                  </button>
                </div>
              </div>
              {editItem?._id === item._id && (
                <div className="px-4 pb-4">
                  <ItemForm initial={editItem} onSave={handleSave} onCancel={() => setEditItem(null)} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">{t('item_name')}</th>
                <th className="px-4 py-3">{t('total_stock')}</th>
                <th className="px-4 py-3">Price/Unit (Rs.)</th>
                <th className="px-4 py-3">{t('alert_threshold')}</th>
                <th className="px-4 py-3">{t('external_vendor')}</th>
                <th className="px-4 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">{t('no_items')}</td></tr>
              ) : filtered.map((item) => (
                <React.Fragment key={item._id}>
                  <tr className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">{item.totalStock}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">
                      Rs. {(item.pricePerUnit || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">{item.alertThreshold}%</td>
                    <td className="px-4 py-3 text-gray-500">{item.externalVendor || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditItem(item)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all">
                          {t('edit')}
                        </button>
                        <button onClick={() => handleDelete(item._id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-all">
                          {t('delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editItem?._id === item._id && (
                    <tr><td colSpan={6} className="px-4 pb-4">
                      <ItemForm initial={editItem} onSave={handleSave} onCancel={() => setEditItem(null)} />
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}