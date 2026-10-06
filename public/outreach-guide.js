/*  The Outreach Leader's Guide to Cambodia — what a short-term team's leader
    reads before bringing a team: getting the visa sorted, getting here,
    what things cost, and tips. It used to be a Canva PDF sent on request;
    now it lives here and the portal shows it to a team's applicant (the
    "📘 Outreach Leader's Guide" card on their page), with a button to print
    it or save it as a PDF to pass round.

    To change the guide, change the words below — nothing else needs to
    move. Each page is { title, sub?, icon?, blocks:[…] }, and a block is one
    of:
      { h: 'Heading' }                         a heading on the page
      { p: 'Text' }                            a paragraph
      { list: ['…','…'], ordered?: true }      a list (numbered if ordered)
      { note: 'Text' }                         small italic note
      { warn: 'Text' }                         a ⚠️ warning
      { table: { head:[…], rows:[[…],…] } }    a table
      { cols: [ [blocks…], [blocks…] ] }       blocks side by side (stacked on a phone)
      { rule: true }                           a dotted line
    In any text, **bold** is bold and [words](https://…) is a link.

    Plain script, no modules — same contract as duty.js. English only: the
    teams who read it come from abroad. */

var OUTREACH_GUIDE = {
  title: 'Outreach Leader’s Guide to Cambodia',
  tagline: 'Border Crossings | Visas | Airport Immigration | Arrival Tips & More',
  motto: 'Serve the community, educate youth, develop leaders, & train professionals',
  pages: [
    { title: 'Pre-Arrival & Arrival in Cambodia', icon: '🛂', blocks: [
      { h: '1. Letter of Invitation & Visa' },
      { p: 'Your visa steps — sending us everyone’s passport copies, receiving the letter of invitation, and applying for the e-visa — are in your portal, under **Visa**. We walk you through each one there and check it off as it’s done.' },
      { h: 'Preparing to come' },
      { list: [
        'Print 2 color copies of the letter of invitation.',
        'Download the Cambodia e-Arrival app and complete the arrival form up to 3 days before arrival. You can do it together on one phone and do everyone’s profile as a group.',
        'Once you go through immigration, you will receive an email with the v-pass. This will be your digital stamp when entering the country.'
      ], ordered: true },
      { note: 'Upon arrival at the Cambodian airport, go through the immigration officers in person and not the machines. They might direct you to the machines, but show that you have the e-visa and go to the immigration officers in person.' },
      { warn: 'Do not apply for a Tourist Visa, as it cannot be extended once in Cambodia.' },
      { rule: true },
      { h: '2. Visa Extensions' },
      { p: 'If your team will be in Cambodia **longer than one month**, you will need a **visa extension**. The minimum extension is for 3 months. Your outreach coordinator will assist with the visa extension process once you arrive at the campus.' },
      { note: 'For visa and extension fees, see the Budget pages of this guide.' },
      { rule: true },
      { h: '3. E-Arrival Application' },
      { p: 'Cambodia now uses a digital entry system called Cambodia e-Arrival. You can complete this form using the Cambodia e-Arrival app or website.' },
      { list: [
        'When asked about visa type in the form, select Visa on Arrival.',
        '⚠️ Do not apply for the visa itself through the app — this form is only for entry processing.',
        'The e-Arrival form is not your visa.'
      ] },
      { p: 'You must complete the e-Arrival application at least one week before your arrival. Alternatively, you can choose to fill it out upon arrival at the airport or border.' },
      { rule: true },
      { h: '4. Border Crossing' },
      { p: 'If your team is flying into Bangkok, Thailand, you will need to cross the border into Cambodia at Poipet. Here’s what to expect:' },
      { list: [
        '**Travel Time**: Depending on traffic and border activity, the crossing can take 2 to 4 hours, so plan accordingly.',
        '**Visa Process**: The visa process is the same as at the airport. Present your Letter of Invitation at immigration to apply for an Ordinary (E-class) Visa.',
        '**E-Arrival Note**: Even if you’ve completed the e-Arrival form through the app, border officials may still require you to fill out the physical immigration card. Be prepared for both.',
        '**Payment**: Have cash ready for your visa — USD or Khmer Riel are both accepted.'
      ] },
      { h: 'Optional Stop at UofN Poipet Base' },
      { p: 'If you would like to rest or stay overnight before continuing to Siem Reap, there is an option to stay at the UofN Poipet base (which pioneered YWAM Siem Reap), just 15 minutes from the border.' },
      { p: 'If this is something you’re considering, please communicate in advance with your outreach coordinator so arrangements can be made.' }
    ] },

    { title: 'Travel → Siem Reap', icon: '✈️', sub: 'There are several ways to get to Siem Reap, Cambodia, depending on your budget and travel preferences. Here’s a breakdown of the most common options:', blocks: [
      { h: '01 · Fly into Bangkok, Thailand (BKK or DMK)' },
      { p: 'This is often the cheapest route for international flights.' },
      { list: [
        'Fly into Suvarnabhumi (BKK) or Don Mueang (DMK) airports in Bangkok.',
        'Drive approximately 5 hours from Bangkok to the Poipet border.',
        'Cross into Cambodia via the land border.',
        'Drive another 2.5–3 hours from the border to Siem Reap.'
      ], ordered: true },
      { note: 'This route includes multiple transportation legs and immigration stops. Transportation pricing is in the Budget pages.' },
      { rule: true },
      { h: '02 · Fly into Phnom Penh (PNH)' },
      { p: 'This is a simpler route if you want to fly directly into Cambodia.' },
      { list: ['Private van or bus from Phnom Penh to Siem Reap — around 5–6 hours depending on traffic.'], ordered: true },
      { rule: true },
      { h: '03 · Fly directly to Siem Reap (SAI)' },
      { p: 'This is the most convenient and direct way to arrive.' },
      { list: ['Only about a 1-hour drive from the airport to our campus. Recommended for teams with tight schedules or larger groups.'], ordered: true }
    ] },

    { title: 'Budget', icon: '💵', sub: 'Budget breakdown on housing, food, transportation, visa, and more', blocks: [
      { h: 'Accommodation' },
      { p: 'Accommodation provided on our campus includes air-conditioned rooms, filtered water, and meals (Monday–Friday + Sunday dinner).' },
      { table: { head: ['Country Category', 'Cost per person/night', 'Short Stay (under 2 nights)'], rows: [
        ['Country A', '$17', '$20 per night'],
        ['Country B', '$12', '$15 per night'],
        ['Country C', '$7.50', '$10.50 per night']
      ] } },
      { note: 'For child pricing, please ask your team coordinator for current rates and age-specific guidelines. Teams staying under 2 days will have to pay $3 per person per night.' },
      { rule: true },
      { h: 'Transportation' },
      { p: 'Estimated costs for traveling to and within Cambodia for your outreach.' },
      { cols: [
        [ { h: 'Route 1 · Bangkok ↔ Siem Reap' },
          { p: 'Bangkok to the Poipet border:' },
          { list: ['Shared van/bus — $13 per person', 'Private van — $70 for 5 people'], ordered: true },
          { p: 'Poipet border to Siem Reap campus:' },
          { list: ['Taxi (5 people) — $35–45', 'Van (6–15 people) — $50–70'], ordered: true } ],
        [ { h: 'Route 2 · SAI Airport ↔ Siem Reap' },
          { p: 'Siem Reap Airport to Siem Reap campus:' },
          { list: ['Taxi (5 people) — $25 per car', 'Van (6–15 people) — $30 per van'], ordered: true },
          { h: 'Route 3 · Phnom Penh ↔ Siem Reap' },
          { p: 'Phnom Penh Airport to Siem Reap campus:' },
          { list: ['Shared bus/van — $12–20 per person', 'Taxi (5 people) — $80–100', 'Van (6–15 people) — $150–200 per van'], ordered: true } ]
      ] },
      { note: 'Transportation will be arranged for you. Prices vary depending on where you are coming from and if you choose to take private or public taxis.' },
      { rule: true },
      { h: 'Visa' },
      { cols: [
        [ { h: 'VOA (Visa-on-Arrival): $35 per person' },
          { list: ['Valid for 1 month.', 'You will apply for an E Visa (Ordinary Visa).', 'Before arrival, you will be given a letter of invitation. Make sure to get an e-visa, not a tourist visa.'], ordered: true } ],
        [ { h: 'Visa Extension (3-month): $93.50' },
          { list: ['They don’t offer extensions less than 3 months.', 'The visa extension application will be done at the YWAM campus.'], ordered: true } ]
      ] },
      { rule: true },
      { h: 'SIM Card' },
      { cols: [
        [ { p: 'Option of 2 carriers, SMART or Cellcard: **$1.25 per SIM card**.' } ],
        [ { p: 'Data: around $1 per week if you go with a Cambodian carrier.' } ]
      ] },
      { rule: true },
      { cols: [
        [ { h: 'Translator' },
          { p: '**$2 USD/day/person.** We don’t have a specific translator, but we do have a few of our base staff that will join to help translate when going to villages for evangelism. They are not expected gifts, but it is a great way to thank them for the hard work they do.' } ],
        [ { h: 'Ministry' },
          { p: '**$2 USD/day/person.** You won’t use this amount every day, whereas on other days you might use more. This is to help with any of the ministries that you are working in, i.e., maintenance, jerseys / equipment, greenery, medical stations, etc. This is completely at your discretion.' } ]
      ] },
      { rule: true },
      { h: 'Transportation in Siem Reap' },
      { cols: [
        [ { h: 'Tuktuk' },
          { p: 'Tuktuks, also known as rormorks, are a common mode of transportation in Cambodia. You’ll be using them to travel to and from ministry locations. The villages you’ll be serving in are typically a 30 to 60-minute ride away.' },
          { list: ['Villages 30–40 min away: **$14/tuktuk (seats 4–5 people)**', 'Villages 50–60 min away: **$17/tuktuk (seats 4–5 people)**'], ordered: true } ],
        [ { h: 'PassApp' },
          { p: 'Hop on your phone and go to the App Store or Play Store to download the application “PassApp”! It’s an app that you will use often in our city (think Uber, but in Southeast Asian tuktuk style!). It’s helpful for your grocery runs, going to church, and other errands you need to do. A typical ride ranges between **4,000–10,000 KHR ($1–$2.50)**.' },
          { note: 'You will need a Cambodian number to use the app. Another alternative is an app called Grab, which doesn’t require a Cambodian phone number.' } ]
      ] },
      { rule: true },
      { h: 'Weekend food' },
      { p: 'Accommodation on our campus includes meals (Monday–Friday + Sunday dinner). Our base does **not** have meals on Saturday (breakfast, lunch, dinner) or Sunday breakfast and lunch.' },
      { p: 'Your team will have to prepare your own meals. Budget around **$20 for the weekend per person**.' },
      { note: 'You can budget for more, as foreign food prices tend to be higher in Siem Reap.' }
    ] },

    { title: 'Additional Tips', icon: '📝', blocks: [
      { h: '1. Spiritual Preparation' },
      { list: [
        'Pray as a team before coming — ask God to prepare hearts for both giving and receiving.',
        'Encourage team members to come with servant hearts, flexibility, and humility.',
        'Be prepared for spiritual warfare and moments of stretching — especially when working in new environments.',
        'Remember, you set the tone and the culture of the team.'
      ] },
      { h: '2. Cultural Awareness' },
      { list: [
        'Cambodia is a high-context, relationship-based culture. Respect, patience, and gentle communication go a long way.',
        'Avoid public displays of affection, raising voices, or expressing frustration publicly.',
        'Read through the “Guide for Short-term Teams” book with your team before coming.'
      ] },
      { h: '3. Health & Safety' },
      { list: [
        'Pack and bring any prescription medications and basic first-aid supplies. (Pharmacies are easy to find, but they may not have all the medications you’re looking for.)',
        'Stay hydrated (bring reusable water bottles).'
      ] },
      { h: '4. Communication' },
      { list: ['Download Facebook Messenger for team communication in-country (widely used in Cambodia).'] },
      { h: '5. Team Finances' },
      { list: [
        'Make sure the team has enough cash in USD (smaller bills preferred: $1s, $5s, $10s).',
        'Credit/debit cards are only accepted in some places — most transactions are cash-based.',
        'When traveling around the city, avoid carrying large sums of money.'
      ] },
      { h: '6. Expect the Unexpected' },
      { list: [
        'Things might not always go according to plan. Flexibility is key.',
        'Encourage your team to view every challenge as an opportunity for growth and learning.'
      ] },
      { h: '7. Relationships Matter' },
      { list: [
        'Outreach is not just about doing — it’s about being present with people.',
        'Empower your team to listen, ask questions, and build relationships rather than rushing into activities.'
      ] },
      { h: '8. Debriefing Time' },
      { list: [
        'Plan daily or weekly debriefs with your team to process experiences, pray, and check in on their spiritual and emotional health.',
        'Encourage journaling or sharing testimonies throughout the trip.'
      ] }
    ] }
  ]
};

/* The guide as HTML. esc escapes text; **bold** and [text](url) are the only
   markup. The page brings its own look (a white sheet with the guide's
   terracotta), so it reads the same in the dark portal and on paper. */
function outreachGuideHtml(esc){
  var g = OUTREACH_GUIDE;
  var inline = function(s){
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  };
  var block = function(b){
    if(b.h) return '<h3 class="ogH">'+inline(b.h)+'</h3>';
    if(b.p) return '<p class="ogP">'+inline(b.p)+'</p>';
    if(b.note) return '<p class="ogNote">'+inline(b.note)+'</p>';
    if(b.warn) return '<p class="ogWarn">⚠️ '+inline(b.warn)+'</p>';
    if(b.rule) return '<hr class="ogRule">';
    if(b.list){ var tag = b.ordered ? 'ol' : 'ul'; return '<'+tag+' class="ogList">'+b.list.map(function(x){ return '<li>'+inline(x)+'</li>'; }).join('')+'</'+tag+'>'; }
    if(b.table) return '<div class="ogTableWrap"><table class="ogTable"><thead><tr>'+b.table.head.map(function(x){ return '<th>'+inline(x)+'</th>'; }).join('')+'</tr></thead><tbody>'+
      b.table.rows.map(function(r){ return '<tr>'+r.map(function(x){ return '<td>'+inline(x)+'</td>'; }).join('')+'</tr>'; }).join('')+'</tbody></table></div>';
    if(b.cols) return '<div class="ogCols">'+b.cols.map(function(c){ return '<div class="ogCol">'+c.map(block).join('')+'</div>'; }).join('')+'</div>';
    return '';
  };
  var h = '<article class="og" id="outreachGuide">';
  h += '<section class="ogPage ogCover"><div class="ogBand"></div><h1 class="ogTitle">'+esc(g.title)+'</h1><p class="ogTag">'+esc(g.tagline)+'</p>'+
    '<div class="ogStamp">🇰🇭</div><nav class="ogToc">'+g.pages.map(function(pg, i){ return '<a href="#og'+i+'">'+(pg.icon ? pg.icon+' ' : '')+esc(pg.title)+'</a>'; }).join('')+'</nav>'+
    '<div class="ogBand ogMotto">'+esc(g.motto)+'</div></section>';
  g.pages.forEach(function(pg, i){
    h += '<section class="ogPage" id="og'+i+'"><h2 class="ogPageTitle">'+esc(pg.title)+(pg.icon ? ' <span class="ogIcon">'+pg.icon+'</span>' : '')+'</h2>'+
      (pg.sub ? '<p class="ogSub">'+inline(pg.sub)+'</p>' : '')+pg.blocks.map(block).join('')+'</section>';
  });
  return h + '</article>';
}

(function(){
  if(typeof document==='undefined' || document.getElementById('ogCss')) return;
  var st = document.createElement('style'); st.id = 'ogCss';
  st.textContent =
    '.og{--og:#c8664a;--ogInk:#1a1a1a;--ogMuted:#555;--ogLine:#ddd;background:#fff;color:var(--ogInk);border-radius:16px;overflow:hidden;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;line-height:1.5}'+
    '.og a{color:var(--og)}'+
    '.og h1,.og h2,.og h3{text-transform:none;letter-spacing:0;font-family:inherit}'+
    '.ogPage{padding:22px 20px 26px;border-top:1px solid var(--ogLine)}'+
    '.ogCover{padding:0;border-top:0;text-align:center}'+
    '.ogBand{background:var(--og);height:22px}'+
    '.ogMotto{height:auto;color:#fff;padding:14px 20px;font-size:14px;margin-top:22px}'+
    '.ogTitle{font-size:30px;line-height:1.15;font-weight:800;margin:34px 20px 10px;color:var(--ogInk)}'+
    '.ogTag{font-size:13px;color:var(--ogMuted);margin:0 20px}'+
    '.ogStamp{font-size:54px;margin:18px 0 6px}'+
    '.ogToc{display:flex;flex-direction:column;gap:6px;max-width:320px;margin:10px auto 0;text-align:left;padding:0 20px}'+
    '.ogToc a{display:block;border:1px solid var(--ogLine);border-radius:10px;padding:9px 12px;text-decoration:none;color:var(--ogInk);font-weight:700;font-size:14px}'+
    '.ogPageTitle{font-size:26px;line-height:1.15;font-weight:800;margin:0 0 6px;color:var(--ogInk)}'+
    '.ogIcon{font-size:22px}'+
    '.ogSub{font-style:italic;color:var(--ogMuted);margin:0 0 14px}'+
    '.ogH{font-size:17px;font-weight:800;margin:16px 0 6px;color:var(--ogInk)}'+
    '.ogP{margin:6px 0;font-size:15px}'+
    '.ogNote{font-style:italic;color:var(--ogMuted);font-size:13.5px;margin:8px 0}'+
    '.ogWarn{background:#fdf1ec;border-left:4px solid var(--og);border-radius:8px;padding:8px 12px;font-size:14px;margin:10px 0}'+
    '.ogList{margin:6px 0;padding-left:22px;font-size:15px}'+
    '.ogList li{margin:3px 0}'+
    '.ogRule{border:0;border-top:2px dotted #999;margin:18px 0}'+
    '.ogTableWrap{overflow-x:auto}'+
    '.ogTable{width:100%;border-collapse:collapse;font-size:14px;margin:8px 0}'+
    '.ogTable th,.ogTable td{border:1px solid var(--ogLine);padding:8px 10px;text-align:left}'+
    '.ogTable th{background:#faf3ef}'+
    '.ogTable td+td{text-align:right}'+
    '.ogCols{display:grid;grid-template-columns:1fr;gap:4px 20px}'+
    '@media (min-width:640px){.ogCols{grid-template-columns:1fr 1fr}.ogPage{padding:28px 32px}}'+
    '@media print{body *{visibility:hidden}.og,.og *{visibility:visible}.og{position:absolute;left:0;top:0;width:100%;border-radius:0}.ogPage{break-before:page}.ogCover{break-before:auto}.ogToc{display:none}}';
  document.head.appendChild(st);
})();
