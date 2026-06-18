const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PDF_DIR   = process.env.PDF_STORAGE_PATH || './pdfs';
const FONT_PATH = path.join(__dirname, '../fonts/NotoSansTamil-Regular.ttf');

if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

const hasTamilFont = fs.existsSync(FONT_PATH);

const generatePDF = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const shopName    = process.env.SHOP_NAME    || 'Vessel Rental Shop';
      const shopPhone   = process.env.SHOP_PHONE   || '';
      const shopAddress = process.env.SHOP_ADDRESS || '';

      const PAGE_W    = 595;
      const PAGE_H    = 842;
      const LEFT      = 40;
      const RIGHT     = 555;
      const CONTENT_W = RIGHT - LEFT;
      const FOOTER_Y  = PAGE_H - 46;

      const doc = new PDFDocument({
        size: 'A4', margin: 0,
        autoFirstPage: true, bufferPages: false,
      });

      const filename = `booking_${booking.bookingNumber || booking._id}.pdf`;
      const filepath = path.join(PDF_DIR, filename);
      const stream   = fs.createWriteStream(filepath);
      doc.pipe(stream);

      if (hasTamilFont) doc.registerFont('NotoSansTamil', FONT_PATH);

      const font = (bold = false) =>
        doc.font(hasTamilFont ? 'NotoSansTamil' : (bold ? 'Helvetica-Bold' : 'Helvetica'));

      const txt = (str, x, y, opts = {}) =>
        doc.text(String(str), x, y, { lineBreak: false, ...opts });

      // ── HEADER ──────────────────────────────────────────────────
      doc.rect(0, 0, PAGE_W, 88).fill('#1e3a5f');
      doc.fillColor('#ffffff').fontSize(18); font(true);
      txt(shopName, LEFT, 16);
      doc.fontSize(10); font(false);
      if (shopAddress) txt('Address : ' + shopAddress, LEFT, 46);
      if (shopPhone)   txt('Phone   : ' + shopPhone,   LEFT, 62);

      // ── TITLE ────────────────────────────────────────────────────
      let y = 98;
      doc.fillColor('#000').fontSize(14); font(true);
      txt('BOOKING RECEIPT', LEFT, y, { align: 'center', width: CONTENT_W });
      y += 20;
      doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor('#1e3a5f').lineWidth(1).stroke();
      y += 8;

      // ── BOOKING META ─────────────────────────────────────────────
      doc.fontSize(9); font(false); doc.fillColor('#333');
      txt(`Booking No  : ${booking.bookingNumber || 'N/A'}`,         LEFT, y);
      txt(`Date Issued : ${new Date().toLocaleDateString('en-IN')}`, 320,  y);
      y += 14;
      doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor('#dddddd').lineWidth(0.5).stroke();
      y += 8;

      // ── CUSTOMER ─────────────────────────────────────────────────
      doc.fontSize(10); font(true); doc.fillColor('#1e3a5f');
      txt('Customer Details', LEFT, y); y += 14;

      doc.fontSize(9); font(false); doc.fillColor('#000');
      txt(`Name       : ${booking.customerName}`, LEFT, y);
      txt(`Phone      : ${booking.phone}`,        320,  y); y += 13;

      txt(`Event Date : ${new Date(booking.eventDate).toLocaleDateString('en-IN')}`, LEFT, y);
      if (booking.returnDate)
        txt(`Return Date: ${new Date(booking.returnDate).toLocaleDateString('en-IN')}`, 320, y);
      y += 13;

      if (booking.eventType) { txt(`Event Type : ${booking.eventType}`, LEFT, y); y += 13; }
      y += 4;
      doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor('#dddddd').lineWidth(0.5).stroke();
      y += 8;

      // ── ITEMS TABLE ───────────────────────────────────────────────
      doc.fontSize(10); font(true); doc.fillColor('#1e3a5f');
      txt('Items Booked', LEFT, y); y += 14;

      // Column layout:  Name | Qty | Price/Unit | Total
      const COL = {
        name:  { x: LEFT + 6,  w: 200 },
        qty:   { x: LEFT + 210, w: 55  },
        price: { x: LEFT + 270, w: 110 },
        total: { x: LEFT + 385, w: 120 },
      };

      const TH = 19;
      doc.rect(LEFT, y, CONTENT_W, TH).fill('#1e3a5f');
      doc.fillColor('#fff').fontSize(9); font(true);
      txt('Item Name',    COL.name.x,  y + 5, { width: COL.name.w });
      txt('Qty',          COL.qty.x,   y + 5, { width: COL.qty.w,   align: 'center' });
      txt('Price/Unit',   COL.price.x, y + 5, { width: COL.price.w, align: 'right'  });
      txt('Total',        COL.total.x, y + 5, { width: COL.total.w, align: 'right'  });
      y += TH;

      const ROW_H      = 16;
      const tableBodyY = y;
      let   grandTotal = 0;

      doc.fontSize(9); font(false);
      for (let i = 0; i < booking.items.length; i++) {
        const item      = booking.items[i];
        const unitPrice = Number(item.pricePerUnit || 0);
        const rowTotal  = unitPrice * item.quantity;
        grandTotal     += rowTotal;

        const rowBg = i % 2 === 0 ? '#f5f5f5' : '#ffffff';
        doc.rect(LEFT, y, CONTENT_W, ROW_H).fill(rowBg);
        doc.fillColor('#000');
        txt(item.itemName || 'Unknown',                     COL.name.x,  y + 3, { width: COL.name.w });
        txt(String(item.quantity),                          COL.qty.x,   y + 3, { width: COL.qty.w,   align: 'center' });
        txt(`Rs. ${unitPrice.toLocaleString('en-IN')}`,    COL.price.x, y + 3, { width: COL.price.w, align: 'right'  });
        txt(`Rs. ${rowTotal.toLocaleString('en-IN')}`,     COL.total.x, y + 3, { width: COL.total.w, align: 'right'  });
        y += ROW_H;
      }

      doc.rect(LEFT, tableBodyY - TH, CONTENT_W, TH + booking.items.length * ROW_H)
         .strokeColor('#cccccc').lineWidth(0.5).stroke();

      // Grand total row
      y += 2;
      doc.rect(LEFT, y, CONTENT_W, 18).fill('#eef2ff');
      doc.fillColor('#1e3a5f').fontSize(9); font(true);
      txt('Grand Total', COL.name.x, y + 4, { width: COL.name.w + COL.qty.w + COL.price.w });
      txt(`Rs. ${grandTotal.toLocaleString('en-IN')}`, COL.total.x, y + 4, { width: COL.total.w, align: 'right' });
      y += 20;

      doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor('#dddddd').lineWidth(0.5).stroke();
      y += 8;

      // ── FINANCIAL SUMMARY ────────────────────────────────────────
      doc.fontSize(10); font(true); doc.fillColor('#1e3a5f');
      txt('Financial Summary', LEFT, y); y += 14;

      const totalAmount    = Number(booking.totalAmount    || 0);
      const advanceAmount  = Number(booking.advanceAmount  || 0);
      const receivedAmount = Number(booking.receivedAmount || 0);
      const balance        = totalAmount - advanceAmount - receivedAmount;

      const finRow = (label, amount, color = '#222') => {
        doc.fontSize(9); font(false); doc.fillColor('#555');
        txt(label, LEFT + 10, y, { width: 280 });
        font(true); doc.fillColor(color);
        txt(`Rs. ${amount.toLocaleString('en-IN')}`, LEFT + 290, y, { width: 210, align: 'right' });
        y += 15;
      };

      finRow('Total Amount    :', totalAmount);
      finRow('Advance Paid    :', advanceAmount, '#1a7a1a');
      if (receivedAmount > 0) finRow('Amount Received :', receivedAmount, '#1a7a1a');
      doc.moveTo(LEFT + 10, y).lineTo(RIGHT, y).strokeColor('#eeeeee').lineWidth(0.5).stroke();
      y += 5;
      finRow('Balance Due     :', balance, balance > 0 ? '#cc0000' : '#1a7a1a');

      if (balance <= 0) {
        doc.fontSize(8); font(false); doc.fillColor('#1a7a1a');
        txt('Fully Paid', LEFT + 290, y, { width: 210, align: 'right' }); y += 13;
      }
      y += 4;

      // ── NOTES ────────────────────────────────────────────────────
      if (booking.notes) {
        doc.moveTo(LEFT, y).lineTo(RIGHT, y).strokeColor('#dddddd').lineWidth(0.5).stroke();
        y += 7;
        doc.fontSize(9); font(true); doc.fillColor('#000');
        txt('Notes:', LEFT, y); font(false);
        doc.text(booking.notes, LEFT + 45, y, { width: 460, lineBreak: true });
        y += 18;
      }

      // ── SHORTAGE ─────────────────────────────────────────────────
      if (booking.shortageItems?.length > 0) {
        doc.fontSize(9); font(true); doc.fillColor('#cc0000');
        txt('External Vendor Required:', LEFT, y); y += 13;
        font(false); doc.fillColor('#333');
        for (const s of booking.shortageItems) {
          txt(`  • ${s.itemName}: ${s.shortageQty} units needed`, LEFT, y); y += 13;
        }
      }

      // ── FOOTER — pinned ───────────────────────────────────────────
      doc.moveTo(LEFT, FOOTER_Y).lineTo(RIGHT, FOOTER_Y)
         .strokeColor('#1e3a5f').lineWidth(1).stroke();
      doc.fontSize(8); font(false); doc.fillColor('#888');
      txt(
        `Thank you for choosing ${shopName}!  Please retain this receipt.`,
        LEFT, FOOTER_Y + 10, { align: 'center', width: CONTENT_W }
      );

      doc.end();
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePDF };