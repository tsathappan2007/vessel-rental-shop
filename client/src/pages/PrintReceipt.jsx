import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookingById, getShopInfo } from '../services/api';

export default function PrintReceipt() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [shop, setShop] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    let active = true;
    let timer = null;

    Promise.all([getBookingById(id), getShopInfo()]).then(([bRes, sRes]) => {
      if (!active) return;
      setBooking(bRes.data.data);
      setShop(sRes.data.data);
      timer = setTimeout(() => {
        if (active) window.print();
      }, 800);
    });

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  if (!booking) return <div className="text-center py-20">Loading...</div>;

  const total = Number(booking.totalAmount || 0);
  const advance = Number(booking.advanceAmount || 0);
  const received = Number(booking.receivedAmount || 0);
  const balance = total - advance - received;

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans text-sm">
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      <button
        onClick={() => window.print()}
        className="no-print mb-6 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm"
      >
        🖨️ Print
      </button>

      {/* ── HEADER ── */}
      <div className="bg-[#1e3a5f] text-white p-6 rounded-t-xl">
        <h1 className="text-2xl font-bold">{shop.name}</h1>
        {shop.address && (
          <p className="text-sm opacity-80 mt-1">📍 {shop.address}</p>
        )}
        {shop.phone && (
          <p className="text-sm opacity-80 mt-1">📞 {shop.phone}</p>
        )}
      </div>

      <div className="border border-t-0 rounded-b-xl p-6 space-y-5">

        {/* ── RECEIPT TITLE ── */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">BOOKING RECEIPT</h2>
            <p className="text-gray-500 text-xs mt-1">
              Date: {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-blue-700 text-lg">
              {booking.bookingNumber}
            </p>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              booking.status === 'Returned'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {booking.status}
            </span>
          </div>
        </div>

        <hr />

        {/* ── CUSTOMER DETAILS ── */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-gray-500">Customer:</span>
            <span className="font-medium ml-2">{booking.customerName}</span>
          </div>
          <div>
            <span className="text-gray-500">Phone:</span>
            <span className="font-medium ml-2">{booking.phone}</span>
          </div>
          <div>
            <span className="text-gray-500">Event Date:</span>
            <span className="font-medium ml-2">
              {new Date(booking.eventDate).toLocaleDateString('en-IN')}
            </span>
          </div>
          {booking.returnDate && (
            <div>
              <span className="text-gray-500">Return Date:</span>
              <span className="font-medium ml-2">
                {new Date(booking.returnDate).toLocaleDateString('en-IN')}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Event Type:</span>
            <span className="font-medium ml-2">{booking.eventType}</span>
          </div>
        </div>

        <hr />

        {/* ── ITEMS TABLE ── */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-3 py-2">Item</th>
              <th className="px-3 py-2 text-center">Qty</th>
              <th className="px-3 py-2 text-center">Returned</th>
            </tr>
          </thead>
          <tbody>
            {booking.items.map((item, i) => (
              <tr key={i} className={`border-t ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                <td className="px-3 py-2 font-medium">{item.itemName}</td>
                <td className="px-3 py-2 text-center">{item.quantity}</td>
                <td className="px-3 py-2 text-center">{item.returnedQuantity || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── FINANCIAL SUMMARY ── */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold">
              Rs. {total.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Advance Paid:</span>
            <span className="font-bold text-green-600">
              Rs. {advance.toLocaleString('en-IN')}
            </span>
          </div>
          {received > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Received (Post-Return):</span>
              <span className="font-bold text-green-600">
                Rs. {received.toLocaleString('en-IN')}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span className="font-bold">Balance Due:</span>
            <span className={`font-bold text-lg ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              Rs. {balance.toLocaleString('en-IN')}
              {balance <= 0 && <span className="ml-1 text-sm">✅ (Settled)</span>}
            </span>
          </div>
        </div>

        {/* ── NOTES ── */}
        {booking.notes && (
          <>
            <hr />
            <p className="text-gray-500 text-xs">
              <span className="font-medium">Notes:</span> {booking.notes}
            </p>
          </>
        )}

        {/* ── SHORTAGE ITEMS ── */}
        {booking.shortageItems?.length > 0 && (
          <>
            <hr />
            <div className="text-xs text-orange-700">
              <p className="font-bold mb-1">⚠️ External Vendor Required:</p>
              {booking.shortageItems.map((s, i) => (
                <p key={i}>• {s.itemName}: {s.shortageQty} units from external vendor</p>
              ))}
            </div>
          </>
        )}

        {/* ── FOOTER ── */}
        <div className="text-center text-xs text-gray-400 pt-4 border-t">
          Thank you for choosing {shop.name}!
        </div>

      </div>
    </div>
  );
}