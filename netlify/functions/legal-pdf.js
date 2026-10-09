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
  y -= 4; text('YWAM SIEM REAP', 9, 'F2', M); text('Serve - Educate - Develop', 9, 'F1', W - M - width_('Serve - Educate - Develop', 9));
  y -= 30; text(doc.title, 16, 'F2', M); y -= 18;
  (doc.blocks || []).forEach(function (b) {
    if (b.t === 'period') { kv('Volunteer Name', name); kv('Period of Contract', r.period || ''); y -= 6; }
    else if (b.t === 'h') { need(30); y -= 8; para(b.text, { font: 'F2', size: 12, after: 2 }); }
    else if (b.t === 'list') {
      (b.items || []).forEach(function (it) {
        const lines = wrap_(it, 10.5, W - 2 * M - 22);
        need(lines.length * 14.5);
        lines.forEach(function (ln, i) { y -= 14.5; if (i === 0) text('\u2022', 10.5, 'F1', M + 8); text(ln, 10.5, 'F1', M + 22); });
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
