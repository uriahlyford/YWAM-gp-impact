/*  Weekly schedules — the cooking schedule and the morning chores — drawn the
    same way on the staff app (teams.html) and the portal (portal.html), and
    turned into a picture to send round.

    A schedule is one of two shapes (see the "weekly schedules" block in
    api.js):
      grid  — rows (a meal or a chore, with a time) × days; cells['row|day']
              is a list of names, cells['row|all'] for a row that is the same
              all week (span); row.off lists days with nothing on.
      list  — sections of places: { place, duty, people:[names] }.

    Plain script, no modules, no build step — same contract as rollup.js. The
    page passes its own translate (t) and escape (esc) in, so this file holds
    no strings of its own to keep in step with km.js. Styles use only the
    tokens both pages define (--surface, --surface2, --border, --ink, --muted,
    --faint, --accent, --accentInk). */

var DUTY_DAY_NAMES = { sun:'Sunday', mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday' };
var DUTY_DAY_SHORT = { sun:'Sun', mon:'Mon', tue:'Tue', wed:'Wed', thu:'Thu', fri:'Fri', sat:'Sat' };

/* The Sunday a week starts on, as YYYY-MM-DD, from a local date. */
function dutyWeekOf(d){
  d = d ? new Date(d) : new Date();
  d.setHours(12,0,0,0); d.setDate(d.getDate()-d.getDay());
  return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
}
function dutyAddDays(iso, n){ var d=new Date(iso+'T12:00:00'); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }

(function(){
  if(typeof document==='undefined' || document.getElementById('dutyCss')) return;
  var st=document.createElement('style'); st.id='dutyCss';
  st.textContent=
    '.dutyScroll{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--border);border-radius:12px;background:var(--surface)}'+
    '.dutyGrid{border-collapse:collapse;min-width:100%;font-size:13px}'+
    '.dutyGrid th,.dutyGrid td{border:1px solid var(--border);padding:6px 7px;vertical-align:top;text-align:center;color:var(--ink)}'+
    '.dutyGrid thead th{background:var(--surface2);font-size:12px;white-space:nowrap}'+
    '.dutyGrid th.dutyRowHead{position:sticky;left:0;z-index:1;background:var(--surface2);text-align:left;min-width:108px;max-width:140px;font-weight:700}'+
    '.dutyGrid td{min-width:84px}'+
    '.dutyGrid td.off{background:var(--surface2)}'+
    '.dutyKm{display:block;font-size:11px;font-weight:600;color:var(--muted)}'+
    '.dutyTime{display:block;font-size:11px;font-weight:600;color:var(--muted)}'+
    '.dutyName{display:block;line-height:1.35}'+
    '.dutyName.me{background:var(--accent);color:var(--accentInk);border-radius:6px;padding:0 4px;font-weight:800}'+
    '.dutyEmpty{color:var(--faint)}'+
    '.dutyCell{cursor:pointer}'+
    '.dutySec{font-weight:800;font-size:13px;letter-spacing:.4px;text-transform:uppercase;color:var(--muted);margin:14px 0 6px}'+
    '.dutyList{border:1px solid var(--border);border-radius:12px;background:var(--surface);overflow:hidden}'+
    '.dutyItem{display:grid;grid-template-columns:1fr minmax(96px,34%);gap:10px;padding:10px 12px;border-top:1px solid var(--border);color:var(--ink);text-align:left;width:100%;background:none;border-left:0;border-right:0;border-bottom:0;font:inherit}'+
    '.dutyItem:first-child{border-top:0}'+
    '.dutyPlace{font-weight:700;font-size:14px}'+
    '.dutyWhat{font-size:12.5px;color:var(--muted);margin-top:2px;white-space:pre-line}'+
    '.dutyWho{font-size:13.5px;font-weight:700;text-align:right}'+
    '.dutyWho .dutyName.me{display:inline-block;margin-top:1px}';
  document.head.appendChild(st);
})();

/* The schedule as HTML. o: { t, esc, me: a name to pick out, edit: true for tappable cells } */
function dutyHtml(s, o){
  var t=o.t, esc=o.esc;
  var names=function(list, attr){
    var l=list||[];
    var inner = l.length ? l.map(function(n){ return '<span class="dutyName'+(o.me && n===o.me?' me':'')+'">'+esc(n)+'</span>'; }).join('')
      : (o.edit ? '<span class="dutyEmpty">＋</span>' : '');
    return inner;
  };
  if(s.layout==='grid'){
    var h='<div class="dutyScroll"><table class="dutyGrid" data-duty="grid"><thead><tr><th class="dutyRowHead">'+esc(t('Time'))+'</th>'+
      s.days.map(function(d){ return '<th>'+esc(t(DUTY_DAY_NAMES[d]))+'</th>'; }).join('')+'</tr></thead><tbody>';
    s.rows.forEach(function(r){
      h+='<tr><th class="dutyRowHead">'+(r.km?'<span class="dutyKm">'+esc(r.km)+'</span>':'')+esc(r.label)+(r.time?'<span class="dutyTime">'+esc(r.time)+'</span>':'')+'</th>';
      if(r.span){
        var on=s.days.filter(function(d){ return (r.off||[]).indexOf(d)===-1; });
        s.days.forEach(function(d, i){
          if((r.off||[]).indexOf(d)>-1){ h+='<td class="off"></td>'; return; }
          if(d!==on[0]) return;
          h+='<td colspan="'+on.length+'"'+(o.edit?' class="dutyCell" data-dcell="'+esc(r.id)+'|all"':'')+'>'+names(s.cells[r.id+'|all'])+'</td>';
        });
      } else s.days.forEach(function(d){
        if((r.off||[]).indexOf(d)>-1){ h+='<td class="off"></td>'; return; }
        h+='<td'+(o.edit?' class="dutyCell" data-dcell="'+esc(r.id)+'|'+d+'"':'')+'>'+names(s.cells[r.id+'|'+d])+'</td>';
      });
      h+='</tr>';
    });
    return h+'</tbody></table></div>';
  }
  var out='';
  (s.sections||[]).forEach(function(sec){
    if(!sec.rows.length && !o.edit) return;
    if(sec.title) out+='<div class="dutySec">'+esc(sec.title)+(sec.km?' · '+esc(sec.km):'')+'</div>';
    out+='<div class="dutyList" data-duty="list">'+sec.rows.map(function(r){
      var tag=o.edit?'button':'div';
      return '<'+tag+' class="dutyItem'+(o.edit?' dutyCell':'')+'"'+(o.edit?' data-dcell="'+esc(sec.id)+'|'+esc(r.id)+'"':'')+'><div><div class="dutyPlace">'+esc(r.place)+(r.km?' <span class="dutyKm" style="display:inline">'+esc(r.km)+'</span>':'')+'</div>'+
        (r.duty?'<div class="dutyWhat">'+esc(r.duty)+'</div>':'')+'</div><div class="dutyWho">'+names(r.people)+'</div></'+tag+'>';
    }).join('')+'</div>';
  });
  return out;
}

/* Every cell that names `me`, as short lines: "Mon · Lunch 12:30". */
function dutyMine(s, me, t){
  var out=[];
  if(!s || !me) return out;
  if(s.layout==='grid') s.rows.forEach(function(r){
    if(r.span){ if((s.cells[r.id+'|all']||[]).indexOf(me)>-1) out.push(t('All week')+' · '+r.label); return; }
    s.days.forEach(function(d){ if((s.cells[r.id+'|'+d]||[]).indexOf(me)>-1) out.push(t(DUTY_DAY_SHORT[d])+' · '+r.label); });
  });
  else (s.sections||[]).forEach(function(sec){ sec.rows.forEach(function(r){ if((r.people||[]).indexOf(me)>-1) out.push(r.place); }); });
  return out;
}

/* ---------- the picture ---------- */
function dutyWrap_(ctx, text, max){
  var words=String(text||'').split(/\s+/), lines=[], cur='';
  words.forEach(function(w){
    var tryL=cur?cur+' '+w:w;
    if(ctx.measureText(tryL).width<=max || !cur) cur=tryL; else { lines.push(cur); cur=w; }
  });
  if(cur) lines.push(cur);
  return lines;
}
/* A white sheet like the ones sent round now: title, the week, the table. */
function dutyImage(s, o){
  var t=o.t, FONT='"Kantumruy Pro", "Noto Sans Khmer", system-ui, sans-serif';
  var c=document.createElement('canvas'), ctx=c.getContext('2d');
  var PAD=40, LINE=26, W, H, y;
  var INK='#17150F', MUTED='#6B6557', LINEC='#C9C3B6', HEAD='#DCE6F5', OFF='#E3EEDB', TITLE='#9B1C1C';
  var draw=function(measureOnly){
    y=PAD;
    if(!measureOnly){ ctx.fillStyle='#FFFFFF'; ctx.fillRect(0,0,W,H); }
    ctx.textBaseline='top'; ctx.textAlign='center';
    ctx.font='700 34px '+FONT; ctx.fillStyle=TITLE;
    var title=(s.km? s.km+' – ':'')+s.title;
    dutyWrap_(ctx, title, W-2*PAD).forEach(function(l){ if(!measureOnly) ctx.fillText(l, W/2, y); y+=44; });
    ctx.font='600 20px '+FONT; ctx.fillStyle=MUTED;
    if(!measureOnly) ctx.fillText(o.weekLabel||'', W/2, y); y+=40;
    if(s.layout==='grid'){
      var cols=s.days.length, labW=240, colW=(W-2*PAD-labW)/cols;
      var cell=function(x, w, h, fill){ if(measureOnly) return; if(fill){ ctx.fillStyle=fill; ctx.fillRect(x,y,w,h); } ctx.strokeStyle=LINEC; ctx.lineWidth=1.5; ctx.strokeRect(x,y,w,h); };
      // header
      cell(PAD, labW, 48, HEAD);
      ctx.font='700 19px '+FONT; ctx.fillStyle=INK;
      if(!measureOnly) ctx.fillText(t('Time'), PAD+labW/2, y+14);
      s.days.forEach(function(d,i){ cell(PAD+labW+i*colW, colW, 48, HEAD); if(!measureOnly){ ctx.fillStyle=INK; ctx.fillText(t(DUTY_DAY_NAMES[d]), PAD+labW+i*colW+colW/2, y+14); } });
      y+=48;
      s.rows.forEach(function(r){
        ctx.font='600 18px '+FONT;
        var lab=[].concat(r.km?[r.km]:[]).concat(dutyWrap_(ctx, r.label, labW-20)).concat(r.time?[r.time]:[]);
        var hgt=Math.max(lab.length, 1)*LINE;
        var lines=function(list, w){ ctx.font='500 18px '+FONT; var out=[]; (list||[]).forEach(function(n){ out=out.concat(dutyWrap_(ctx, n, w-16)); }); return out; };
        var on=s.days.filter(function(d){ return (r.off||[]).indexOf(d)===-1; });
        if(r.span) hgt=Math.max(hgt, lines(s.cells[r.id+'|all'], on.length*colW).length*LINE);
        else s.days.forEach(function(d){ hgt=Math.max(hgt, lines(s.cells[r.id+'|'+d], colW).length*LINE); });
        hgt+=20;
        cell(PAD, labW, hgt, null);
        if(!measureOnly){ ctx.fillStyle=INK; ctx.font='600 18px '+FONT; lab.forEach(function(l,i){ ctx.fillText(l, PAD+labW/2, y+10+i*LINE); }); }
        var put=function(list, x, w){ if(measureOnly) return; ctx.fillStyle=INK; lines(list, w).forEach(function(l,i){ ctx.fillText(l, x+w/2, y+10+i*LINE); }); };
        if(r.span){
          s.days.forEach(function(d,i){ if((r.off||[]).indexOf(d)>-1) cell(PAD+labW+i*colW, colW, hgt, OFF); });
          var first=s.days.indexOf(on[0]);
          if(first>-1){ cell(PAD+labW+first*colW, on.length*colW, hgt, HEAD); put(s.cells[r.id+'|all'], PAD+labW+first*colW, on.length*colW); }
        } else s.days.forEach(function(d,i){
          var x=PAD+labW+i*colW;
          if((r.off||[]).indexOf(d)>-1){ cell(x, colW, hgt, OFF); return; }
          cell(x, colW, hgt, null); put(s.cells[r.id+'|'+d], x, colW);
        });
        y+=hgt;
      });
    } else {
      var placeW=(W-2*PAD)*0.62, whoW=W-2*PAD-placeW;
      (s.sections||[]).forEach(function(sec){
        if(!sec.rows.length) return;
        if(sec.title){ y+=8; ctx.font='800 22px '+FONT; ctx.textAlign='left'; if(!measureOnly){ ctx.fillStyle=TITLE; ctx.fillText(sec.title+(sec.km?' · '+sec.km:''), PAD, y); } y+=36; }
        sec.rows.forEach(function(r){
          ctx.textAlign='left';
          ctx.font='700 19px '+FONT; var pl=dutyWrap_(ctx, r.place+(r.km?' · '+r.km:''), placeW-24);
          ctx.font='400 16px '+FONT; var dl=r.duty?dutyWrap_(ctx, r.duty, placeW-24):[];
          ctx.font='700 18px '+FONT; var wl=[]; (r.people||[]).forEach(function(n){ wl=wl.concat(dutyWrap_(ctx, n, whoW-24)); });
          var hgt=Math.max(pl.length*LINE+dl.length*22, wl.length*LINE)+20;
          if(!measureOnly){
            ctx.strokeStyle=LINEC; ctx.lineWidth=1.5; ctx.strokeRect(PAD, y, placeW, hgt); ctx.strokeRect(PAD+placeW, y, whoW, hgt);
            ctx.fillStyle=INK; ctx.font='700 19px '+FONT; pl.forEach(function(l,i){ ctx.fillText(l, PAD+12, y+10+i*LINE); });
            ctx.fillStyle=MUTED; ctx.font='400 16px '+FONT; dl.forEach(function(l,i){ ctx.fillText(l, PAD+12, y+10+pl.length*LINE+i*22); });
            ctx.fillStyle=INK; ctx.font='700 18px '+FONT; ctx.textAlign='center'; wl.forEach(function(l,i){ ctx.fillText(l, PAD+placeW+whoW/2, y+10+i*LINE); });
          }
          y+=hgt;
        });
      });
    }
    if(s.notes){ y+=16; ctx.textAlign='left'; ctx.font='400 17px '+FONT; ctx.fillStyle=MUTED; dutyWrap_(ctx, s.notes, W-2*PAD).forEach(function(l){ if(!measureOnly) ctx.fillText(l, PAD, y); y+=24; }); }
    return y+PAD;
  };
  W = s.layout==='grid' ? Math.max(1400, 240+s.days.length*190+2*PAD) : 1100;
  // the page's Khmer font may not be loaded yet — a canvas draws with whatever is there
  var ready = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('700 34px "Kantumruy Pro"', 'ក'), document.fonts.load('500 18px "Kantumruy Pro"', 'ក')]).catch(function(){}) : Promise.resolve();
  return ready.then(function(){
    c.width=W; c.height=10;
    H=draw(true);
    c.width=W; c.height=H;
    draw(false);
    return new Promise(function(res){ if(c.toBlob) c.toBlob(function(b){ res(b); }, 'image/png'); else res(null); });
  });
}
/* Send it on: the phone's share sheet when it can take a picture, else a download. */
function dutyShare(blob, filename, title){
  if(!blob) return Promise.resolve('none');
  var file=null;
  try { file=new File([blob], filename, { type:'image/png' }); } catch(e){}
  if(file && navigator.canShare && navigator.canShare({ files:[file] })){
    return navigator.share({ files:[file], title:title }).then(function(){ return 'shared'; }, function(){ return 'cancelled'; });
  }
  var url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
  return Promise.resolve('downloaded');
}
