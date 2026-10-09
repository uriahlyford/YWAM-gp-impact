/* A signed legal document as a PDF, built by hand — no library. A4 pages of
   Helvetica text (the document exactly as it was signed, from its snapshot),
   the boxes ticked, the details typed in, and the handwritten signatures and
   initials drawn in as the JPEGs the phone made. A footer on every page names
   the signer, the time and the document's fingerprint.

   Text is WinAnsi (Latin): curly quotes and dashes map to their WinAnsi
   codes, anything else Latin-1 can't hold prints as "?". Line breaking uses
   Helvetica's real character widths so nothing runs off the page. */

const W = 595.28, H = 841.89, M = 56;
/* Helvetica advance widths (per 1000 em) for 32–126, from its AFM */
const HW = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722,
  667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556,
  333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
const WIN = { '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '…': 0x85 };

function codes_(s) {
  const out = [];
  for (const ch of String(s == null ? '' : s)) {
    const c = ch.codePointAt(0);
    if (WIN[ch]) out.push(WIN[ch]);
    else if (c === 9) out.push(32);
    else if (c >= 32 && c <= 126) out.push(c);
    else if (c >= 160 && c <= 255) out.push(c);
    else out.push(63);
  }
  return out;
}
function width_(s, size, bold) {
  let w = 0;
  codes_(s).forEach(function (c) { w += (c >= 32 && c <= 126) ? HW[c - 32] : (c === 0x95 ? 350 : c === 0x97 ? 1000 : 556); });
  return w / 1000 * size * (bold ? 1.07 : 1);
}
function esc_(s) {
  return Buffer.from(codes_(s)).toString('latin1').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}
function wrap_(text, size, maxW, bold) {
  const lines = [];
  String(text || '').split('\n').forEach(function (para) {
    let line = '';
    para.split(/\s+/).filter(Boolean).forEach(function (word) {
      const next = line ? line + ' ' + word : word;
      if (width_(next, size, bold) <= maxW || !line) line = next;
      else { lines.push(line); line = word; }
    });
    lines.push(line);
  });
  return lines;
}
/* a JPEG's pixel size, from its SOF marker */
function jpegSize_(buf) {
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
export function isJpeg(b64) {
  try { const b = Buffer.from(String(b64 || ''), 'base64'); return b.length > 100 && b[0] === 0xFF && b[1] === 0xD8 && !!jpegSize_(b); } catch (e) { return false; }
}

export function buildSignedPdf(o) {
  const doc = o.doc, r = o.record || {}, name = r.name || '';
  const pages = [];   // [{ ops:[], imgs:[name] }]
  const images = [];  // [{ name, buf, w, h }]
  let page = null, y = 0;
  const newPage = function () { page = { ops: [], imgs: [] }; pages.push(page); y = H - M; };
  const need = function (h) { if (!page || y - h < M + 28) newPage(); };
  const text = function (s, size, font, x) { page.ops.push('BT /' + font + ' ' + size + ' Tf ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' Td (' + esc_(s) + ') Tj ET'); };
  const para = function (s, opt) {
    opt = opt || {};
    const size = opt.size || 10.5, font = opt.font || 'F1', ind = opt.indent || 0, lh = size * 1.38;
    const lines = wrap_(s, size, W - 2 * M - ind, font === 'F2');
    lines.forEach(function (ln) { need(lh); y -= lh; text(ln, size, font, M + ind); });
    y -= opt.after == null ? 6 : opt.after;
  };
  const box = function (x, yy, ticked) {
    page.ops.push('0.4 w ' + x.toFixed(2) + ' ' + yy.toFixed(2) + ' 9 9 re S');
    if (ticked) page.ops.push('1.2 w ' + (x + 1.8).toFixed(2) + ' ' + (yy + 4.5).toFixed(2) + ' m ' + (x + 3.8).toFixed(2) + ' ' + (yy + 1.8).toFixed(2) + ' l ' + (x + 7.6).toFixed(2) + ' ' + (yy + 8).toFixed(2) + ' l S');
  };
  const image = function (b64, maxW, maxH, label) {
    if (!b64) return;
    const buf = Buffer.from(b64, 'base64'), sz = jpegSize_(buf); if (!sz) return;
    let w = maxW, h = w * sz.h / sz.w; if (h > maxH) { h = maxH; w = h * sz.w / sz.h; }
    need(h + 26);
    if (label) { y -= 12; text(label, 9, 'F1', M); }
    y -= h + 2;
    const nm = 'Im' + (images.length + 1);
    images.push({ name: nm, buf: buf, w: sz.w, h: sz.h });
    page.imgs.push(nm);
    page.ops.push('q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + M.toFixed(2) + ' ' + y.toFixed(2) + ' cm /' + nm + ' Do Q');
    page.ops.push('0.5 w ' + M + ' ' + (y - 2).toFixed(2) + ' m ' + (M + Math.max(w, 180)).toFixed(2) + ' ' + (y - 2).toFixed(2) + ' l S');
    y -= 10;
  };
  const kv = function (k, v) { need(16); y -= 15; text(k + ':', 10, 'F2', M); text(v || '—', 10, 'F1', M + width_(k + ':', 10, true) + 6); };

  newPage();
  /* the YWAM Siem Reap letterhead and the title, centred, as on the paper forms */
  { const buf = Buffer.from(LETTERHEAD_JPEG, 'base64'), sz = jpegSize_(buf);
    if (sz) { const w = 330, h = w * sz.h / sz.w; y -= h - 10; images.push({ name: 'ImLh', buf: buf, w: sz.w, h: sz.h }); page.imgs.push('ImLh');
      page.ops.push('q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + ((W - w) / 2).toFixed(2) + ' ' + y.toFixed(2) + ' cm /ImLh Do Q'); } }
  wrap_(doc.title, 16, W - 2 * M, true).forEach(function (ln) { y -= 22; text(ln, 16, 'F2', (W - width_(ln, 16, true)) / 2); });
  y -= 16;
  (doc.blocks || []).forEach(function (b) {
    if (b.t === 'period') { kv('Volunteer Name', name); kv('Period of Contract', r.period || ''); y -= 6; }
    else if (b.t === 'h') { const num = /^\d+\.\s/.test(b.text || ''); need(30); y -= num ? 4 : 8; para(b.text, { font: 'F2', size: num ? 11 : 12.5, after: 2 }); }
    else if (b.t === 'list') {
      (b.items || []).forEach(function (it) {
        /* a bold lead-in, as on the paper: "Physical harm: I will not …" */
        const m = /^([^:]{2,24}):\s/.exec(it), lead = m ? m[1] + ':' : '';
        const lines = wrap_(it, 10.5, W - 2 * M - 30);
        need(lines.length * 14.5);
        lines.forEach(function (ln, i) {
          y -= 14.5; if (i === 0) text('\u2022', 10.5, 'F1', M + 8);
          if (i === 0 && lead && ln.indexOf(lead) === 0) { text(lead, 10.5, 'F2', M + 22); text(ln.slice(lead.length), 10.5, 'F1', M + 22 + width_(lead, 10.5, true)); }
          else text(ln, 10.5, 'F1', M + 22);
        });
        y -= 3;
      });
      y -= 5;
    } else if (b.t === 'choice') {
      (b.options || []).forEach(function (op) {
        const lines = wrap_(op.text, 10.5, W - 2 * M - 18);
        need(lines.length * 14.5 + 4);
        box(M, y - 12, !!(r.choices && r.choices[b.id] === op.id));
        lines.forEach(function (ln) { y -= 14.5; text(ln, 10.5, 'F1', M + 18); });
        y -= 6;
      });
    } else if (b.t === 'contacts') {
      (r.contacts || []).forEach(function (ct) { kv(ct.role, [ct.name, ct.phone].filter(Boolean).join(' · ')); });
      y -= 8;
    } else if (b.t === 'p' && b.style === 'quote') {
      const lines = wrap_(b.text, 10.5, W - 2 * M - 18); need(lines.length * 14.5 + 8); y -= 4;
      const top = y; lines.forEach(function (ln) { y -= 14.5; text(ln, 10.5, 'F3', M + 14); });
      page.ops.push('0.75 0.75 0.75 RG 2 w ' + (M + 3) + ' ' + (top - 2).toFixed(2) + ' m ' + (M + 3) + ' ' + (y - 4).toFixed(2) + ' l S 0 0 0 RG'); y -= 10;
    } else if (b.t === 'p') para(String(b.text || '').split('{name}').join(name || '________'), { font: b.style === 'bold' ? 'F2' : b.style === 'italic' ? 'F3' : 'F1' });
    else if (b.t === 'check') {
      const lines = wrap_(b.text, 10.5, W - 2 * M - 18);
      need(lines.length * 14.5 + 6);
      box(M, y - 12, !!(r.checks && r.checks[b.id]));
      lines.forEach(function (ln) { y -= 14.5; text(ln, 10.5, 'F1', M + 18); });
      y -= 8;
    } else if (b.t === 'group') {
      need(36);
      box(M, y - 12, !!(r.checks && r.checks[b.id]));
      y -= 14.5; text(b.title, 10.5, 'F2', M + 18); y -= 4;
      (b.items || []).forEach(function (it) {
        const lines = wrap_(it, 10.5, W - 2 * M - 40);
        need(lines.length * 14.5);
        lines.forEach(function (ln, i) { y -= 14.5; if (i === 0) text('•', 10.5, 'F1', M + 28); text(ln, 10.5, 'F1', M + 40); });
        y -= 2;
      });
      y -= 8;
    } else if (b.t === 'field') { kv(b.label, (r.fields && r.fields[b.id]) || ''); y -= 6; }
    else if (b.t === 'initial') { const ini = r.initials && r.initials[b.id]; if (ini) image(ini, 90, 34, b.label); else kv(b.label, ''); y -= 4; }
  });
  /* the signatures */
  need(150); y -= 10;
  page.ops.push('0.6 w ' + M + ' ' + y.toFixed(2) + ' m ' + (W - M) + ' ' + y.toFixed(2) + ' l S'); y -= 4;
  kv('Name', name);
  if (doc.sign && doc.sign.age) kv('Age', r.age != null && r.age !== '' ? String(r.age) : '');
  kv('Date (d/m/y)', r.dateText || '');
  image(r.sig, 220, 70, 'Signature');
  if (doc.sign && doc.sign.guardian && r.under18) { y -= 6; kv('Parent / guardian', r.guardianName || ''); image(r.guardianSig, 220, 70, 'Parent / guardian signature'); }
  if (doc.sign && doc.sign.leader) { y -= 6; kv('UofN leader', r.leaderName || 'not yet signed'); if (r.leaderSig) { kv('Date (d/m/y)', r.leaderDateText || ''); image(r.leaderSig, 220, 70, 'Signature of UofN Leader'); } }
  if (doc.sign && doc.sign.witness && (r.witnessName || r.witnessSig)) { y -= 6; kv('Witness', r.witnessName || ''); image(r.witnessSig, 220, 70, 'Witness signature'); }

  /* the footer on every page */
  const foot = 'Signed digitally by ' + name + (o.teamName ? ' (' + o.teamName + ')' : '') + ' on ' + (r.atText || r.at || '') + ' via the YWAM GP Portal';
  pages.forEach(function (p, i) {
    p.ops.push('BT /F1 7.5 Tf ' + M + ' 36 Td (' + esc_(foot) + ') Tj ET');
    p.ops.push('BT /F1 7.5 Tf ' + M + ' 26 Td (' + esc_((r.docHash ? 'Document ' + String(r.docHash).slice(0, 16) + ' · ' : '') + 'Page ' + (i + 1) + ' of ' + pages.length) + ') Tj ET');
  });

  /* the file */
  const objs = [];  // index = object number - 1
  const add = function (body) { objs.push(body); return objs.length; };
  const catalog = add(null), pagesObj = add(null);
  const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const f3 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>');
  const imgObj = {};
  images.forEach(function (im) {
    imgObj[im.name] = add({ head: '<< /Type /XObject /Subtype /Image /Width ' + im.w + ' /Height ' + im.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + im.buf.length + ' >>', stream: im.buf });
  });
  const kids = [];
  pages.forEach(function (p) {
    const content = Buffer.from(p.ops.join('\n'), 'latin1');
    const c = add({ head: '<< /Length ' + content.length + ' >>', stream: content });
    const xo = p.imgs.map(function (n) { return '/' + n + ' ' + imgObj[n] + ' 0 R'; }).join(' ');
    kids.push(add('<< /Type /Page /Parent ' + pagesObj + ' 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Contents ' + c + ' 0 R /Resources << /Font << /F1 ' + f1 + ' 0 R /F2 ' + f2 + ' 0 R /F3 ' + f3 + ' 0 R >>' + (xo ? ' /XObject << ' + xo + ' >>' : '') + ' >> >>'));
  });
  objs[catalog - 1] = '<< /Type /Catalog /Pages ' + pagesObj + ' 0 R >>';
  objs[pagesObj - 1] = '<< /Type /Pages /Kids [' + kids.map(function (k) { return k + ' 0 R'; }).join(' ') + '] /Count ' + kids.length + ' >>';
  const chunks = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')];
  let len = chunks[0].length;
  const offsets = [];
  objs.forEach(function (o, i) {
    offsets.push(len);
    const parts = [Buffer.from((i + 1) + ' 0 obj\n', 'latin1')];
    if (typeof o === 'string') parts.push(Buffer.from(o + '\n', 'latin1'));
    else { parts.push(Buffer.from(o.head + '\nstream\n', 'latin1')); parts.push(o.stream); parts.push(Buffer.from('\nendstream\n', 'latin1')); }
    parts.push(Buffer.from('endobj\n', 'latin1'));
    parts.forEach(function (p) { chunks.push(p); len += p.length; });
  });
  const xref = ['xref', '0 ' + (objs.length + 1), '0000000000 65535 f '].concat(offsets.map(function (o) { return String(o).padStart(10, '0') + ' 00000 n '; }));
  chunks.push(Buffer.from(xref.join('\n') + '\ntrailer\n<< /Size ' + (objs.length + 1) + ' /Root ' + catalog + ' 0 R >>\nstartxref\n' + len + '\n%%EOF\n', 'latin1'));
  return Buffer.concat(chunks);
}

/* public/letterhead.jpg — the YWAM Siem Reap letterhead from the paper forms */
const LETTERHEAD_JPEG = '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';
