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
/* The DTS form follows the base's own "GP DTS Application" Google Form
   (September 2026), section by section and question by question. The
   Khmer here is a fresh translation for review — the source's Khmer could not
   be read out of the exported PDF. Two things were changed on purpose: phone
   and email are optional because the account already has them, and the
   "if yes / if not" follow-ups are optional. Question ids that other code and
   tests lean on are kept: dob, gender, church, testimony, english (Khmer
   students), leaderContact (international students). */
const dtsForm = () => ({
  key: 'dts', title: T('DTS application', 'ពាក្យសុំ DTS'),
  sections: [{
    id: 'personal', title: T('Personal information', 'ព័ត៌មានផ្ទាល់ខ្លួន'), help: T('', ''),
    questions: [
      q('firstName', 'short', 'First name', 'នាមខ្លួន', { required: true }),
      q('lastName', 'short', 'Last name', 'នាមត្រកូល', { required: true }),
      q('khmerName', 'short', 'Last name and first name in Khmer script', 'នាមត្រកូល និងនាមខ្លួន ជាអក្សរខ្មែរ', { required: true, audience: 'khmer' }),
      q('gender', 'choice', 'Sex', 'ភេទ', { required: true, options: opts([['Male', 'ប្រុស'], ['Female', 'ស្រី']]) }),
      q('dob', 'date', 'Date of birth', 'ថ្ងៃខែឆ្នាំកំណើត', { required: true })
    ]
  }, {
    id: 'address', title: T('Address and contact information', 'អាសយដ្ឋាន និងព័ត៌មានទំនាក់ទំនង'), help: T('Your phone and email are already on your account — add them here only if they differ.', 'ទូរស័ព្ទ និងអ៉ីមែលរបស់អ្នកមាននៅលើគណនីរួចហើយ — បញ្ចូលនៅទីនេះ តែក្នុងករណីខុសគ្នា។'),
    questions: [
      q('street', 'short', 'Street address', 'ភូមិ / ផ្លូវ', { required: true }),
      q('city', 'short', 'City', 'ស្រុក / ក្រុង', { required: true }),
      q('state', 'short', 'State or province', 'ខេត្ត', { required: true }),
      q('phone', 'phone', 'Phone number', 'លេខទូរស័ព្ទ'),
      q('email', 'email', 'Email (if any)', 'អ៉ីមែល (បើមាន)')
    ]
  }, {
    id: 'family', title: T('Relationship status', 'ស្ថានភាពគ្រួសារ'), help: T('', ''),
    questions: [
      q('marital', 'choice', 'Marital status', 'ស្ថានភាពគ្រួសារ', { required: true, options: opts([['Single', 'នៅលីវ'], ['Engaged', 'ភ្ជាប់ពាក្យ'], ['Married', 'រៀបការ'], ['Divorced', 'លែងលះ']]) }),
      q('hasChild', 'yesno', 'Do you have a child?', 'តើអ្នកមានកូនដែរឬទេ?', { required: true, options: YESNO }),
      q('children', 'number', 'If yes, how many children do you have?', 'បើមាន តើមានកូនប៉ុន្មាននាក់?')
    ]
  }, {
    id: 'church', title: T('Church information', 'ព័ត៌មានក្រុមជំនុំ'), help: T('', ''),
    questions: [
      q('church', 'short', 'Church name', 'ឈ្មោះក្រុមជំនុំ', { required: true }),
      q('pastorName', 'short', 'Pastor’s name', 'ឈ្មោះគ្រូគង្វាល', { required: true }),
      q('pastorPhone', 'phone', 'Pastor’s phone number', 'លេខទូរស័ព្ទគ្រូគង្វាល', { required: true }),
      q('pastorEmail', 'email', 'Pastor’s email (if any)', 'អ៉ីមែលគ្រូគង្វាល (បើមាន)'),
      q('leaderContact', 'short', 'Your pastor or leader’s phone or email', 'ទូរស័ព្ទ ឬអ៉ីមែលរបស់គ្រូគង្វាល ឬអ្នកដឹកនាំ', { required: true, audience: 'international', help: T('We will ask them for a short reference.', 'យើងនឹងសុំលិខិតយោងខ្លីពីពួកគេ។') })
    ]
  }, {
    id: 'guardian', title: T('Family contact', 'ទំនាក់ទំនងគ្រួសារ'), help: T('', ''),
    questions: [
      q('guardianName', 'short', 'Parent or guardian’s name', 'ឈ្មោះឪពុកម្តាយ ឬអាណាព្យាបាល', { required: true }),
      q('guardianPhone', 'phone', 'Parent or guardian’s phone number', 'លេខទូរស័ព្ទឪពុកម្តាយ ឬអាណាព្យាបាល', { required: true })
    ]
  }, {
    id: 'friend', title: T('Friend reference', 'ព័ត៌មានមិត្តភក្តិ'), help: T('Someone who knows you well.', 'នរណាម្នាក់ដែលស្គាល់អ្នកច្បាស់។'),
    questions: [
      q('friendRelation', 'short', 'What is their relationship to you?', 'តើគាត់ត្រូវជាអ្វីនឹងអ្នក?', { required: true }),
      q('friendName', 'short', 'Friend’s name', 'ឈ្មោះមិត្តភក្តិ', { required: true }),
      q('friendPhone', 'phone', 'Friend’s phone number', 'លេខទូរស័ព្ទមិត្តភក្តិ', { required: true })
    ]
  }, {
    id: 'more', title: T('Additional personal information', 'ព័ត៌មានផ្ទាល់ខ្លួនបន្ថែម'), help: T('Please be honest with your answers so we can better help you.', 'សូមឆ្លើយដោយស្មោះត្រង់ ដើម្បីឱ្យយើងអាចជួយអ្នកបានល្អជាងមុន។'),
    questions: [
      q('education', 'short', 'Highest level of education', 'កម្រិតការអប់រំខ្ពស់បំផុត', { required: true }),
      q('languages', 'short', 'How many languages do you speak? Please list them all.', 'តើអ្នកនិយាយបានប៉ុន្មានភាសា? សូមរាយទាំងអស់។', { required: true }),
      q('english', 'choice', 'How is your English?', 'ភាសាអង់គ្លេសរបស់អ្នកយ៉ាងណា?', { audience: 'khmer', required: true, options: opts([['Basic', 'មូលដ្ឋាន'], ['Good', 'ល្អ'], ['Fluent', 'ស្ទាត់']]) })
    ]
  }, {
    id: 'faith', title: T('Personal faith questions', 'សំណួរអំពីជំនឿ'), help: T('', ''),
    questions: [
      q('testimony', 'long', 'Tell us how you became a Christian.', 'សូមប្រាប់យើងថាអ្នកបានក្លាយជាគ្រីស្ទបរិស័ទយ៉ាងដូចម្តេច។', { required: true }),
      q('godRelationship', 'long', 'Tell us about your current relationship with God.', 'សូមប្រាប់អំពីទំនាក់ទំនងបច្ចុប្បន្នរបស់អ្នកជាមួយព្រះ។', { required: true }),
      q('churchInvolvement', 'long', 'How is your relationship with your church? Tell us about your church involvement.', 'ទំនាក់ទំនងរបស់អ្នកជាមួយក្រុមជំនុំយ៉ាងណា? សូមប្រាប់អំពីការចូលរួមរបស់អ្នកក្នុងក្រុមជំនុំ។', { required: true }),
      q('familyRelationship', 'long', 'Tell us about your current relationship with your family.', 'សូមប្រាប់អំពីទំនាក់ទំនងបច្ចុប្បន្នរបស់អ្នកជាមួយគ្រួសារ។', { required: true }),
      q('future', 'long', 'What do you want to do in the future?', 'តើអ្នកចង់ធ្វើអ្វីនៅថ្ងៃអនាគត?', { required: true }),
      q('character', 'long', 'Which part of your character do you want to develop?', 'តើចំណុចណាខ្លះនៃអត្តចរិតរបស់អ្នក ដែលអ្នកចង់អភិវឌ្ឍ?', { required: true }),
      q('whyDts', 'long', 'Why do you want to study DTS?', 'ហេតុអ្វីបានជាអ្នកចង់រៀន DTS?', { required: true }),
      q('health', 'long', 'Do you have any health issues that require medication or special treatment?', 'តើអ្នកមានបញ្ហាសុខភាពដែលត្រូវការថ្នាំ ឬការព្យាបាលពិសេសទេ?', { required: true }),
      q('other', 'long', 'Is there anything else you would like to tell us?', 'តើមានអ្វីផ្សេងទៀតដែលអ្នកចង់ប្រាប់យើងទេ?')
    ]
  }, {
    id: 'finance', title: T('Financial information', 'ព័ត៌មានអំពីថវិកា'), help: T('', ''),
    questions: [
      q('funds', 'yesno', 'The DTS lecture phase costs $2000 USD. Do you have the funds to cover this cost?', 'តម្លៃសិក្សា DTS គឺ ៦២០ ដុល្លារ។ តើអ្នកមានលទ្ធភាពគ្រប់គ្រាន់ក្នុងការបង់ថ្លៃសិក្សាដែរឬទេ?', { required: true, options: YESNO }),
      q('fundsPlan', 'long', 'If not, how do you plan to pay for the DTS lecture phase and outreach?', 'បើមិនមាន តើអ្នកមានផែនការបង់ថ្លៃសិក្សា និងការផ្សព្វផ្សាយយ៉ាងដូចម្តេច?')
    ]
  }, {
    id: 'documents', title: T('Needed documentation', 'ឯកសារដែលត្រូវការ'), help: T('Your contact will tell you where to send these; uploading them here is coming.', 'អ្នកទាក់ទងរបស់អ្នកនឹងប្រាប់កន្លែងផ្ញើ; ការផ្ទុកឡើងនៅទីនេះនឹងមកដល់ឆាប់ៗ។'),
    questions: [
      q('docsReady', 'yesno', 'Do you have your ID card or birth certificate, your family book and a recent photo ready to send us?', 'តើអ្នកមានអត្តសញ្ញាណបណ្ណ ឬសំបុត្រកំណើត សៀវភៅគ្រួសារ និងរូបថតថ្មី ត្រៀមផ្ញើមកយើងដែរឬទេ?', { required: true, audience: 'khmer', options: YESNO }),
      q('passportReady', 'yesno', 'Do you have a copy of your passport and a recent photo ready to send us?', 'តើអ្នកមានច្បាប់ចម្លងលិខិតឆ្លងដែន និងរូបថតថ្មី ត្រៀមផ្ញើមកយើងដែរឬទេ?', { required: true, audience: 'international', options: YESNO })
    ]
  }]
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

/* The leader reference — what an applicant's pastor or leader fills in at
   portal.html?ref=<token>, following the base's "YWAM SR Leader Reference
   Form" (Google Form, September 2026). Leaders of international applicants
   read English, so the Khmer side is left empty here (English shows for both
   languages) — a portal admin adds Khmer in the editor when it is wanted.
   The applicant's name is shown from the link, not asked. */
const E = (en) => T(en, '');
const rq = (id, type, en, extra) => Object.assign(q(id, type, en, ''), { required: true }, extra || {});
const RATING = opts([['1 — Poor', ''], ['2', ''], ['3', ''], ['4', ''], ['5 — Excellent', '']]);
const STRENGTH = opts([['Strong', ''], ['Moderate', ''], ['Limited', ''], ['Not known', '']]);
const YNU = opts([['Yes', ''], ['No', ''], ['Unsure', '']]);
const referenceForm = {
  key: 'reference', title: E('Leader reference form'),
  sections: [{
    id: 'basic', title: E('Basic information'),
    help: E('The applicant has applied to YWAM Siem Reap (Youth With A Mission), an international, interdenominational Christian missionary organization whose training is part of the University of the Nations. Your comments will be considered seriously, so we ask that you complete this form carefully. Your prompt attention (within 7 days) is appreciated. Thank you for your assistance.'),
    questions: [
      rq('leaderName', 'short', 'Your full name'),
      rq('leaderEmail', 'email', 'Your email')
    ]
  }, {
    id: 'character', title: E('Character and spiritual life'), help: E('Please answer each question, and comment where necessary.'),
    questions: [
      rq('known', 'long', 'How long and in what capacity have you known the applicant?'),
      rq('relationship', 'short', 'What is your relationship to the applicant? (Pastor, mentor, employer, leader, teacher, etc.)'),
      rq('godRelationship', 'long', 'How would you describe the applicant’s relationship with God?'),
      rq('teachable', 'long', 'In your opinion, is the applicant teachable and open to correction?'),
      rq('authority', 'long', 'How does the applicant handle authority and leadership?')
    ]
  }, {
    id: 'maturity', title: E('Emotional and relational maturity'), help: E(''),
    questions: [
      rq('peers', 'long', 'How does the applicant relate to peers and those in authority?'),
      rq('stress', 'long', 'How does the applicant respond to stress, disappointment, or conflict?'),
      rq('team', 'long', 'Does the applicant work well in a team environment?')
    ]
  }, {
    id: 'lifestyle', title: E('Lifestyle and conduct'), help: E(''),
    questions: [
      rq('integrity', 'long', 'Do they show integrity and honesty in daily life?'),
      rq('addictions', 'long', 'To your knowledge, does the applicant struggle with any addictive behaviors (alcohol, drugs, pornography, etc.)?'),
      rq('concerns', 'long', 'Is there anything in the applicant’s lifestyle that may be a concern in a cross-cultural ministry setting?'),
      rq('responsible', 'long', 'How responsible is the applicant with commitments, time, and finances?')
    ]
  }, {
    id: 'influences', title: E('Influences on the decision to serve'), help: E('Has the applicant’s decision to serve been significantly influenced by any of the following?'),
    questions: [
      rq('travel', 'choice', 'A desire for travel or sightseeing', { options: YNU }),
      rq('escape', 'choice', 'A desire to escape a difficult personal, family, or vocational problem', { options: YNU }),
      rq('romance', 'choice', 'An emotional involvement with someone on (or going to) the same field', { options: YNU })
    ]
  }, {
    id: 'evaluation', title: E('Character evaluation'), help: E('For each trait, please rate the applicant based on your knowledge. If unknown, please leave it blank.'),
    questions: [
      q('rIntegrity', 'choice', 'Integrity and honesty', '', { options: RATING }),
      q('rSpiritual', 'choice', 'Spiritual maturity', '', { options: RATING }),
      q('rTeachable', 'choice', 'Teachable spirit (willingness to learn and accept correction)', '', { options: RATING }),
      q('rEmotional', 'choice', 'Emotional stability', '', { options: RATING }),
      q('rRelationships', 'choice', 'Relationships with others', '', { options: RATING }),
      q('rStress', 'choice', 'Ability to handle stress and conflict', '', { options: RATING }),
      q('rLeadership', 'choice', 'Leadership ability', '', { options: RATING }),
      q('rServant', 'choice', 'Servant attitude (willingness to serve others)', '', { options: RATING })
    ]
  }, {
    id: 'giftings', title: E('Applicant’s giftings'), help: E('Please mark the appropriate strength for each.'),
    questions: [
      rq('gEvangelism', 'choice', 'Evangelism', { options: STRENGTH }),
      rq('gTeaching', 'choice', 'Teaching', { options: STRENGTH }),
      rq('gLeadership', 'choice', 'Leadership', { options: STRENGTH }),
      rq('gEncouragement', 'choice', 'Encouragement', { options: STRENGTH }),
      rq('gWorship', 'choice', 'Worship / arts', { options: STRENGTH }),
      rq('gMedia', 'choice', 'Media', { options: STRENGTH }),
      rq('gService', 'choice', 'Service / helps', { options: STRENGTH }),
      rq('gCrossCultural', 'choice', 'Cross-cultural adaptability', { options: STRENGTH })
    ]
  }, {
    id: 'suitability', title: E('Suitability for missions'), help: E(''),
    questions: [
      rq('ready', 'long', 'Do you believe the applicant is ready for short-term / long-term missions? Why or why not?'),
      rq('cambodia', 'long', 'Would you recommend the applicant for ministry in Cambodia, where they will face cultural and spiritual challenges?'),
      rq('reservations', 'long', 'Do you have any reservations about this applicant joining YWAM Siem Reap?'),
      rq('recommend', 'choice', 'Would you:', { options: opts([['Highly recommend', ''], ['Recommend with reservations', ''], ['Not recommend this applicant', '']]) }),
      q('additional', 'long', 'Is there any additional information you feel we should know?', '')
    ]
  }]
};

const PORTAL_FORMS_DEFAULT = {
  dts: dtsForm(),
  dbs: studentForm('dbs', 'DBS', 'DBS', true),
  bcs: studentForm('bcs', 'BCS', 'BCS', true),
  sms: studentForm('sms', 'SMS', 'SMS', true),
  staff: staffForm,
  volunteer: volunteerForm,
  team: teamForm,
  reference: referenceForm
};
export default PORTAL_FORMS_DEFAULT;
