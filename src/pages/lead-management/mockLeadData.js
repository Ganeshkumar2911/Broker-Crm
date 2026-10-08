export const STAGES = [
  { key: 'NEW', label: 'NEW', color: 'gray', bgClass: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30', borderGlow: 'hover:border-zinc-500/50', activeGlow: 'border-zinc-400 shadow-[0_0_15px_rgba(161,161,170,0.2)] bg-zinc-500/20' },
  { key: 'ASSIGNED', label: 'ASSIGNED', color: 'blue', bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30', borderGlow: 'hover:border-blue-500/50', activeGlow: 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] bg-blue-500/20' },
  { key: 'CONTACT_ATTEMPTED', label: 'CONTACT ATTEMPTED', color: 'orange', bgClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30', borderGlow: 'hover:border-orange-500/50', activeGlow: 'border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)] bg-orange-500/20' },
  { key: 'CONTACTED', label: 'CONTACTED', color: 'sky', bgClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30', borderGlow: 'hover:border-sky-500/50', activeGlow: 'border-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)] bg-sky-500/20' },
  { key: 'INTERESTED', label: 'INTERESTED', color: 'purple', bgClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30', borderGlow: 'hover:border-purple-500/50', activeGlow: 'border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-purple-500/20' },
  { key: 'FOLLOW_UP', label: 'FOLLOW UP', color: 'yellow', bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30', borderGlow: 'hover:border-amber-500/50', activeGlow: 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-amber-500/20' },
  { key: 'REGISTERED', label: 'REGISTERED', color: 'indigo', bgClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', borderGlow: 'hover:border-indigo-500/50', activeGlow: 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] bg-indigo-500/20' },
  { key: 'KYC_PENDING', label: 'KYC PENDING', color: 'amber', bgClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', borderGlow: 'hover:border-yellow-500/50', activeGlow: 'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)] bg-yellow-500/20' },
  { key: 'KYC_APPROVED', label: 'KYC APPROVED', color: 'green', bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', borderGlow: 'hover:border-emerald-500/50', activeGlow: 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-emerald-500/20' },
  { key: 'TRADING_ACCOUNT_CREATED', label: 'TRADING ACCOUNT', color: 'emerald', bgClass: 'bg-teal-500/10 text-teal-400 border-teal-500/30', borderGlow: 'hover:border-teal-500/50', activeGlow: 'border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)] bg-teal-500/20' },
]

export const COUNTRIES = [
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
]

export const STAFF = [
  { id: 1, name: 'Rahul Sharma', avatarColor: 'bg-blue-600', email: 'rahul.s@panthercapitals.com' },
  { id: 2, name: 'Priya Patel', avatarColor: 'bg-purple-600', email: 'priya.p@panthercapitals.com' },
  { id: 3, name: 'Amit Verma', avatarColor: 'bg-amber-600', email: 'amit.v@panthercapitals.com' },
  { id: 4, name: 'Sneha Gupta', avatarColor: 'bg-emerald-600', email: 'sneha.g@panthercapitals.com' },
  { id: 5, name: 'Vikram Malhotra', avatarColor: 'bg-indigo-600', email: 'vikram.m@panthercapitals.com' },
]

export const SOURCES = [
  { key: 'website', label: 'Website', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  { key: 'facebook', label: 'Facebook Ads', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { key: 'google', label: 'Google Search', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  { key: 'csv_import', label: 'CSV Import', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { key: 'support', label: 'Support Inbound', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { key: 'referral', label: 'IB Referral', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
]

export const INITIAL_LEADS = [
  {
    id: 'LEAD-1001',
    name: 'Raju Rastogi',
    email: 'raju.rastogi@gmail.com',
    phone: '+971 50 123 4567',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    source: 'Website',
    sourceKey: 'website',
    assignedStaff: 'Rahul Sharma',
    staffAvatar: 'bg-blue-600',
    stage: 'NEW',
    priority: 'High',
    createdAt: '2026-07-28 09:30 AM',
    dateObj: '2026-07-28',
    notes: [
      { id: 1, text: 'Customer requested callback regarding Gold trading leverage.', time: 'Today 10:15 AM', author: 'Rahul Sharma' },
      { id: 2, text: 'Sent welcome PDF & account specification chart via email.', time: 'Today 10:30 AM', author: 'Rahul Sharma' }
    ],
    timeline: [
      { id: 1, title: 'Lead Created', desc: 'Inbound submission from Panther Website contact form', time: '09:30 AM', icon: 'Plus' },
      { id: 2, title: 'Assigned to Staff', desc: 'Auto-routed to Senior RM Rahul Sharma', time: '09:40 AM', icon: 'UserCheck' },
      { id: 3, title: 'Contact Attempted', desc: 'Outbound call initiated (+971 50 123 4567)', time: '10:15 AM', icon: 'PhoneCall' },
    ],
    followUp: { date: 'Tomorrow', time: '03:30 PM', reminder: true }
  },
  {
    id: 'LEAD-1002',
    name: 'Sarah Jenkins',
    email: 'sarah.j@techcorp.io',
    phone: '+44 20 7946 0912',
    country: 'United Kingdom',
    flag: '🇬🇧',
    source: 'Google Search',
    sourceKey: 'google',
    assignedStaff: 'Priya Patel',
    staffAvatar: 'bg-purple-600',
    stage: 'INTERESTED',
    priority: 'High',
    createdAt: '2026-07-27 02:15 PM',
    dateObj: '2026-07-27',
    notes: [
      { id: 1, text: 'Interested in VIP ECN account with zero spread on EURUSD.', time: 'Yesterday 04:00 PM', author: 'Priya Patel' }
    ],
    timeline: [
      { id: 1, title: 'Lead Created', desc: 'Campaign Google Search PPC', time: '02:15 PM', icon: 'Plus' },
      { id: 2, title: 'Assigned to Priya', desc: 'Manual assignment', time: '02:20 PM', icon: 'UserCheck' },
      { id: 3, title: 'Contacted', desc: 'Call duration 12 mins. Expressed interest in High Frequency Trading.', time: '03:45 PM', icon: 'Phone' }
    ],
    followUp: { date: '29 Jul 2026', time: '11:00 AM', reminder: true }
  },
  {
    id: 'LEAD-1003',
    name: 'Mohammed Al-Maktoum',
    email: 'm.maktoum@dubaiinvest.ae',
    phone: '+971 55 987 6543',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    source: 'IB Referral',
    sourceKey: 'referral',
    assignedStaff: 'Vikram Malhotra',
    staffAvatar: 'bg-indigo-600',
    stage: 'TRADING_ACCOUNT_CREATED',
    priority: 'High',
    createdAt: '2026-07-25 11:00 AM',
    dateObj: '2026-07-25',
    notes: [
      { id: 1, text: 'Trading Account #884920 activated with $50,000 initial deposit.', time: '26 Jul 05:20 PM', author: 'Vikram Malhotra' }
    ],
    timeline: [
      { id: 1, title: 'Lead Created', desc: 'Referred by IB ID #4402 (Dubai Alpha Fund)', time: '11:00 AM', icon: 'Plus' },
      { id: 2, title: 'KYC Approved', desc: 'Passport & Utility Bill verified', time: '26 Jul 02:00 PM', icon: 'ShieldCheck' },
      { id: 3, title: 'Trading Account Created', desc: 'MT5 Live Account #884920 provisioned', time: '26 Jul 05:20 PM', icon: 'CheckCircle' }
    ],
    followUp: { date: 'Completed', time: 'N/A', reminder: false }
  },
  {
    id: 'LEAD-1004',
    name: 'Alexander Wright',
    email: 'alex.wright@capitalus.com',
    phone: '+1 312 555 0198',
    country: 'United States',
    flag: '🇺🇸',
    source: 'Facebook Ads',
    sourceKey: 'facebook',
    assignedStaff: 'Amit Verma',
    staffAvatar: 'bg-amber-600',
    stage: 'KYC_APPROVED',
    priority: 'Medium',
    createdAt: '2026-07-26 04:45 PM',
    dateObj: '2026-07-26',
    notes: [
      { id: 1, text: 'KYC approved. Waiting for client to select MT5 account currency (USD).', time: 'Today 09:00 AM', author: 'Amit Verma' }
    ],
    timeline: [
      { id: 1, title: 'Lead Created', desc: 'Facebook Lead Gen Form', time: '04:45 PM', icon: 'Plus' },
      { id: 2, title: 'KYC Approved', desc: 'Identity documents verified automatically', time: 'Today 08:30 AM', icon: 'ShieldCheck' }
    ],
    followUp: { date: 'Today', time: '04:00 PM', reminder: true }
  },
  {
    id: 'LEAD-1005',
    name: 'Tan Wei Ming',
    email: 'weiming.tan@singnet.com.sg',
    phone: '+65 9123 4567',
    country: 'Singapore',
    flag: '🇸🇬',
    source: 'Support Inbound',
    sourceKey: 'support',
    assignedStaff: 'Sneha Gupta',
    staffAvatar: 'bg-emerald-600',
    stage: 'REGISTERED',
    priority: 'Medium',
    createdAt: '2026-07-27 10:10 AM',
    dateObj: '2026-07-27',
    notes: [
      { id: 1, text: 'Registered client portal account. Needs help uploading POA.', time: '27 Jul 03:30 PM', author: 'Sneha Gupta' }
    ],
    timeline: [
      { id: 1, title: 'Lead Created', desc: 'Inbound chat widget inquiry', time: '10:10 AM', icon: 'Plus' },
      { id: 2, title: 'Registered Portal', desc: 'Client completed initial registration form', time: '02:00 PM', icon: 'User' }
    ],
    followUp: { date: 'Tomorrow', time: '10:00 AM', reminder: true }
  },
  {
    id: 'LEAD-1006',
    name: 'Klaus Mueller',
    email: 'klaus.mueller@finanz.de',
    phone: '+49 30 123456',
    country: 'Germany',
    flag: '🇩🇪',
    source: 'CSV Import',
    sourceKey: 'csv_import',
    assignedStaff: 'Rahul Sharma',
    staffAvatar: 'bg-blue-600',
    stage: 'FOLLOW_UP',
    priority: 'High',
    createdAt: '2026-07-24 01:20 PM',
    dateObj: '2026-07-24',
    notes: [
      { id: 1, text: 'Scheduled follow-up demo call for PAMM / Copy Trading features.', time: '25 Jul 11:00 AM', author: 'Rahul Sharma' }
    ],
    timeline: [
      { id: 1, title: 'Lead Imported', desc: 'Batch import via Forex Expo 2026 list', time: '01:20 PM', icon: 'FileText' },
      { id: 2, title: 'Follow-up Scheduled', desc: 'Demo session booked for Thursday', time: '25 Jul 11:00 AM', icon: 'Calendar' }
    ],
    followUp: { date: '30 Jul 2026', time: '02:00 PM', reminder: true }
  },
  {
    id: 'LEAD-1007',
    name: 'Ananya Sharma',
    email: 'ananya.s@mumbaitraders.in',
    phone: '+91 98200 12345',
    country: 'India',
    flag: '🇮🇳',
    source: 'Website',
    sourceKey: 'website',
    assignedStaff: 'Priya Patel',
    staffAvatar: 'bg-purple-600',
    stage: 'KYC_PENDING',
    priority: 'High',
    createdAt: '2026-07-28 08:00 AM',
    dateObj: '2026-07-28',
    notes: [
      { id: 1, text: 'Uploaded PAN card, pending proof of address document check.', time: 'Today 11:15 AM', author: 'Priya Patel' }
    ],
    timeline: [
      { id: 1, title: 'Lead Created', desc: 'Direct organic website signup', time: '08:00 AM', icon: 'Plus' },
      { id: 2, title: 'KYC Pending', desc: 'Submitted verification documents for review', time: '11:15 AM', icon: 'Clock' }
    ],
    followUp: { date: 'Today', time: '05:30 PM', reminder: true }
  },
  {
    id: 'LEAD-1008',
    name: 'David Miller',
    email: 'dmiller@londoncapital.co.uk',
    phone: '+44 7700 900123',
    country: 'United Kingdom',
    flag: '🇬🇧',
    source: 'IB Referral',
    sourceKey: 'referral',
    assignedStaff: 'Vikram Malhotra',
    staffAvatar: 'bg-indigo-600',
    stage: 'CONTACTED',
    priority: 'Low',
    createdAt: '2026-07-27 05:40 PM',
    dateObj: '2026-07-27',
    notes: [
      { id: 1, text: 'Spoke with David. Looking to diversify portfolio into Crypto CFDs.', time: 'Today 10:00 AM', author: 'Vikram Malhotra' }
    ],
    timeline: [
      { id: 1, title: 'Lead Created', desc: 'Referral link click', time: '05:40 PM', icon: 'Plus' },
      { id: 2, title: 'Contacted', desc: 'Completed introduction call', time: 'Today 10:00 AM', icon: 'Phone' }
    ],
    followUp: { date: '31 Jul 2026', time: '04:00 PM', reminder: false }
  },
  {
    id: 'LEAD-1009',
    name: 'Aisha Al-Hassan',
    email: 'aisha.h@gulfenergy.ae',
    phone: '+971 52 444 8899',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    source: 'Google Search',
    sourceKey: 'google',
    assignedStaff: 'Sneha Gupta',
    staffAvatar: 'bg-emerald-600',
    stage: 'ASSIGNED',
    priority: 'Medium',
    createdAt: '2026-07-28 10:00 AM',
    dateObj: '2026-07-28',
    notes: [],
    timeline: [
      { id: 1, title: 'Lead Created', desc: 'Google Search Ad click', time: '10:00 AM', icon: 'Plus' },
      { id: 2, title: 'Assigned to Sneha', desc: 'Routed to Regional Dubai Team', time: '10:05 AM', icon: 'UserCheck' }
    ],
    followUp: { date: 'Today', time: '02:00 PM', reminder: true }
  },
  {
    id: 'LEAD-1010',
    name: 'Robert Chen',
    email: 'r.chen@bayarea.io',
    phone: '+1 415 890 1234',
    country: 'United States',
    flag: '🇺🇸',
    source: 'Facebook Ads',
    sourceKey: 'facebook',
    assignedStaff: 'Amit Verma',
    staffAvatar: 'bg-amber-600',
    stage: 'CONTACT_ATTEMPTED',
    priority: 'Medium',
    createdAt: '2026-07-28 07:30 AM',
    dateObj: '2026-07-28',
    notes: [
      { id: 1, text: 'No answer on first call attempt. Left voicemail & sent WhatsApp.', time: 'Today 09:15 AM', author: 'Amit Verma' }
    ],
    timeline: [
      { id: 1, title: 'Lead Created', desc: 'FB Lead Form', time: '07:30 AM', icon: 'Plus' },
      { id: 2, title: 'Contact Attempted', desc: 'Call unanswered', time: '09:15 AM', icon: 'PhoneCall' }
    ],
    followUp: { date: 'Today', time: '03:00 PM', reminder: true }
  }
]

const dummyNames = [
  { name: 'Vikram Mehta', country: 'India', flag: '🇮🇳', phone: '+91 98111 22334', email: 'v.mehta@mumbai.in' },
  { name: 'Emily Watson', country: 'United Kingdom', flag: '🇬🇧', phone: '+44 20 8912 3456', email: 'emily.w@london.uk' },
  { name: 'Tariq Al-Mansoor', country: 'United Arab Emirates', flag: '🇦🇪', phone: '+971 50 999 1122', email: 'tariq@gulf.ae' },
  { name: 'Jason Lee', country: 'Singapore', flag: '🇸🇬', phone: '+65 9876 5432', email: 'jason.l@sgcap.sg' },
  { name: 'Hannah Schmidt', country: 'Germany', flag: '🇩🇪', phone: '+49 89 765432', email: 'hannah.s@berlin.de' },
  { name: 'Michael Brown', country: 'United States', flag: '🇺🇸', phone: '+1 212 555 0144', email: 'mbrown@ny.com' },
  { name: 'Siddharth Nair', country: 'India', flag: '🇮🇳', phone: '+91 97444 55667', email: 'sid.nair@tech.in' },
  { name: 'Chloe Taylor', country: 'United Kingdom', flag: '🇬🇧', phone: '+44 7911 123456', email: 'chloe.t@uktraders.co.uk' },
  { name: 'Zayed bin Omar', country: 'United Arab Emirates', flag: '🇦🇪', phone: '+971 56 333 4455', email: 'zayed@dubaigold.ae' },
  { name: 'Lim Guan Hock', country: 'Singapore', flag: '🇸🇬', phone: '+65 8123 9876', email: 'gh.lim@singnet.sg' }
]

const stageKeys = ['NEW', 'ASSIGNED', 'CONTACT_ATTEMPTED', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'REGISTERED', 'KYC_PENDING', 'KYC_APPROVED', 'TRADING_ACCOUNT_CREATED']
const sourceKeys = [
  { label: 'Website', key: 'website' },
  { label: 'Facebook Ads', key: 'facebook' },
  { label: 'Google Search', key: 'google' },
  { label: 'CSV Import', key: 'csv_import' },
  { label: 'Support Inbound', key: 'support' },
  { label: 'IB Referral', key: 'referral' }
]
const priorities = ['High', 'Medium', 'Low']

for (let i = 11; i <= 50; i++) {
  const template = dummyNames[i % dummyNames.length]
  const stg = stageKeys[i % stageKeys.length]
  const src = sourceKeys[i % sourceKeys.length]
  const staffObj = STAFF[i % STAFF.length]
  const prio = priorities[i % priorities.length]
  const day = String((i % 28) + 1).padStart(2, '0')

  INITIAL_LEADS.push({
    id: `LEAD-${1000 + i}`,
    name: `${template.name} ${i > 20 ? '#' + i : ''}`,
    email: `user${i}.${template.email}`,
    phone: template.phone,
    country: template.country,
    flag: template.flag,
    source: src.label,
    sourceKey: src.key,
    assignedStaff: staffObj.name,
    staffAvatar: staffObj.avatarColor,
    stage: stg,
    priority: prio,
    createdAt: `2026-07-${day} 10:15 AM`,
    dateObj: `2026-07-${day}`,
    notes: [
      { id: 1, text: `Initial outreach performed by ${staffObj.name}. Lead requested details regarding leverage & spreads.`, time: '26 Jul 11:30 AM', author: staffObj.name }
    ],
    timeline: [
      { id: 1, title: 'Lead Captured', desc: `Inbound via ${src.label}`, time: '10:15 AM', icon: 'Plus' },
      { id: 2, title: 'Assigned Staff', desc: `Assigned to ${staffObj.name}`, time: '10:20 AM', icon: 'UserCheck' }
    ],
    followUp: { date: '30 Jul 2026', time: '03:00 PM', reminder: i % 2 === 0 }
  })
}

export const FUNNEL_FLOW = [
  { stage: 'Total Leads', count: 245, pct: '100%', drop: null },
  { stage: 'Assigned', count: 215, pct: '87.7%', drop: '-12.3%' },
  { stage: 'Contacted', count: 168, pct: '68.5%', drop: '-19.2%' },
  { stage: 'Interested', count: 124, pct: '50.6%', drop: '-17.9%' },
  { stage: 'Registered', count: 86, pct: '35.1%', drop: '-15.5%' },
  { stage: 'KYC Approved', count: 52, pct: '21.2%', drop: '-13.9%' },
  { stage: 'Trading Accounts', count: 39, pct: '15.9%', drop: '-5.3%' },
]
