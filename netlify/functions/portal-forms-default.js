/* The YWAM GP Portal's application forms, as shipped — one per kind of
   application: the four schools, staff, volunteer, team. This is the
   STARTING point: a portal admin edits questions on the staff side
   (Applications → Forms), and what they save lands in the 'portalForms' blob
   and replaces the form here for that key. "Reset to default" brings this
   back. So wording lives in data, never in logic — and never rewrite a
   stored form from here.

   Shape: { key, title:{en,km}, sections:[{ id, title:{en,km}, help:{en,km},
     questions:[{ id, type, label:{en,km}, help:{en,km}, required,
       options:[{en,km}], audience:'all'|'khmer'|'international' }] }] }
   Types: short · long · choice · multi · yesno · date · number · email · phone.
   Audience: a question shown only to Khmer applicants (country Cambodia) or
   only to international ones; 'all' is everyone. Ids are stable handles for
   the answers — renaming a label keeps the answers; deleting a question
   keeps its old answers on the record but no longer asks or shows it. */

const T = (en, km) => ({ en, km });
const q = (id, type, en, km, extra) => Object.assign({ id, type, label: T(en, km), help: T('', ''), required: false, options: [], audience: 'all' }, extra || {});
const opts = (pairs) => pairs.map((p) => T(p[0], p[1]));
const YESNO = opts([['Yes', 'បាទ/ចាស'], ['No', 'ទេ']]);

const aboutYou = () => ({
  id: 'about', title: T('About you', 'អំពីអ្នក'), help: T('Your name, email and phone are already on your account.', 'ឈ្មោះ អ៉ីមែល និងទូរស័ព្ទរបស់អ្នកមាននៅលើគណនីរួចហើយ។'),
  questions: [
    q('dob', 'date', 'Date of birth', 'ថ្ងៃខែឆ្នាំកំណើត', { required: true }),
    q('gender', 'choice', 'Gender', 'ភេទ', { required: true, options: opts([['Male', 'ប្រុស'], ['Female', 'ស្រី']]) }),
    q('marital', 'choice', 'Marital status', 'ស្ថានភាពគ្រួសារ', { required: true, options: opts([['Single', 'នៅលីវ'], ['Engaged', 'ភ្ជាប់ពាក្យ'], ['Married', 'រៀបការ']]) }),
    q('address', 'long', 'Home address (town and country is enough)', 'អាសយដ្ឋានផ្ទះ (ក្រុង និងប្រទេសគ្រប់គ្រាន់)', { required: true }),
    q('church', 'short', 'Your home church', 'ព្រះវិហាររបស់អ្នក', { required: true }),
    q('leader', 'short', 'Your pastor or leader’s name', 'ឈ្មោះគ្រូគង្វាល ឬអ្នកដឹកនាំរបស់អ្នក', { required: true }),
    q('leaderContact', 'short', 'Your pastor or leader’s phone or email', 'ទូរស័ព្ទ ឬអ៉ីមែលរបស់គ្រូគង្វាល ឬអ្នកដឹកនាំ', { required: true, audience: 'international', help: T('We will ask them for a short reference.', 'យើងនឹងសុំលិខិតយោងខ្លីពីពួកគេ។') }),
    q('emergencyName', 'short', 'Emergency contact — name', 'អ្នកទាក់ទងបន្ទាន់ — ឈ្មោះ', { required: true }),
    q('emergencyPhone', 'phone', 'Emergency contact — phone', 'អ្នកទាក់ទងបន្ទាន់ — ទូរស័ព្ទ', { required: true })
  ]
});
const faith = () => ({
  id: 'faith', title: T('Your faith', 'ជំនឿរបស់អ្នក'), help: T('', ''),
  questions: [
    q('testimony', 'long', 'Tell us how you came to know Jesus.', 'ប្រាប់យើងថាអ្នកបានស្គាល់ព្រះយេស៊ូវយ៉ាងដូចម្តេច។', { required: true }),
    q('walk', 'long', 'How would you describe your relationship with God right now?', 'អ្នកពិពណ៏នាទំនាក់ទំនងរបស់អ្នកជាមួយព្រះនៅពេលនេះយ៉ាងដូចម្តេច?', { required: true }),
    q('involvement', 'long', 'How are you involved in your church or community?', 'អ្នកចូលរួមក្នុងព្រះវិហារ ឬសហគមន៏របស់អ្នកយ៉ាងដូចម្តេច?')
  ]
});
const health = () => ({
  id: 'health', title: T('Health and practical', 'សុខភាព និងការអនុវត្ត'), help: T('', ''),
  questions: [
    q('health', 'long', 'Any health conditions, medications or allergies we should know about?', 'មានស្ថានភាពសុខភាព ថ្នាំ ឬអាឡែស៉ីអ្វីដែលយើងគួរដឹងទេ?', { required: true }),
    q('diet', 'short', 'Any food you cannot eat?', 'មានអាហារអ្វីដែលអ្នកមិនអាចញ៉ាំបានទេ?'),
    q('finances', 'yesno', 'Do you have a plan for the fees and your living costs?', 'អ្នកមានផែនការសម្រាប់ថ្លៃសិក្សា និងការចំណាយរស់នៅទេ?', { required: true, options: YESNO }),
    q('start', 'short', 'When would you like to start?', 'អ្នកចង់ចាប់ផ្តើមនៅពេលណា?', { required: true })
  ]
});
const school = (name, km, secondary) => ({
  id: 'school', title: T('About ' + name, 'អំពី ' + name), help: T('', ''),
  questions: [
    q('why', 'long', 'Why do you want to do ' + name + '?', 'ហេតុអ្វីអ្នកចង់រៀន ' + name + '?', { required: true }),
    q('expect', 'long', 'What do you hope God will do in you and through you during the school?', 'អ្នកសង្ឃឹមថាព្រះនឹងធ្វើអ្វីក្នុងអ្នក និងតាមរយៈអ្នកក្នុងអំឡុងសាលា?', { required: true }),
    ...(secondary ? [
      q('dtsDone', 'yesno', 'Have you completed a DTS?', 'អ្នកបានបញ្ចប់ DTS រួចហើយឬ?', { required: true, options: YESNO, help: T(name + ' requires a completed DTS.', name + ' តម្រូវឱ្យបានបញ្ចប់ DTS។') }),
      q('dtsWhere', 'short', 'Where and when did you do your DTS?', 'អ្នកបានរៀន DTS នៅទីណា និងពេលណា?', { required: true })
    ] : []),
    q('english', 'choice', 'How is your English?', 'ភាសាអង់គ្លេសរបស់អ្នកយ៉ាងណា?', { audience: 'khmer', required: true, options: opts([['Basic', 'មូលដ្ឋាន'], ['Good', 'ល្អ'], ['Fluent', 'ស្ទាត់']]) }),
    q('khmer', 'choice', 'Do you speak any Khmer?', 'អ្នកនិយាយភាសាខ្មែរបានទេ?', { audience: 'international', options: opts([['None yet', 'មិនទាន់'], ['A little', 'បន្តិចបន្តួច'], ['Conversational', 'អាចសន្ទនាបាន']]) })
  ]
});
const studentForm = (key, name, km, secondary) => ({
  key, title: T(name + ' application', 'ពាក្យសុំ ' + name),
  sections: [aboutYou(), faith(), school(name, km, secondary), health()]
});

const staffForm = {
  key: 'staff', title: T('Staff application', 'ពាក្យសុំបុគ្គលិក'),
  sections: [aboutYou(), faith(), {
    id: 'serving', title: T('Serving with us', 'បម្រើជាមួយយើង'), help: T('', ''),
    questions: [
      q('dtsDone', 'yesno', 'Have you completed a DTS?', 'អ្នកបានបញ្ចប់ DTS រួចហើយឬ?', { required: true, options: YESNO, help: T('YWAM staff have completed a DTS.', 'បុគ្គលិក YWAM បានបញ្ចប់ DTS។') }),
      q('dtsWhere', 'short', 'Where and when did you do your DTS?', 'អ្នកបានរៀន DTS នៅទីណា និងពេលណា?', { required: true }),
      q('ministry', 'long', 'Which ministry would you like to serve in, and why?', 'អ្នកចង់បម្រើក្នុងព័ន្ធកិច្ចណា ហើយហេតុអ្វី?', { required: true }),
      q('experience', 'long', 'What experience, skills or training do you bring?', 'អ្នកមានបទពិសោធន៏ ជំនាញ ឬការបណ្តុះបណ្តាលអ្វីខ្លះ?', { required: true }),
      q('commitment', 'choice', 'How long are you hoping to commit?', 'អ្នកសង្ឃឹមថានឹងប្តេជ្ញារយៈពេលប៉ុន្មាន?', { required: true, options: opts([['1 year', '១ ឆ្នាំ'], ['2 years', '២ ឆ្នាំ'], ['Longer', 'យូរជាងនេះ']]) }),
      q('support', 'long', 'How do you plan to be financially supported?', 'អ្នកមានផែនការទទួលការឧបត្ថម្ភហិរញ្ញវត្ថុយ៉ាងដូចម្តេច?', { required: true })
    ]
  }, health()]
};

const volunteerForm = {
  key: 'volunteer', title: T('Volunteer application', 'ពាក្យសុំអ្នកស្ម័គ្រចិត្ត'),
  sections: [aboutYou(), faith(), {
    id: 'serving', title: T('Your time with us', 'ពេលវេលារបស់អ្នកជាមួយយើង'), help: T('', ''),
    questions: [
      q('from', 'date', 'When would you like to arrive?', 'អ្នកចង់មកដល់នៅពេលណា?', { required: true }),
      q('to', 'date', 'When would you leave?', 'អ្នកនឹងចាកចេញនៅពេលណា?', { required: true }),
      q('skills', 'long', 'What would you like to help with? Any skills or experience?', 'អ្នកចង់ជួយអ្វី? មានជំនាញ ឬបទពិសោធន៏អ្វីទេ?', { required: true }),
      q('heard', 'short', 'How did you hear about us?', 'អ្នកបានដឹងអំពីយើងយ៉ាងដូចម្តេច?')
    ]
  }, health()]
};

const teamForm = {
  key: 'team', title: T('Short-term team application', 'ពាក្យសុំក្រុមរយៈពេលខ្លី'),
  sections: [{
    id: 'team', title: T('Your team', 'ក្រុមរបស់អ្នក'), help: T('', ''),
    questions: [
      q('teamName', 'short', 'Team name', 'ឈ្មោះក្រុម', { required: true }),
      q('org', 'short', 'Sending church, base or organisation', 'ព្រះវិហារ មូលដ្ឋាន ឬអង្គការដែលបញ្ជូន', { required: true }),
      q('leaderName', 'short', 'Team leader’s name', 'ឈ្មោះអ្នកដឹកនាំក្រុម', { required: true }),
      q('leaderEmail', 'email', 'Team leader’s email', 'អ៉ីមែលអ្នកដឹកនាំក្រុម', { required: true }),
      q('size', 'number', 'How many people in total?', 'មានមនុស្សប៉ុន្មាននាក់សរុប?', { required: true }),
      q('focus', 'long', 'What kind of outreach is your team hoping to do?', 'ក្រុមរបស់អ្នកសង្ឃឹមធ្វើការផ្សព្វផ្សាយប្រភេទណា?', { required: true })
    ]
  }, {
    id: 'dates', title: T('Dates at our base', 'កាលបរិច្ឆេទនៅមូលដ្ឋានរបស់យើង'), help: T('The days your team stays with us. Estimates are fine — you can come back and update them in your account as your plans firm up.', 'ថ្ងៃដែលក្រុមរបស់អ្នកស្នាក់នៅជាមួយយើង។ ការប៉ាន់ស្មានក៏បាន — អ្នកអាចត្រឡប់មកកែក្នុងគណនីរបស់អ្នក នៅពេលផែនការច្បាស់ជាងនេះ។'),
    questions: [
      q('arrival', 'date', 'Arrival at our base', 'មកដល់មូលដ្ឋានរបស់យើង', { required: true }),
      q('departure', 'date', 'Departure from our base', 'ចាកចេញពីមូលដ្ឋានរបស់យើង', { required: true })
    ]
  }, {
    id: 'cambodia', title: T('Dates in Cambodia', 'កាលបរិច្ឆេទនៅកម្ពុជា'),
    help: T('For your visa: your whole time in the country, not only at our base. The location your team starts at is responsible for handling your visa.', 'សម្រាប់ទិដ្ឋាការរបស់អ្នក៖ ពេលវេលាទាំងមូលក្នុងប្រទេស មិនមែនតែនៅមូលដ្ឋានយើងទេ។ ទីតាំងដែលក្រុមរបស់អ្នកចាប់ផ្តើមមុនគេ ទទួលខុសត្រូវរៀបចំទិដ្ឋាការរបស់អ្នក។'),
    questions: [
      q('arrivalKh', 'date', 'Arrival in Cambodia', 'មកដល់កម្ពុជា', { required: true }),
      q('departureKh', 'date', 'Departure from Cambodia', 'ចាកចេញពីកម្ពុជា', { required: true }),
      q('otherLocations', 'long', 'Will you serve in other locations in Cambodia before or after our base? If so, where?', 'អ្នកនឹងបម្រើនៅទីកន្លែងផ្សេងក្នុងកម្ពុជាមុន ឬក្រោយមូលដ្ឋានរបស់យើងទេ? បើដូច្នេះ នៅទីណា?', { required: true }),
      q('firstLocation', 'choice', 'Which location will your team arrive at first?', 'ក្រុមរបស់អ្នកនឹងមកដល់ទីតាំងណាមុនគេ?', { required: true, options: opts([['Our base', 'មូលដ្ឋានរបស់យើង'], ['Another location in Cambodia', 'ទីតាំងផ្សេងក្នុងកម្ពុជា']]),
        help: T('The location you start at handles your team’s visa. If that is us, we send the letter of invitation once your flights are confirmed.', 'ទីតាំងដែលអ្នកចាប់ផ្តើមមុនគេ រៀបចំទិដ្ឋាការក្រុមរបស់អ្នក។ បើជាយើង យើងផ្ញើលិខិតអញ្ជើញនៅពេលការហោះហើររបស់អ្នកបានបញ្ជាក់។') })
    ]
  }, {
    id: 'hospitality', title: T('Hospitality', 'បដិសណ្ឋារកិច្ច'), help: T('So we can prepare rooms and meals. Your best estimate for now — update the numbers in your account once your team is confirmed.', 'ដើម្បីឱ្យយើងរៀបចំបន្ទប់ និងអាហារ។ ប៉ាន់ស្មានឱ្យបានល្អបំផុតសិន — កែចំនួនក្នុងគណនីរបស់អ្នក នៅពេលក្រុមរបស់អ្នកបានបញ្ជាក់ច្បាស់។'),
    questions: [
      q('males', 'number', 'How many males?', 'បុរសប៉ុន្មាននាក់?', { required: true }),
      q('females', 'number', 'How many females?', 'ស្ត្រីប៉ុន្មាននាក់?', { required: true }),
      q('couples', 'number', 'How many couples or families?', 'គូស្វាមីភរិយា ឬគ្រួសារប៉ុន្មាន?', { required: true }),
      q('allergies', 'long', 'Any food allergies?', 'មានអាឡែស៉ីអាហារទេ?')
    ]
  }]
};

const PORTAL_FORMS_DEFAULT = {
  dts: studentForm('dts', 'DTS', 'DTS', false),
  dbs: studentForm('dbs', 'DBS', 'DBS', true),
  bcs: studentForm('bcs', 'BCS', 'BCS', true),
  sms: studentForm('sms', 'SMS', 'SMS', true),
  staff: staffForm,
  volunteer: volunteerForm,
  team: teamForm
};
export default PORTAL_FORMS_DEFAULT;
