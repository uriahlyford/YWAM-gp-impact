/* The legal documents a team signs on arrival, as shipped — YWAM Siem Reap's
   own forms (Photo Release, Accident Waiver, Liability Release Waiver,
   Acceptance of Place), the English text copied word for word from the paper
   forms. The Khmer halves of the bilingual forms are not here yet.

   Each person on a team opens the team's signing link, picks their name and
   signs each document on their phone (portalSignOpen / portalSignSubmit in
   api.js). Where the paper form has a line to sign or initial, the page draws
   a box to sign in with a finger.

   Shape: { id, title, blocks:[...], sign:{ age, witness, guardian } }
   Blocks:
     { t:'h', text }                          a heading
     { t:'p', text, style:'bold'|'italic' }   a paragraph; {name} is the signer's name
     { t:'list', items:[text] }               bullet points (a leading "Word:" is bold)
     { t:'choice', id, options:[{id,text}] }  pick exactly one
     { t:'contacts' }                         the reporting contacts a portal admin sets
     { t:'check', id, text }                  a box they must tick
     { t:'group', id, title, items:[text] }   a ticked heading with its points under it
     { t:'field', id, label, optional, prefill } a line they fill in (prefill: 'role' | 'dates')
     { t:'initial', id, label }               a box for their initials (a page's foot)
   sign.age: asks their age; sign.witness: an optional witness signs too;
   sign.guardian: under 18, a parent or guardian signs as well.

   The id of a document and of every tick, field and initial is its handle in
   the signed records — change wording freely, keep the ids. A signature keeps
   a snapshot of exactly the text that was signed, so editing a document later
   never changes what someone already signed. */

const PHOTO = {
  id: 'photo', title: 'Photo Release Form',
  blocks: [
    { t: 'p', text: 'While I am a student / staff / volunteer with Youth With A Mission Siem Reap, I give my permission to be photographed or filmed during classes / sanctioned events / activities. It is understood that these images will be used only in publications, websites, videos, or other promotional materials of the above mentioned organizations.' },
    { t: 'check', id: 'beyond', text: 'I accept that this usage may apply beyond my association with University of the Nations and does not require notification.' },
    { t: 'check', id: 'noPay', text: 'I also accept that there will be no remuneration for any such use of images in which I am shown.' },
    { t: 'check', id: 'read', text: 'Releasor acknowledges that they have carefully read this agreement, fully understands its legal effects and has signed it of releasor’s own free will.' }
  ],
  sign: { witness: true }
};

const ACCIDENT = {
  id: 'accident', title: 'Accident Waiver and Release of Liability Form',
  blocks: [
    { t: 'p', text: 'I HEREBY ASSUME ALL OF THE RISKS OF PARTICIPATING IN VEHICLE USE AND ALL ACTIVITIES ASSOCIATED WITH THIS EVENT, including by way of example and not limitation, any risks that may arise from negligence or carelessness on the part of the persons or entities being released, from dangerous or defective equipment or property owned, maintained, or controlled by them, or because of their possible liability without fault.' },
    { t: 'p', style: 'italic', text: 'For Staff Only: I certify that I have been volunteering in Cambodia for a minimum of three months, have been trained in how to operate a motorcycle and have been approved to drive. In consideration of my application and permitting me to participate in this activity, I hereby take action for myself, my executors, administrators, heirs, next of kin, successors, and assigns as follows:' },
    { t: 'p', text: '(A) I WAIVE, RELEASE, AND DISCHARGE from any and all liability, including but not limited to, liability arising from the negligence or fault of U of N Poipet or any persons involved, for my death, disability, personal injury, property damage, property theft, or actions of any kind which may hereafter occur to me including my traveling to and from this activity.' },
    { t: 'p', text: '(B) I ACKNOWLEDGE THAT this activity of vehicle use may carry with it the potential for death, serious injury, and property loss. I hereby consent to receive medical treatment through my insurance which may be deemed advisable in the event of injury, accident, and/or illness during this activity.' },
    { t: 'p', style: 'italic', text: 'For Staff Only: (C) I AGREE TO cover all costs of repair or damage that occurs when I have the vehicle, whether fault of my own or someone else.' },
    { t: 'p', style: 'italic', text: 'For Staff Only: (D) I AGREE TO follow all rules, including but not limited to wearing a helmet and ensuring all passengers are wearing helmets, being approved for driving and understand that if these rules are not followed I may not have a right to use the vehicle again.' },
    { t: 'check', id: 'read', text: 'I CERTIFY THAT I HAVE READ THIS DOCUMENT AND I FULLY UNDERSTAND ITS CONTENT. I AM AWARE THAT THIS IS A RELEASE OF LIABILITY AND A CONTRACT AND I SIGN IT OF MY OWN FREE WILL.' }
  ],
  sign: { age: true, guardian: true }
};

const LIABILITY = {
  id: 'liability', title: 'Liability Release Waiver',
  blocks: [
    { t: 'p', text: '{name}, who is herein referred to as the "Releaser", hereby releases, waives and forever discharges the UNIVERSITY OF THE NATIONS, INC., a Cambodian Non-Government Organization, its trustees, directors, officers, agents, employees, if any, successors, insurers and volunteers, who are herein collectively referred to as the "University" from any and all liability, claims, causes of action, loss and damage that may result from any injury to the Releaser’s person or property, even injury resulting in death of the Releaser, arising out of the Releaser being a Student, a Mission Builder, and/or a Full Time or Associate Staff member at or of the University, including without limitation of the generality of the foregoing those arising out of or in any way related to the Releaser participating in any University conducted or sponsored program or activity whether on the University Poipet, Cambodia campus, off campus within or outside of Cambodia such as an outreach program, which could be conducted outside of Cambodia.' },
    { t: 'p', text: 'Releaser hereby acknowledges that if Releaser participates in an outreach program conducted or sponsored by the University or travels internationally on University business that he or she is fully aware of the fact that his or her personal health, freedom, safety and/or life may be at risk of loss or damage from contraction of disease, accidents, terrorism, persecution, war, political unrest and any other number of circumstances that might occur while traveling internationally or while participating in an outreach program and that the Releaser will give such risks the Releaser’s full consideration, prayer and thought in deciding whether or not to participate in any such activity and has given such risks the Releaser’s full consideration, prayer and thought in deciding whether or not to sign this instrument and that Releaser has signed this instrument with full knowledge of those risks, voluntarily, and not under any duress or undue influence of whatsoever kind or nature.' },
    { t: 'p', text: 'Releaser hereby knowingly and voluntarily assumes full responsibility for risk of loss of health, bodily injury, death or damage to Releaser’s property arising out of the aforedescribed risks, programs and activities. Releaser hereby agrees to indemnify and hold the University harmless from any and all claims, liability, loss, damage, cost and/or expense, including attorneys’ fees and costs incurred by the University in defending against any such claims and in enforcing this agreement, that may be asserted against the University or that the University may suffer or incur as the result of Releaser being a Student at the University or being a Mission Builder, and/or a Full Time or Associate Staff member at the University as the case may be.' },
    { t: 'p', text: 'Releaser expressly agrees that this release, waiver, and indemnity agreement is intended to be as broad and inclusive as possible for any jurisdiction in which any cause of action or claim may arise or be asserted and is being given as an inducement to the University to allow Releaser to be a Student at the University or be a Mission Builder, and/or a Full Time or Associate Staff member at the University, as the case may be, and that if any portion of this agreement is invalid, it is agreed that the balance shall notwithstanding continue in full legal force and effect. This release, waiver and indemnity agreement shall be binding on Releaser and Releaser’s heirs, personal representatives, successors and assigns and shall insure to the benefit of the University and its trustees, directors, officers, agents, employees (if any), insurers and volunteers.' },
    { t: 'p', text: 'I, the undersigned, expressedly agree that by signing this release, I give consent to the University of the Nations concerning any legal obligation that may arise from activities undertaken with and for YWAM Siem Reap. I recognize that this document is intended to be as inclusive as possible and agree that if some portion of this document is made invalid, I agree to abide by any other portions of the agreement that remain in full legal force and effect. I recognize that by agreeing to serve in the capacity of a Student, Mission Builder, and/or Staff Associate of the University that I do so at my own risk, recognizing and taking responsibility for the possible risks and dangers possible with the position. This agreement shall be binding on Releaser and Releaser’s heirs, personal representatives, successors and assigns and shall insure to the benefit of the University and its representatives.' },
    { t: 'p', style: 'italic', text: 'YWAM Siem Reap: Traing Village, Slar Kram Commune, Siem Reap City, Krong Siem Reap, Cambodia, 171201 · info@ywamsiemreap.org · www.ywamsiemreap.org' },
    { t: 'check', id: 'read', text: 'RELEASOR ACKNOWLEDGES RELEASOR HAS CAREFULLY READ THIS AGREEMENT, FULLY UNDERSTANDS ITS LEGAL EFFECT AND HAS SIGNED IT OF RELEASOR\'S OWN FREE WILL. In witness whereof, Releaser has executed this instrument on the date below.' }
  ],
  sign: { witness: true }
};

const ACCEPTANCE = {
  id: 'acceptance', title: 'Acceptance of Place',
  blocks: [
    { t: 'p', text: 'Please tick the boxes in agreement of the following statements, initial the bottom of each page and sign at the end.' },
    { t: 'field', id: 'location', label: 'Location (Print Location)' },
    { t: 'p', text: 'In accepting an offer of a place I certify and confirm that:' },
    { t: 'group', id: 'general', title: 'General', items: [
      'I have read and understood the Preparing to Come / Acceptance documents.',
      'I am aware that as an unpaid short-term or long-term volunteer missionary must fund my entire stay and all living expenses independently.',
      'I am aware that if I am an international short-term or long-term volunteer missionary I will leave the country I am in before my visa expires.',
      'That the basis of my enrollment is on a full-time, full-fee paying basis only. I understand that it is neither a scholarship, employment or immigration program.',
      'I am required to attend an orientation upon my arrival.',
      'I understand that full attendance to the regular schedule and events is required, excluding illness or similar circumstances.'] },
    { t: 'group', id: 'visa', title: 'Acknowledgement of Visa Obligations (International)', items: [
      'I understand that my visa application may be refused, despite the fact that I have paid appropriate application fees, supplied all required documentation and undergone any medical examinations.',
      'I agree that if my visa application is not successful I will not enter into any correspondence with the diplomatic post regarding remuneration for the visa application fees, medical examination charges, deposits, or airfares.'] },
    { t: 'group', id: 'money', title: 'Acknowledgement of Financial Responsibility', items: [
      'I confirm that I understand the payment schedule and that all fees must be paid upon arrival or on the 1st of each month for stays longer than three months. I also confirm that I am fully aware of my financial obligations, both to the Lord and to University of the Nations Poipet. I therefore accept all responsibility for my living fees, and personal expenses incurred during my involvement with Youth With A Mission.'] },
    { t: 'group', id: 'health', title: 'Acknowledgement of Health Insurance and Vaccination Requirements', items: [
      'I confirm that I will be diligent to purchase an approved Health Insurance Policy and present my Health Insurance to the Registrar prior to arrival at Youth With A Mission.',
      'I confirm that I understand it is a requirement to have Measles, Mumps, Rubella, Tetanus, Diphtheria, Pertussis, Hep A and B, Polio, and possibly Typhoid Vaccinations.'] },
    { t: 'initial', id: 'page1', label: 'Initial (page 1)' },
    { t: 'group', id: 'values', title: 'Acknowledgement of Youth With A Mission International, Cambodia Policies and Values.', items: [
      'I confirm that I have read and understand University of the Nations Cambodia, Youth With A Mission Cambodia and Youth With A Mission International values, policies, and guidelines so stated in the Preparing to Come / Acceptance documents.',
      'I confirm that I will be diligent to uphold and display the values and walk in the guidelines during my stay with Youth With A Mission.',
      'All staff / volunteers are required to abstain from sexual immorality and intimate physical contact outside of marriage, which we believe, is between one man and one woman.',
      'Staff / volunteer members must never participate in physical, verbal, emotional or sexual abuse of another person.',
      'Staff / volunteer members must at all times demonstrate through their behavior and actions love and acceptance of all people regardless of race, gender, social class and religious beliefs.',
      'Staff / volunteer members are expected to maintain healthy boundaries when ministering to others.',
      'Staff / volunteer members are required to be truthful and honest. Gossip, slander, malicious talk, theft, coarse humor, lying and plagiarizing are never to be allowed.'] },
    { t: 'group', id: 'mediation', title: 'Acknowledgement of 3rd Party Mediation and Arbitration', items: [
      'I agree to uphold and apply the Biblical principles to make every effort to live at peace and to resolve disputes with others in private or within the Christian church according to Matt. 18 and 1 Cor. 6.',
      'I agree that any claim or dispute arising from or related to this agreement shall be settled by Biblically based mediation and, if necessary, legally binding arbitration in accordance with the then-current Rules of Procedure for Christian Conciliation of the Institute for Christian Conciliation. Judgement upon arbitration award may be entered in any court otherwise having jurisdiction.',
      'I understand that the methods shall be the sole remedy for any controversy or claim arising out of this agreement and expressly waive the right to file a lawsuit in any civil court for any disputes, except to enforce an arbitration decision.'] },
    { t: 'initial', id: 'page2', label: 'Initial (page 2)' },
    { t: 'check', id: 'declaration', text: 'Declaration: RELEASOR ACKNOWLEDGES RELEASOR HAS CAREFULLY READ THIS AGREEMENT, FULLY UNDERSTANDS ITS LEGAL EFFECT AND HAS SIGNED IT OF RELEASOR’S OWN FREE WILL.' }
  ],
  sign: { guardian: true }
};

const CHILD = {
  id: 'child', title: 'Child Protection Agreement — YWAM Siem Reap',
  blocks: [
    { t: 'h', text: 'Part A — Scope' },
    { t: 'p', text: 'This Agreement applies to every person who visits, serves, works or studies with YWAM Siem Reap, including leaders, staff, students, volunteers, partners and guests from Cambodia and other countries. It must be signed before the person begins their role and is read together with the parent policy, which remains binding in full.' },
    { t: 'h', text: 'Part B — Our commitment to children' },
    { t: 'p', text: 'We believe every child is created and loved by God. Following Jesus means treating children with dignity, listening to them and protecting them from harm. We want children to feel safe, valued and able to speak up in our community.' },
    { t: 'p', text: 'A child is anyone under 18. These commitments apply on campus, in our ministries and activities, on visits and trips, and in online contact connected to our work. Harm can come from an adult or from another child.' },
    { t: 'p', text: 'By joining this community, I agree to the following commitments.' },
    { t: 'h', text: 'Part C — Commitments of the signatory' },
    { t: 'h', text: '1. I will respect every child' },
    { t: 'p', text: 'I will treat children with equal care, whatever their nationality, family situation, age, gender, disability, religion or beliefs. I will listen to their views and respect their right to learn, participate and speak.' },
    { t: 'h', text: '2. I will not hurt or shame a child' },
    { t: 'list', items: [
      'Physical harm: I will not hit, slap, shake, beat or physically punish a child, or make a child do dangerous work.',
      'Emotional harm: I will not insult, threaten, bully, humiliate or use fear to control a child. I will correct behavior calmly, without violence or shame.',
      'Neglect: When a child is in my care, I will not ignore their needs for safety, care, education or help.',
      'Sexual harm: I will not touch a child sexually, make sexual comments, show sexual images or involve a child in sexual activity, in person or online.',
      'Spiritual harm: I will not use God, the Bible, prayer or my leadership role to frighten, pressure, manipulate or control a child.'] },
    { t: 'h', text: '3. I will take responsibility for my behavior' },
    { t: 'p', text: 'As an adult, I am responsible for safe boundaries. I will never blame a child for my actions, even if the child seeks attention or acts in a sexual way. Being trusted, being a leader or having good intentions does not excuse harmful behavior.' },
    { t: 'h', text: '4. I will keep time with children visible and accountable' },
    { t: 'list', items: [
      'I will meet children where other responsible adults can see us, including during individual conversations.',
      'I will not invite a child to my home alone or visit a child who is home alone.',
      'Before individual counseling, I will tell another adult or supervisor when and where it will happen, and keep it visible.',
      'I will arrange any exception, such as babysitting, with the project leader beforehand and with parent or caregiver permission. In an unexpected emergency, I will protect the child and tell the leader as soon as possible.',
      'I will obtain written permission from the parent or caregiver before taking a child away from their community.'] },
    { t: 'h', text: '5. I will protect children online and in photos' },
    { t: 'list', items: [
      'I will keep messages appropriate and open to review by the responsible leader and the parent or caregiver.',
      'I will not ask a child to keep our contact secret, or send sexual messages or images.',
      'I will follow ministry photo and consent rules. I will not post an image of a child who has experienced exploitation without written caregiver permission, and even with permission I will protect the child’s dignity, identity and safety.'] },
    { t: 'h', text: '6. I will protect children from unsafe work' },
    { t: 'p', text: 'I will not use children for dangerous or exploitative work, or work that harms their learning, health or wellbeing. Before assigning work to anyone under 18, I will check with leadership and follow the full policy’s age and hour limits and the law.' },
    { t: 'h', text: '7. I will report concerns immediately' },
    { t: 'p', text: 'If I see, hear about or suspect abuse, I will tell the ministry leader or director immediately. I do not need to prove abuse before reporting a concern. This applies even when the person involved is a friend, a respected leader or someone older than me.' },
    { t: 'p', text: 'If that leader is involved in the concern, or does not act, I will report to another uninvolved senior leader or director. Respect for a leader or fear of embarrassing someone must not stop me from protecting a child.' },
    { t: 'h', text: '8. I will protect privacy and cooperate' },
    { t: 'p', text: 'I will share a concern only with people responsible for protecting the child and responding, including appropriate authorities. I will not gossip, post about it or share it in group chats or prayer updates. Privacy must never be used to hide abuse or stop a report.' },
    { t: 'p', text: 'I will cooperate with the response process and treat everyone involved with respect. I understand that an allegation must be taken seriously and investigated fairly.' },
    { t: 'h', text: 'Part D — Responding to a disclosure' },
    { t: 'p', text: 'I will listen calmly, take them seriously, and say:' },
    { t: 'p', style: 'italic', text: '"Thank you for telling me. This is not your fault. I need to tell someone who can help keep you safe."' },
    { t: 'p', text: 'I will not promise secrecy, question the child repeatedly or investigate myself. I will write down their words, what I observed, the date and time, and any action taken, then pass this securely to the responsible leader. If there is immediate danger, I will seek urgent help to keep the child safe.' },
    { t: 'h', text: 'Part E — Commitments of YWAM Siem Reap' },
    { t: 'p', text: 'Following the full child protection policy, leadership will listen to the child, record concerns securely, notify the director immediately and appoint a small team to handle the response. The person accused will be removed from responsibilities during the investigation. Leadership will work with appropriate authorities as required and will not use pastoral care to avoid the law.' },
    { t: 'p', text: 'YWAM will provide professional counseling for the child at its expense for as long as needed and feasible. A person found to have committed child abuse will be dismissed without reinstatement. Breaking other child protection rules can also lead to discipline and loss of responsibilities or position.' },
    { t: 'h', text: 'Part F — Reporting contacts' },
    { t: 'contacts' },
    { t: 'h', text: 'Part G — Declaration and signature' },
    { t: 'p', text: 'I have read this agreement, or it has been explained to me in a language I understand. I have had the opportunity to ask questions. I agree to follow these commitments and the full UofN Cambodia Child Protection Policy while I am part of YWAM Siem Reap. I understand the reporting process and the consequences of breaking the policy.' },
    { t: 'p', text: 'I will honestly disclose any past accusation or conviction involving physical or sexual abuse, and any conviction involving child abuse, violent behavior or improper conduct. An accusation is not the same as a finding of guilt.' },
    { t: 'choice', id: 'disclose', options: [{ id: 'none', text: 'Nothing to disclose' }, { id: 'private', text: 'I have information to disclose privately to the director before starting my role' }] },
    { t: 'field', id: 'role', label: 'Role or team', prefill: 'role' },
    { t: 'field', id: 'dates', label: 'Dates here', prefill: 'dates' },
    { t: 'field', id: 'leader', label: 'Leader receiving this agreement', optional: true },
    { t: 'field', id: 'interpreter', label: 'Interpreter name if used', optional: true },
    { t: 'p', style: 'italic', text: 'The signed original is kept securely on file at the YWAM Siem Reap office for the duration of the signatory’s involvement and thereafter in line with the parent policy. A copy is given to the signatory on request.' }
  ],
  sign: {}
};

export default [PHOTO, ACCIDENT, LIABILITY, ACCEPTANCE, CHILD];

/* The Volunteer Staff Contract (YWAM SR), signed by a staff member in the GP
   app and then countersigned by a UofN leader on the HR page. Not one of the
   documents everyone signs: HR sends it to a person with its period, and it
   becomes one of their HR contracts. {t:'period'} shows the period HR set. */
export const STAFF_CONTRACT = {
  id: 'contract', title: 'Volunteer Staff Contract',
  blocks: [
    { t: 'period' },
    { t: 'h', text: 'Rules of Contract' },
    { t: 'list', items: [
      'Staff (A) agrees to work with University of the Nations, Cambodia as a non-salaried volunteer staff member.',
      'Staff (A) is required to be honest and open with all aspects of his/her work duties.',
      'Staff (A) must work within the leadership structure of this organization. Staff (A) must be accountable to his/her leader and follow the decisions that his/her leaders make.',
      'Staff (A) is expected to attend all regular staff meetings. If Staff (A) is unable to attend, he/she must inform a leader beforehand.',
      'Staff (A) is expected to pay a monthly office fee according to his nationality and marital status.',
      'Staff (A) will receive a break for all major public holidays in Cambodia, as determined by the University of the Nations, Cambodia.',
      'Staff (A) is expected to take a vacation every 3-4 months for up to 2 weeks and a furlough of longer-term rest and renewal every 1-2 years. This furlough should be 6 weeks or more outside Cambodia. This is a time to reconnect with friends, family, and supporters. (These furloughs need to be planned in advance and approved by the local UofN leadership).',
      'Staff (A) is expected to have health insurance with coverage for medical evacuations.',
      'Staff (A) is expected to learn the Khmer language and culture while working in Cambodia.',
      'Staff (A) is expected to be respectful of Cambodian culture at all times.',
      'Staff (A) is expected to follow the security, child protection, and other policies that are described in the University of the Nations, Cambodia staff manual.'] },
    { t: 'h', text: 'Conditions of Contract' },
    { t: 'list', items: [
      'If Staff (A) or University of the Nations, Cambodia decides to terminate this contract, they must submit a written letter at least 6 months before the intended termination date. In this letter, the reason for termination must be explained explicitly.',
      'All staff must complete an initial evaluation with members of leadership after serving their first 3 months with YWAM Siem Reap to confirm this location is where they will remain serving.',
      'If Staff (A) is found to have committed serious acts of misconduct (violent behavior, stealing, major moral failing, etc), University of the Nations, Cambodia has the right to terminate this contract immediately.'] },
    { t: 'h', text: 'Personal Unto-Statement / Commitment' },
    { t: 'p', text: 'During my time in Siem Reap, I commit to focusing on the following areas to better develop myself and the ministries I am a part of:' },
    { t: 'field', id: 'focus1', label: 'Area 1' },
    { t: 'field', id: 'focus2', label: 'Area 2', optional: true },
    { t: 'field', id: 'focus3', label: 'Area 3', optional: true },
    { t: 'field', id: 'future', label: 'I will focus on these areas because in the future…' },
    { t: 'h', text: 'Agreement with this Contract and our Organizational Values' },
    { t: 'check', id: 'agree', text: 'I, {name}, have read through this contract and agree to adhere to the rules and conditions of this contract. I have also read through the values of this organization and agree to operate within those principles.' },
    { t: 'p', style: 'italic', text: 'Youth with a Mission, Siem Reap · Traing Village, Slar Kram Commune, Siem Reap City, Krong Siem Reap, Kingdom of Cambodia' }
  ],
  sign: { leader: true }
};
