// Shared catalog: worldwide study destinations + BS / Master's / PhD programs.
// Used by the recommendation engine and exposed to the profile form via /api/config.

const FIELDS = [
  // Computing & IT
  { title: 'Computer Science', stream: 'stem', k: 'computer science|computing|cs ' },
  { title: 'Software Engineering', stream: 'stem', k: 'software' },
  { title: 'Information Technology', stream: 'stem', k: 'information technology|it |informatics' },
  { title: 'Data Science', stream: 'stem', k: 'data science|data analytic' },
  { title: 'Artificial Intelligence', stream: 'stem', k: 'artificial intelligence|machine learning|ai' },
  { title: 'Cybersecurity', stream: 'stem', k: 'cyber|information security' },
  { title: 'Information Systems', stream: 'stem', k: 'information system' },
  { title: 'Computer Engineering', stream: 'stem', k: 'computer engineering' },
  { title: 'Game Development', stream: 'stem', k: 'game development|game design' },
  { title: 'Human-Computer Interaction', stream: 'stem', k: 'hci|human-computer' },
  // Math & physical sciences
  { title: 'Mathematics', stream: 'stem', k: 'mathematics|maths' },
  { title: 'Applied Mathematics', stream: 'stem', k: 'applied math' },
  { title: 'Statistics', stream: 'stem', k: 'statistic' },
  { title: 'Actuarial Science', stream: 'stem', k: 'actuarial' },
  { title: 'Physics', stream: 'stem', k: 'physics' },
  { title: 'Applied Physics', stream: 'stem', k: 'applied physics' },
  { title: 'Chemistry', stream: 'stem', k: 'chemistry' },
  { title: 'Applied Chemistry', stream: 'stem', k: 'applied chemistry' },
  { title: 'Astronomy', stream: 'stem', k: 'astronomy' },
  { title: 'Astrophysics', stream: 'stem', k: 'astrophysics' },
  { title: 'Geology', stream: 'stem', k: 'geology' },
  { title: 'Geophysics', stream: 'stem', k: 'geophysics' },
  { title: 'Earth Science', stream: 'stem', k: 'earth science' },
  { title: 'Environmental Science', stream: 'stem', k: 'environmental science|environment' },
  { title: 'Atmospheric Science', stream: 'stem', k: 'atmospheric|meteorology' },
  { title: 'Oceanography', stream: 'stem', k: 'oceanograph' },
  { title: 'Materials Science', stream: 'stem', k: 'materials science|material science' },
  { title: 'Nanoscience', stream: 'stem', k: 'nano' },
  { title: 'Climate Science', stream: 'stem', k: 'climate' },
  // Life sciences
  { title: 'Biology', stream: 'stem', k: 'biology' },
  { title: 'Biochemistry', stream: 'stem', k: 'biochemistry' },
  { title: 'Biotechnology', stream: 'stem', k: 'biotech' },
  { title: 'Microbiology', stream: 'stem', k: 'microbiology' },
  { title: 'Molecular Biology', stream: 'stem', k: 'molecular biology' },
  { title: 'Genetics', stream: 'stem', k: 'genetic' },
  { title: 'Zoology', stream: 'stem', k: 'zoology' },
  { title: 'Botany', stream: 'stem', k: 'botany' },
  { title: 'Bioinformatics', stream: 'stem', k: 'bioinformatics' },
  { title: 'Neuroscience', stream: 'stem', k: 'neuro' },
  { title: 'Ecology', stream: 'stem', k: 'ecology' },
  { title: 'Marine Biology', stream: 'stem', k: 'marine biology' },
  { title: 'Biomedical Science', stream: 'stem', k: 'biomedical science' },
  { title: 'Immunology', stream: 'stem', k: 'immunolog' },
  { title: 'Pharmacology', stream: 'stem', k: 'pharmacolog' },
  // Engineering
  { title: 'Mechanical Engineering', stream: 'stem', k: 'mechanical' },
  { title: 'Electrical Engineering', stream: 'stem', k: 'electrical' },
  { title: 'Electronics Engineering', stream: 'stem', k: 'electronics' },
  { title: 'Civil Engineering', stream: 'stem', k: 'civil' },
  { title: 'Chemical Engineering', stream: 'stem', k: 'chemical engineering' },
  { title: 'Industrial Engineering', stream: 'stem', k: 'industrial engineering' },
  { title: 'Aerospace Engineering', stream: 'stem', k: 'aerospace|aeronautic' },
  { title: 'Biomedical Engineering', stream: 'stem', k: 'biomedical engineering' },
  { title: 'Petroleum Engineering', stream: 'stem', k: 'petroleum' },
  { title: 'Mining Engineering', stream: 'stem', k: 'mining' },
  { title: 'Nuclear Engineering', stream: 'stem', k: 'nuclear' },
  { title: 'Mechatronics', stream: 'stem', k: 'mechatronic' },
  { title: 'Automotive Engineering', stream: 'stem', k: 'automotive' },
  { title: 'Telecommunications Engineering', stream: 'stem', k: 'telecom' },
  { title: 'Environmental Engineering', stream: 'stem', k: 'environmental engineering' },
  { title: 'Energy Engineering', stream: 'stem', k: 'energy engineering|renewable energy' },
  { title: 'Robotics', stream: 'stem', k: 'robotic' },
  { title: 'Systems Engineering', stream: 'stem', k: 'systems engineering' },
  { title: 'Agricultural Engineering', stream: 'stem', k: 'agricultural engineering' },
  // Architecture & design
  { title: 'Architecture', stream: 'arts', k: 'architecture' },
  { title: 'Urban Planning', stream: 'arts', k: 'urban planning|town planning' },
  { title: 'Interior Design', stream: 'arts', k: 'interior design' },
  { title: 'Landscape Architecture', stream: 'arts', k: 'landscape' },
  { title: 'Industrial Design', stream: 'arts', k: 'industrial design' },
  // Health
  { title: 'Nursing', stream: 'health', k: 'nursing' },
  { title: 'Pharmacy', stream: 'health', k: 'pharm' },
  { title: 'Public Health', stream: 'health', k: 'public health' },
  { title: 'Medicine', stream: 'health', k: 'medicine|mbbs|medical' },
  { title: 'Dentistry', stream: 'health', k: 'dentistry|dental' },
  { title: 'Physiotherapy', stream: 'health', k: 'physiotherapy|physical therapy' },
  { title: 'Occupational Therapy', stream: 'health', k: 'occupational therapy' },
  { title: 'Nutrition and Dietetics', stream: 'health', k: 'nutrition|dietetic' },
  { title: 'Medical Laboratory Science', stream: 'health', k: 'medical lab|mls|clinical lab' },
  { title: 'Radiology', stream: 'health', k: 'radiolog|medical imaging' },
  { title: 'Veterinary Science', stream: 'health', k: 'veterinar' },
  { title: 'Midwifery', stream: 'health', k: 'midwif' },
  { title: 'Optometry', stream: 'health', k: 'optometr' },
  { title: 'Speech and Language Therapy', stream: 'health', k: 'speech' },
  { title: 'Health Administration', stream: 'health', k: 'health admin|hospital management' },
  // Agriculture
  { title: 'Agriculture', stream: 'stem', k: 'agriculture|agronomy' },
  { title: 'Horticulture', stream: 'stem', k: 'horticulture' },
  { title: 'Forestry', stream: 'stem', k: 'forestry' },
  { title: 'Animal Science', stream: 'stem', k: 'animal science|animal husbandry' },
  { title: 'Food Science', stream: 'stem', k: 'food science|food technology' },
  { title: 'Fisheries', stream: 'stem', k: 'fisher' },
  { title: 'Soil Science', stream: 'stem', k: 'soil science' },
  // Business
  { title: 'Business Administration', stream: 'business', k: 'business administration|bba|mba' },
  { title: 'Management', stream: 'business', k: 'management' },
  { title: 'Accounting', stream: 'business', k: 'account' },
  { title: 'Finance', stream: 'business', k: 'finance' },
  { title: 'Marketing', stream: 'business', k: 'marketing' },
  { title: 'Economics', stream: 'business', k: 'economic' },
  { title: 'International Business', stream: 'business', k: 'international business' },
  { title: 'Human Resource Management', stream: 'business', k: 'human resource|hrm|hr ' },
  { title: 'Entrepreneurship', stream: 'business', k: 'entrepreneur' },
  { title: 'Supply Chain Management', stream: 'business', k: 'supply chain|logistics' },
  { title: 'Tourism and Hospitality', stream: 'business', k: 'tourism|hospitality|hotel' },
  { title: 'Banking', stream: 'business', k: 'banking' },
  { title: 'Islamic Finance', stream: 'business', k: 'islamic finance|islamic banking' },
  // Social sciences
  { title: 'Psychology', stream: 'social', k: 'psychology' },
  { title: 'Sociology', stream: 'social', k: 'sociology' },
  { title: 'Political Science', stream: 'social', k: 'political science|politics' },
  { title: 'International Relations', stream: 'social', k: 'international relation' },
  { title: 'Anthropology', stream: 'social', k: 'anthropology' },
  { title: 'Social Work', stream: 'social', k: 'social work' },
  { title: 'Criminology', stream: 'social', k: 'criminolog' },
  { title: 'Geography', stream: 'social', k: 'geography' },
  { title: 'Development Studies', stream: 'social', k: 'development studies' },
  { title: 'Gender Studies', stream: 'social', k: 'gender studies|women studies' },
  { title: 'Public Administration', stream: 'social', k: 'public administration|public policy' },
  { title: 'Peace and Conflict Studies', stream: 'social', k: 'peace|conflict studies' },
  // Humanities
  { title: 'English', stream: 'arts', k: 'english' },
  { title: 'History', stream: 'arts', k: 'history' },
  { title: 'Philosophy', stream: 'arts', k: 'philosophy' },
  { title: 'Linguistics', stream: 'arts', k: 'linguistic' },
  { title: 'Literature', stream: 'arts', k: 'literature' },
  { title: 'Religious Studies', stream: 'arts', k: 'religious studies|theology|islamic studies' },
  { title: 'Classics', stream: 'arts', k: 'classics' },
  { title: 'Archaeology', stream: 'arts', k: 'archaeology' },
  { title: 'Cultural Studies', stream: 'arts', k: 'cultural studies' },
  { title: 'Translation Studies', stream: 'arts', k: 'translation|interpretation' },
  // Arts & media
  { title: 'Fine Arts', stream: 'arts', k: 'fine art' },
  { title: 'Graphic Design', stream: 'arts', k: 'graphic design' },
  { title: 'Visual Arts', stream: 'arts', k: 'visual art' },
  { title: 'Music', stream: 'arts', k: 'music' },
  { title: 'Theatre', stream: 'arts', k: 'theatre|drama' },
  { title: 'Film and Media', stream: 'arts', k: 'film|cinema|media studies' },
  { title: 'Fashion Design', stream: 'arts', k: 'fashion' },
  { title: 'Journalism', stream: 'arts', k: 'journalism' },
  { title: 'Mass Communication', stream: 'arts', k: 'mass communication|media' },
  { title: 'Photography', stream: 'arts', k: 'photograph' },
  { title: 'Animation', stream: 'arts', k: 'animation' },
  { title: 'Creative Writing', stream: 'arts', k: 'creative writing' },
  // Education, law, sport
  { title: 'Education', stream: 'edu', k: 'education' },
  { title: 'Early Childhood Education', stream: 'edu', k: 'early childhood' },
  { title: 'Special Education', stream: 'edu', k: 'special education' },
  { title: 'Educational Leadership', stream: 'edu', k: 'educational leadership' },
  { title: 'TESOL', stream: 'edu', k: 'tesol|tefl|english language teaching' },
  { title: 'Law', stream: 'law', k: 'law|llb|llm' },
  { title: 'International Law', stream: 'law', k: 'international law' },
  { title: 'Human Rights Law', stream: 'law', k: 'human rights' },
  { title: 'Sports Science', stream: 'stem', k: 'sports science|sport science' },
  { title: 'Physical Education', stream: 'edu', k: 'physical education' },
  { title: 'Kinesiology', stream: 'stem', k: 'kinesiology' },
  { title: 'Library and Information Science', stream: 'social', k: 'library' },
  { title: 'Sustainability Studies', stream: 'stem', k: 'sustainability' }
];

function bachelorName(f) {
  if (f.title === 'Medicine') return 'MBBS / BS Medicine';
  if (f.title === 'Dentistry') return 'BDS / BS Dentistry';
  if (f.title === 'Pharmacy') return 'PharmD / BS Pharmacy';
  if (f.title === 'Law') return 'LLB / BS Law';
  if (f.title === 'Architecture') return 'BArch / BS Architecture';
  if (f.title === 'Fine Arts') return 'BFA / BS Fine Arts';
  if (f.title === 'Business Administration') return 'BBA / BS Business Administration';
  if (f.stream === 'arts') return 'BA / BS ' + f.title;
  return 'BS ' + f.title;
}

function masterName(f) {
  if (f.title === 'Business Administration') return 'MBA';
  if (f.title === 'Public Health') return 'MPH (Public Health)';
  if (f.title === 'Law') return 'LLM';
  if (f.title === 'International Law') return 'LLM International Law';
  if (f.title === 'Human Rights Law') return 'LLM Human Rights';
  if (f.title === 'Education') return 'MEd / MSc Education';
  if (f.stream === 'arts') return 'MA ' + f.title;
  if (f.stream === 'stem' && /Engineering|Mechatronics|Robotics/.test(f.title)) return 'MSc ' + f.title;
  return 'MSc ' + f.title;
}

function phdName(f) {
  return 'PhD in ' + f.title;
}

function programGroups() {
  return [
    { label: 'Bachelor (BS / BA / professional)', items: FIELDS.map(f => bachelorName(f)) },
    { label: 'Master’s', items: [
      ...FIELDS.map(f => masterName(f)),
      'MSc Computer Science', 'MSc Data Science', 'MSc Artificial Intelligence',
      'MSc Management', 'MSc Finance', 'MSc Nursing', 'MSc Cybersecurity',
      'MSc Information Technology', 'MSc Education', 'MSc Psychology'
    ].filter((v, i, a) => a.indexOf(v) === i).sort() },
    { label: 'Doctorate (PhD)', items: FIELDS.map(f => phdName(f)) }
  ];
}

let _allProgramNames;
function allProgramNames() {
  if (_allProgramNames) return _allProgramNames;
  const names = [];
  programGroups().forEach(g => g.items.forEach(x => names.push(x)));
  _allProgramNames = [...new Set(names)];
  return _allProgramNames;
}

function programLevel(profile) {
  const p = String(profile.program || '').toLowerCase();
  const d = String(profile.highest_degree || '').toLowerCase();
  if (/^phd\b|^ph\.d|doctorate/.test(p)) return 'phd';
  if (/^(bs |ba |ba\/|bba|beng|bfa|barch|llb|mbbs|bds|pharmd|bachelor)/.test(p)) return 'bachelor';
  if (/^(msc|ma |mba|mph|meng|med|llm|master)/.test(p)) return 'master';
  if (d === 'intermediate') return 'bachelor';
  if (d === 'master') return 'phd';
  if (d === 'bachelor') return 'master';
  return 'master';
}

function formatByLevel(field, level) {
  if (level === 'bachelor') return bachelorName(field);
  if (level === 'phd') return phdName(field);
  return masterName(field);
}

function fieldMatches(fieldText, row) {
  const f = String(fieldText || '').toLowerCase();
  if (!f) return false;
  if (f.includes(row.title.toLowerCase())) return true;
  return row.k.split('|').map(s => s.trim()).filter(Boolean).some(k => {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('\\b' + escaped + '\\b', 'i').test(f);
  });
}

function detectPrograms(profile) {
  const level = programLevel(profile);
  const matched = [];
  for (const row of FIELDS) {
    if (fieldMatches(profile.field, row)) matched.push(formatByLevel(row, level));
  }
  const preferred = profile.program && allProgramNames().includes(profile.program) ? [profile.program] : [];
  const wanted = [...new Set(matched.concat(preferred))];
  if (wanted.length) return wanted.slice(0, 8);
  const fallback = {
    bachelor: 'Bachelor’s (BS) programme aligned with your field',
    master: 'Master’s programme aligned with your field',
    phd: 'PhD programme aligned with your field'
  };
  return preferred.length ? preferred : [fallback[level]];
}

// Existing profile codes (UK, USA, CA…) are kept so saved accounts still match.
const WORLD_COUNTRIES = [
  ['AF', 'Afghanistan', 'SAS'], ['AL', 'Albania', 'EE'], ['DZ', 'Algeria', 'AF'],
  ['AD', 'Andorra', 'WE'], ['AO', 'Angola', 'AF'], ['AG', 'Antigua and Barbuda', 'LA'],
  ['AR', 'Argentina', 'LA'], ['AM', 'Armenia', 'CAS'], ['AU', 'Australia', 'OC'],
  ['AT', 'Austria', 'WE'], ['AZ', 'Azerbaijan', 'CAS'], ['BS', 'Bahamas', 'LA'],
  ['BH', 'Bahrain', 'ME'], ['BD', 'Bangladesh', 'SAS'], ['BB', 'Barbados', 'LA'],
  ['BY', 'Belarus', 'EE'], ['BE', 'Belgium', 'WE'], ['BZ', 'Belize', 'LA'],
  ['BJ', 'Benin', 'AF'], ['BT', 'Bhutan', 'SAS'], ['BO', 'Bolivia', 'LA'],
  ['BA', 'Bosnia and Herzegovina', 'EE'], ['BW', 'Botswana', 'AF'], ['BR', 'Brazil', 'LA'],
  ['BN', 'Brunei', 'SEA'], ['BG', 'Bulgaria', 'EE'], ['BF', 'Burkina Faso', 'AF'],
  ['BI', 'Burundi', 'AF'], ['CV', 'Cabo Verde', 'AF'], ['KH', 'Cambodia', 'SEA'],
  ['CM', 'Cameroon', 'AF'], ['CA', 'Canada', 'NA'], ['CF', 'Central African Republic', 'AF'],
  ['TD', 'Chad', 'AF'], ['CL', 'Chile', 'LA'], ['CN', 'China', 'EAS'],
  ['CO', 'Colombia', 'LA'], ['KM', 'Comoros', 'AF'], ['CG', 'Congo', 'AF'],
  ['CD', 'Congo (DRC)', 'AF'], ['CR', 'Costa Rica', 'LA'], ['CI', 'Côte d’Ivoire', 'AF'],
  ['HR', 'Croatia', 'EE'], ['CU', 'Cuba', 'LA'], ['CY', 'Cyprus', 'WE'],
  ['CZ', 'Czechia', 'EE'], ['DK', 'Denmark', 'WE'], ['DJ', 'Djibouti', 'AF'],
  ['DM', 'Dominica', 'LA'], ['DO', 'Dominican Republic', 'LA'], ['EC', 'Ecuador', 'LA'],
  ['EG', 'Egypt', 'AF'], ['SV', 'El Salvador', 'LA'], ['GQ', 'Equatorial Guinea', 'AF'],
  ['ER', 'Eritrea', 'AF'], ['EE', 'Estonia', 'EE'], ['SZ', 'Eswatini', 'AF'],
  ['ET', 'Ethiopia', 'AF'], ['FJ', 'Fiji', 'OC'], ['FI', 'Finland', 'WE'],
  ['FR', 'France', 'WE'], ['GA', 'Gabon', 'AF'], ['GM', 'Gambia', 'AF'],
  ['GE', 'Georgia', 'CAS'], ['DE', 'Germany', 'WE'], ['GH', 'Ghana', 'AF'],
  ['GR', 'Greece', 'WE'], ['GD', 'Grenada', 'LA'], ['GT', 'Guatemala', 'LA'],
  ['GN', 'Guinea', 'AF'], ['GW', 'Guinea-Bissau', 'AF'], ['GY', 'Guyana', 'LA'],
  ['HT', 'Haiti', 'LA'], ['HN', 'Honduras', 'LA'], ['HK', 'Hong Kong', 'EAS'],
  ['HU', 'Hungary', 'EE'], ['IS', 'Iceland', 'WE'], ['IN', 'India', 'SAS'],
  ['ID', 'Indonesia', 'SEA'], ['IR', 'Iran', 'ME'], ['IQ', 'Iraq', 'ME'],
  ['IE', 'Ireland', 'WE'], ['IL', 'Israel', 'ME'], ['IT', 'Italy', 'WE'],
  ['JM', 'Jamaica', 'LA'], ['JP', 'Japan', 'EAS'], ['JO', 'Jordan', 'ME'],
  ['KZ', 'Kazakhstan', 'CAS'], ['KE', 'Kenya', 'AF'], ['KI', 'Kiribati', 'OC'],
  ['KW', 'Kuwait', 'ME'], ['KG', 'Kyrgyzstan', 'CAS'], ['LA', 'Laos', 'SEA'],
  ['LV', 'Latvia', 'EE'], ['LB', 'Lebanon', 'ME'], ['LS', 'Lesotho', 'AF'],
  ['LR', 'Liberia', 'AF'], ['LY', 'Libya', 'AF'], ['LI', 'Liechtenstein', 'WE'],
  ['LT', 'Lithuania', 'EE'], ['LU', 'Luxembourg', 'WE'], ['MO', 'Macau', 'EAS'],
  ['MG', 'Madagascar', 'AF'], ['MW', 'Malawi', 'AF'], ['MY', 'Malaysia', 'SEA'],
  ['MV', 'Maldives', 'SAS'], ['ML', 'Mali', 'AF'], ['MT', 'Malta', 'WE'],
  ['MH', 'Marshall Islands', 'OC'], ['MR', 'Mauritania', 'AF'], ['MU', 'Mauritius', 'AF'],
  ['MX', 'Mexico', 'LA'], ['FM', 'Micronesia', 'OC'], ['MD', 'Moldova', 'EE'],
  ['MC', 'Monaco', 'WE'], ['MN', 'Mongolia', 'EAS'], ['ME', 'Montenegro', 'EE'],
  ['MA', 'Morocco', 'AF'], ['MZ', 'Mozambique', 'AF'], ['MM', 'Myanmar', 'SEA'],
  ['NA', 'Namibia', 'AF'], ['NR', 'Nauru', 'OC'], ['NP', 'Nepal', 'SAS'],
  ['NL', 'Netherlands', 'WE'], ['NZ', 'New Zealand', 'OC'], ['NI', 'Nicaragua', 'LA'],
  ['NE', 'Niger', 'AF'], ['NG', 'Nigeria', 'AF'], ['KP', 'North Korea', 'EAS'],
  ['MK', 'North Macedonia', 'EE'], ['NO', 'Norway', 'WE'], ['OM', 'Oman', 'ME'],
  ['PK', 'Pakistan', 'SAS'], ['PW', 'Palau', 'OC'], ['PS', 'Palestine', 'ME'],
  ['PA', 'Panama', 'LA'], ['PG', 'Papua New Guinea', 'OC'], ['PY', 'Paraguay', 'LA'],
  ['PE', 'Peru', 'LA'], ['PH', 'Philippines', 'SEA'], ['PL', 'Poland', 'EE'],
  ['PT', 'Portugal', 'WE'], ['QA', 'Qatar', 'ME'], ['RO', 'Romania', 'EE'],
  ['RU', 'Russia', 'EE'], ['RW', 'Rwanda', 'AF'], ['KN', 'Saint Kitts and Nevis', 'LA'],
  ['LC', 'Saint Lucia', 'LA'], ['VC', 'Saint Vincent and the Grenadines', 'LA'],
  ['WS', 'Samoa', 'OC'], ['SM', 'San Marino', 'WE'], ['ST', 'Sao Tome and Principe', 'AF'],
  ['SA', 'Saudi Arabia', 'ME'], ['SN', 'Senegal', 'AF'], ['RS', 'Serbia', 'EE'],
  ['SC', 'Seychelles', 'AF'], ['SL', 'Sierra Leone', 'AF'], ['SG', 'Singapore', 'SEA'],
  ['SK', 'Slovakia', 'EE'], ['SI', 'Slovenia', 'EE'], ['SB', 'Solomon Islands', 'OC'],
  ['SO', 'Somalia', 'AF'], ['ZA', 'South Africa', 'AF'], ['KR', 'South Korea', 'EAS'],
  ['SS', 'South Sudan', 'AF'], ['ES', 'Spain', 'WE'], ['LK', 'Sri Lanka', 'SAS'],
  ['SD', 'Sudan', 'AF'], ['SR', 'Suriname', 'LA'], ['SE', 'Sweden', 'WE'],
  ['CH', 'Switzerland', 'WE'], ['SY', 'Syria', 'ME'], ['TW', 'Taiwan', 'EAS'],
  ['TJ', 'Tajikistan', 'CAS'], ['TZ', 'Tanzania', 'AF'], ['TH', 'Thailand', 'SEA'],
  ['TL', 'Timor-Leste', 'SEA'], ['TG', 'Togo', 'AF'], ['TO', 'Tonga', 'OC'],
  ['TT', 'Trinidad and Tobago', 'LA'], ['TN', 'Tunisia', 'AF'], ['TR', 'Turkey', 'ME'],
  ['TM', 'Turkmenistan', 'CAS'], ['TV', 'Tuvalu', 'OC'], ['UG', 'Uganda', 'AF'],
  ['UA', 'Ukraine', 'EE'], ['AE', 'United Arab Emirates', 'ME'], ['UK', 'United Kingdom', 'WE'],
  ['USA', 'United States', 'NA'], ['UY', 'Uruguay', 'LA'], ['UZ', 'Uzbekistan', 'CAS'],
  ['VU', 'Vanuatu', 'OC'], ['VA', 'Vatican City', 'WE'], ['VE', 'Venezuela', 'LA'],
  ['VN', 'Vietnam', 'SEA'], ['YE', 'Yemen', 'ME'], ['ZM', 'Zambia', 'AF'],
  ['ZW', 'Zimbabwe', 'AF'], ['XK', 'Kosovo', 'EE']
];

const REGION_DEFAULTS = {
  WE: { tuitionYear: 14000, livingYear: 12000, ielts: 6.5, cgpaGood: 3.0 },
  EE: { tuitionYear: 5000, livingYear: 7000, ielts: 6.0, cgpaGood: 2.6 },
  NA: { tuitionYear: 26000, livingYear: 14000, ielts: 6.5, cgpaGood: 3.0 },
  LA: { tuitionYear: 5000, livingYear: 5500, ielts: 6.0, cgpaGood: 2.5 },
  ME: { tuitionYear: 9000, livingYear: 8000, ielts: 6.0, cgpaGood: 2.6 },
  AF: { tuitionYear: 3500, livingYear: 4000, ielts: 6.0, cgpaGood: 2.5 },
  SAS: { tuitionYear: 4000, livingYear: 4000, ielts: 6.0, cgpaGood: 2.5 },
  EAS: { tuitionYear: 8000, livingYear: 9000, ielts: 6.0, cgpaGood: 2.8 },
  SEA: { tuitionYear: 7000, livingYear: 6000, ielts: 6.0, cgpaGood: 2.5 },
  OC: { tuitionYear: 25000, livingYear: 15000, ielts: 6.5, cgpaGood: 3.0 },
  CAS: { tuitionYear: 3500, livingYear: 4000, ielts: 6.0, cgpaGood: 2.5 }
};

const DETAILED_DB = {
  UK: {
    name: 'United Kingdom', tuitionYear: 24000, livingYear: 13000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['University of Greenwich', 'Coventry University', 'University of Hertfordshire',
           'Teesside University', 'University of South Wales'],
    scholarships: ['Great Scholarships (British Council)', 'Commonwealth Shared Scholarships', 'University merit awards (10-50%)']
  },
  USA: {
    name: 'United States', tuitionYear: 28000, livingYear: 15000, ielts: 7.0, cgpaGood: 3.2,
    unis: ['Arkansas State University', 'Illinois Tech', 'University of North Alabama',
           'Suffolk University', 'Northeastern University'],
    scholarships: ['Fulbright Foreign Student Program', 'University assistantships / graduate funding', 'EducationUSA advisor resources']
  },
  CA: {
    name: 'Canada', tuitionYear: 20000, livingYear: 12000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['University of Manitoba', 'Memorial University of Newfoundland', 'University of Regina',
           'Concordia University', 'Brandon University'],
    scholarships: ['Vanier Canada Graduate Scholarships', 'Provincial tuition bursaries', 'University entrance awards']
  },
  AU: {
    name: 'Australia', tuitionYear: 27000, livingYear: 16000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['Charles Sturt University', 'University of Southern Queensland', 'Edith Cowan University',
           'Torrens University', 'Deakin University'],
    scholarships: ['Australia Awards', 'Destination Australia scholarships', 'University international merit awards']
  },
  DE: {
    name: 'Germany', tuitionYear: 0, livingYear: 11500, ielts: 6.5, cgpaGood: 2.8,
    unis: ['TU Munich', 'RWTH Aachen', 'University of Freiburg', 'Hochschule Rhein-Waal', 'TU Berlin'],
    scholarships: ['DAAD scholarships', 'Deutschlandstipendium', 'Erasmus+ (where applicable)']
  },
  NL: {
    name: 'Netherlands', tuitionYear: 16000, livingYear: 11000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['Saxion University', 'The Hague University of Applied Sciences', 'Fontys University',
           'NHL Stenden', 'VU Amsterdam'],
    scholarships: ['Holland Scholarship', 'Orange Knowledge Programme', 'University-specific waivers']
  },
  TR: {
    name: 'Turkey', tuitionYear: 8000, livingYear: 6000, ielts: 6.0, cgpaGood: 2.5,
    unis: ['Middle East Technical University', 'Istanbul Technical University', 'Hacettepe University',
           'Bilkent University', 'Yıldız Technical University'],
    scholarships: ['Türkiye Bursları (fully funded incl. stipend)', 'University fee waivers']
  },
  MY: {
    name: 'Malaysia', tuitionYear: 9000, livingYear: 6000, ielts: 6.0, cgpaGood: 2.5,
    unis: ['University of Malaya', 'Universiti Teknologi Malaysia', 'Taylor’s University',
           'Universiti Putra Malaysia', 'MMU'],
    scholarships: ['Malaysian International Scholarship (MIS)', 'University graduate assistantships']
  },
  CN: {
    name: 'China', tuitionYear: 6000, livingYear: 4500, ielts: 6.0, cgpaGood: 2.5,
    unis: ['Tsinghua University', 'Zhejiang University', 'University of Science and Technology of China',
           'Jiangsu University', 'Shandong University'],
    scholarships: ['Chinese Government Scholarship (CSC - fully funded)', 'Confucius Institute scholarships', 'Provincial scholarships']
  },
  HU: {
    name: 'Hungary', tuitionYear: 8000, livingYear: 6500, ielts: 6.0, cgpaGood: 2.7,
    unis: ['University of Debrecen', 'Eötvös Loránd University', 'University of Pécs', 'BME', 'University of Szeged'],
    scholarships: ['Stipendium Hungaricum (tuition + stipend + housing)']
  },
  IT: {
    name: 'Italy', tuitionYear: 10000, livingYear: 9000, ielts: 6.0, cgpaGood: 2.7,
    unis: ['Politecnico di Milano', 'Sapienza University of Rome', 'University of Bologna',
           'University of Padua', 'Politecnico di Torino'],
    scholarships: ['Invest Your Talent in Italy', 'DSU regional need-based scholarships', 'MAECI scholarships']
  },
  PK: {
    name: 'Pakistan', tuitionYear: 5000, livingYear: 3000, ielts: 6.0, cgpaGood: 2.5,
    unis: ['NUST Islamabad', 'LUMS Lahore', 'FAST NUCES', 'PIEAS', 'Air University'],
    scholarships: ['HEC Need-based & Merit scholarships', 'Punjab Educational Endowment Fund (PEEF)', 'University assistantships']
  },
  FR: {
    name: 'France', tuitionYear: 4000, livingYear: 11000, ielts: 6.5, cgpaGood: 2.8,
    unis: ['Sorbonne University', 'Université PSL', 'Université Grenoble Alpes', 'Université de Lyon', 'Sciences Po'],
    scholarships: ['Eiffel Excellence Scholarship', 'Campus France scholarships', 'CROUS housing aid']
  },
  ES: {
    name: 'Spain', tuitionYear: 3500, livingYear: 9000, ielts: 6.0, cgpaGood: 2.7,
    unis: ['University of Barcelona', 'Universidad Autónoma de Madrid', 'University of Valencia', 'Universidad de Granada', 'UPC Barcelona'],
    scholarships: ['MAEC-AECID scholarships', 'La Caixa fellowships', 'University tuition waivers']
  },
  PT: {
    name: 'Portugal', tuitionYear: 4000, livingYear: 8500, ielts: 6.0, cgpaGood: 2.6,
    unis: ['University of Lisbon', 'University of Porto', 'University of Coimbra', 'NOVA University Lisbon', 'University of Minho'],
    scholarships: ['Camões Institute scholarships', 'FCT doctoral grants', 'University merit awards']
  },
  IE: {
    name: 'Ireland', tuitionYear: 18000, livingYear: 13000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['University College Dublin', 'Trinity College Dublin', 'University of Galway', 'University College Cork', 'Dublin City University'],
    scholarships: ['Government of Ireland International Education Scholarships', 'University postgraduate awards']
  },
  SE: {
    name: 'Sweden', tuitionYear: 14000, livingYear: 11000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['Lund University', 'KTH Royal Institute of Technology', 'Uppsala University', 'University of Gothenburg', 'Linköping University'],
    scholarships: ['Swedish Institute Scholarships', 'University tuition waivers']
  },
  NO: {
    name: 'Norway', tuitionYear: 0, livingYear: 14000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['University of Oslo', 'NTNU', 'University of Bergen', 'UiT The Arctic University', 'Norwegian University of Life Sciences'],
    scholarships: ['Quota / NORAD-related funding', 'University PhD employment contracts']
  },
  DK: {
    name: 'Denmark', tuitionYear: 15000, livingYear: 13000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['University of Copenhagen', 'Aarhus University', 'Technical University of Denmark', 'Aalborg University', 'University of Southern Denmark'],
    scholarships: ['Danish government scholarships', 'University tuition waivers']
  },
  FI: {
    name: 'Finland', tuitionYear: 12000, livingYear: 11000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['University of Helsinki', 'Aalto University', 'Tampere University', 'University of Turku', 'University of Oulu'],
    scholarships: ['Finland Scholarship', 'University tuition waivers']
  },
  CH: {
    name: 'Switzerland', tuitionYear: 2000, livingYear: 18000, ielts: 6.5, cgpaGood: 3.2,
    unis: ['ETH Zurich', 'EPFL', 'University of Zurich', 'University of Geneva', 'University of Basel'],
    scholarships: ['Swiss Government Excellence Scholarships', 'ETH/EPFL excellence awards']
  },
  AT: {
    name: 'Austria', tuitionYear: 1500, livingYear: 12000, ielts: 6.5, cgpaGood: 2.8,
    unis: ['University of Vienna', 'TU Wien', 'University of Graz', 'University of Innsbruck', 'Johannes Kepler University Linz'],
    scholarships: ['OeAD scholarships', 'Ernst Mach Grants']
  },
  BE: {
    name: 'Belgium', tuitionYear: 4500, livingYear: 11000, ielts: 6.5, cgpaGood: 2.8,
    unis: ['KU Leuven', 'Ghent University', 'Université catholique de Louvain', 'University of Antwerp', 'Vrije Universiteit Brussel'],
    scholarships: ['VLIR-UOS scholarships', 'ARES grants']
  },
  PL: {
    name: 'Poland', tuitionYear: 4000, livingYear: 7000, ielts: 6.0, cgpaGood: 2.6,
    unis: ['University of Warsaw', 'Jagiellonian University', 'Warsaw University of Technology', 'Adam Mickiewicz University', 'AGH University'],
    scholarships: ['Banach Scholarship Programme', 'Poland My First Choice']
  },
  CZ: {
    name: 'Czechia', tuitionYear: 4000, livingYear: 7500, ielts: 6.0, cgpaGood: 2.6,
    unis: ['Charles University', 'Czech Technical University', 'Masaryk University', 'Palacký University Olomouc', 'Brno University of Technology'],
    scholarships: ['Czech government scholarships', 'Erasmus Mundus / university waivers']
  },
  JP: {
    name: 'Japan', tuitionYear: 8000, livingYear: 10000, ielts: 6.0, cgpaGood: 2.8,
    unis: ['University of Tokyo', 'Kyoto University', 'Osaka University', 'Tohoku University', 'Tokyo Institute of Technology'],
    scholarships: ['MEXT Scholarship (fully funded)', 'JASSO honors scholarships']
  },
  KR: {
    name: 'South Korea', tuitionYear: 7000, livingYear: 9000, ielts: 6.0, cgpaGood: 2.8,
    unis: ['Seoul National University', 'KAIST', 'Yonsei University', 'Korea University', 'POSTECH'],
    scholarships: ['Global Korea Scholarship (GKS)', 'University full/partial scholarships']
  },
  IN: {
    name: 'India', tuitionYear: 3500, livingYear: 4000, ielts: 6.0, cgpaGood: 2.5,
    unis: ['IIT Delhi', 'IISc Bangalore', 'University of Delhi', 'Jawaharlal Nehru University', 'IIT Bombay'],
    scholarships: ['ICCR Scholarships', 'University research assistantships']
  },
  SG: {
    name: 'Singapore', tuitionYear: 18000, livingYear: 12000, ielts: 6.5, cgpaGood: 3.2,
    unis: ['National University of Singapore', 'Nanyang Technological University', 'Singapore Management University', 'SUTD', 'SIT'],
    scholarships: ['Singapore International Graduate Award (SINGA)', 'University research scholarships']
  },
  NZ: {
    name: 'New Zealand', tuitionYear: 24000, livingYear: 14000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['University of Auckland', 'University of Otago', 'Victoria University of Wellington', 'University of Canterbury', 'Massey University'],
    scholarships: ['New Zealand Scholarships', 'University doctoral scholarships']
  },
  AE: {
    name: 'United Arab Emirates', tuitionYear: 15000, livingYear: 12000, ielts: 6.0, cgpaGood: 2.7,
    unis: ['Khalifa University', 'UAE University', 'American University of Sharjah', 'University of Dubai', 'Zayed University'],
    scholarships: ['UAE university scholarships', 'Sharjah / Abu Dhabi merit awards']
  },
  SA: {
    name: 'Saudi Arabia', tuitionYear: 0, livingYear: 8000, ielts: 6.0, cgpaGood: 2.7,
    unis: ['King Saud University', 'KAUST', 'King Abdulaziz University', 'KFUPM', 'Princess Nourah University'],
    scholarships: ['Saudi government scholarships', 'KAUST fully funded graduate fellowships']
  },
  QA: {
    name: 'Qatar', tuitionYear: 12000, livingYear: 12000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['Qatar University', 'Hamad Bin Khalifa University', 'Texas A&M University at Qatar', 'Weill Cornell Medicine-Qatar', 'Carnegie Mellon Qatar'],
    scholarships: ['Qatar University scholarships', 'HBKU research fellowships']
  },
  ZA: {
    name: 'South Africa', tuitionYear: 4500, livingYear: 5500, ielts: 6.0, cgpaGood: 2.6,
    unis: ['University of Cape Town', 'University of the Witwatersrand', 'Stellenbosch University', 'University of Pretoria', 'University of KwaZulu-Natal'],
    scholarships: ['NRF postgraduate funding', 'University international scholarships']
  },
  EG: {
    name: 'Egypt', tuitionYear: 4000, livingYear: 4000, ielts: 6.0, cgpaGood: 2.5,
    unis: ['Cairo University', 'Ain Shams University', 'AUC', 'Alexandria University', 'Mansoura University'],
    scholarships: ['Egyptian government scholarships', 'University tuition discounts']
  },
  NG: {
    name: 'Nigeria', tuitionYear: 3000, livingYear: 3500, ielts: 6.0, cgpaGood: 2.5,
    unis: ['University of Ibadan', 'University of Lagos', 'Obafemi Awolowo University', 'Ahmadu Bello University', 'Covenant University'],
    scholarships: ['PTDF scholarships', 'University postgraduate awards']
  },
  KE: {
    name: 'Kenya', tuitionYear: 3000, livingYear: 4000, ielts: 6.0, cgpaGood: 2.5,
    unis: ['University of Nairobi', 'Kenyatta University', 'Moi University', 'Jomo Kenyatta University', 'Strathmore University'],
    scholarships: ['Kenya government / university scholarships', 'DAAD in-region awards']
  },
  GH: {
    name: 'Ghana', tuitionYear: 3500, livingYear: 4000, ielts: 6.0, cgpaGood: 2.5,
    unis: ['University of Ghana', 'KNUST', 'University of Cape Coast', 'Ashesi University', 'University of Education Winneba'],
    scholarships: ['Ghana Scholarship Secretariat', 'University merit awards']
  },
  MA: {
    name: 'Morocco', tuitionYear: 3000, livingYear: 4500, ielts: 6.0, cgpaGood: 2.5,
    unis: ['Mohammed V University', 'Cadi Ayyad University', 'Al Akhawayn University', 'Hassan II University', 'Ibn Tofail University'],
    scholarships: ['AMCI Moroccan scholarships', 'University fee reductions']
  },
  BR: {
    name: 'Brazil', tuitionYear: 0, livingYear: 6000, ielts: 6.0, cgpaGood: 2.6,
    unis: ['University of São Paulo', 'UNICAMP', 'Federal University of Rio de Janeiro', 'UFMG', 'UFRGS'],
    scholarships: ['CAPES / CNPq graduate funding', 'PEC-G / PEC-PG programs']
  },
  MX: {
    name: 'Mexico', tuitionYear: 4000, livingYear: 5500, ielts: 6.0, cgpaGood: 2.6,
    unis: ['UNAM', 'Tecnológico de Monterrey', 'IPN', 'Universidad de Guadalajara', 'UAM'],
    scholarships: ['CONACYT / SECIHTI scholarships', 'Mexican government excellence scholarships']
  },
  AR: {
    name: 'Argentina', tuitionYear: 0, livingYear: 5000, ielts: 6.0, cgpaGood: 2.5,
    unis: ['University of Buenos Aires', 'Universidad Nacional de Córdoba', 'Universidad Nacional de La Plata', 'UTN', 'Universidad Nacional de Rosario'],
    scholarships: ['Argentine government scholarships', 'Public university tuition-free study']
  },
  CL: {
    name: 'Chile', tuitionYear: 5000, livingYear: 7000, ielts: 6.0, cgpaGood: 2.7,
    unis: ['Universidad de Chile', 'Pontificia Universidad Católica de Chile', 'Universidad de Concepción', 'Universidad de Santiago', 'UTFSM'],
    scholarships: ['ANID graduate scholarships', 'Chilean government awards']
  },
  CO: {
    name: 'Colombia', tuitionYear: 4500, livingYear: 5000, ielts: 6.0, cgpaGood: 2.6,
    unis: ['Universidad Nacional de Colombia', 'Universidad de los Andes', 'Universidad de Antioquia', 'Universidad del Valle', 'Javeriana'],
    scholarships: ['ICETEX scholarships', 'Colciencias / Minciencias doctoral funding']
  },
  ID: {
    name: 'Indonesia', tuitionYear: 3500, livingYear: 4500, ielts: 6.0, cgpaGood: 2.5,
    unis: ['Universitas Indonesia', 'Gadjah Mada University', 'Bandung Institute of Technology', 'IPB University', 'Airlangga University'],
    scholarships: ['KNB Scholarship', 'LPDP scholarships']
  },
  TH: {
    name: 'Thailand', tuitionYear: 4500, livingYear: 5500, ielts: 6.0, cgpaGood: 2.5,
    unis: ['Chulalongkorn University', 'Mahidol University', 'Chiang Mai University', 'Thammasat University', 'Kasetsart University'],
    scholarships: ['Thai government scholarships', 'University tuition waivers']
  },
  VN: {
    name: 'Vietnam', tuitionYear: 3000, livingYear: 4000, ielts: 6.0, cgpaGood: 2.5,
    unis: ['Vietnam National University Hanoi', 'VNU-HCM', 'Hanoi University of Science and Technology', 'Can Tho University', 'Duy Tan University'],
    scholarships: ['Vietnamese government scholarships', 'University fee waivers']
  },
  PH: {
    name: 'Philippines', tuitionYear: 3500, livingYear: 4500, ielts: 6.0, cgpaGood: 2.5,
    unis: ['University of the Philippines', 'Ateneo de Manila University', 'De La Salle University', 'University of Santo Tomas', 'Mapúa University'],
    scholarships: ['CHED scholarships', 'University graduate assistantships']
  },
  BD: {
    name: 'Bangladesh', tuitionYear: 2500, livingYear: 3000, ielts: 6.0, cgpaGood: 2.5,
    unis: ['University of Dhaka', 'BUET', 'Jahangirnagar University', 'North South University', 'BRAC University'],
    scholarships: ['Bangladesh government scholarships', 'University merit awards']
  },
  LK: {
    name: 'Sri Lanka', tuitionYear: 3000, livingYear: 3500, ielts: 6.0, cgpaGood: 2.5,
    unis: ['University of Colombo', 'University of Peradeniya', 'University of Moratuwa', 'University of Sri Jayewardenepura', 'University of Kelaniya'],
    scholarships: ['Presidential / university scholarships', 'Commonwealth awards']
  },
  TW: {
    name: 'Taiwan', tuitionYear: 4000, livingYear: 7000, ielts: 6.0, cgpaGood: 2.7,
    unis: ['National Taiwan University', 'National Tsing Hua University', 'National Cheng Kung University', 'National Yang Ming Chiao Tung University', 'National Taiwan Normal University'],
    scholarships: ['Taiwan Scholarship', 'MOE / university tuition waivers']
  },
  HK: {
    name: 'Hong Kong', tuitionYear: 18000, livingYear: 14000, ielts: 6.5, cgpaGood: 3.0,
    unis: ['University of Hong Kong', 'Chinese University of Hong Kong', 'HKUST', 'City University of Hong Kong', 'PolyU'],
    scholarships: ['Hong Kong PhD Fellowship Scheme', 'University postgraduate studentships']
  },
  KZ: {
    name: 'Kazakhstan', tuitionYear: 4000, livingYear: 4500, ielts: 6.0, cgpaGood: 2.5,
    unis: ['Nazarbayev University', 'Al-Farabi Kazakh National University', 'Eurasian National University', 'Kazakh-British Technical University', 'Satbayev University'],
    scholarships: ['Bolashak scholarship', 'University tuition grants']
  },
  UZ: {
    name: 'Uzbekistan', tuitionYear: 2500, livingYear: 3500, ielts: 6.0, cgpaGood: 2.5,
    unis: ['National University of Uzbekistan', 'Tashkent State Technical University', 'Inha University in Tashkent', 'Westminster International University in Tashkent', 'Samarkand State University'],
    scholarships: ['El-Yurt Umidi Foundation', 'University fee waivers']
  },
  JO: {
    name: 'Jordan', tuitionYear: 4500, livingYear: 5500, ielts: 6.0, cgpaGood: 2.6,
    unis: ['University of Jordan', 'Jordan University of Science and Technology', 'Yarmouk University', 'German Jordanian University', 'Hashemite University'],
    scholarships: ['Jordanian university scholarships', 'Islamic Development Bank awards']
  },
  RU: {
    name: 'Russia', tuitionYear: 4000, livingYear: 5000, ielts: 6.0, cgpaGood: 2.6,
    unis: ['Lomonosov Moscow State University', 'HSE University', 'ITMO University', 'Saint Petersburg State University', 'Novosibirsk State University'],
    scholarships: ['Russian Government Scholarship (quota places)', 'University tuition discounts']
  },
  UA: {
    name: 'Ukraine', tuitionYear: 3000, livingYear: 4000, ielts: 6.0, cgpaGood: 2.5,
    unis: ['Taras Shevchenko National University of Kyiv', 'Igor Sikorsky KPI', 'Lviv Polytechnic', 'V. N. Karazin Kharkiv National University', 'Ivan Franko National University of Lviv'],
    scholarships: ['Ukrainian government scholarships', 'University fee reductions']
  },
  RO: {
    name: 'Romania', tuitionYear: 3500, livingYear: 5500, ielts: 6.0, cgpaGood: 2.5,
    unis: ['University of Bucharest', 'Babeș-Bolyai University', 'Politehnica University of Bucharest', 'Alexandru Ioan Cuza University', 'West University of Timișoara'],
    scholarships: ['Romanian Government Scholarships', 'University merit awards']
  },
  GR: {
    name: 'Greece', tuitionYear: 2500, livingYear: 8000, ielts: 6.0, cgpaGood: 2.6,
    unis: ['National and Kapodistrian University of Athens', 'Aristotle University of Thessaloniki', 'NTUA', 'University of Crete', 'University of Patras'],
    scholarships: ['Greek state scholarships (IKY)', 'University tuition waivers']
  }
};

function synthesizeCountry(code, name, region) {
  const d = REGION_DEFAULTS[region] || REGION_DEFAULTS.WE;
  return {
    name,
    tuitionYear: d.tuitionYear,
    livingYear: d.livingYear,
    ielts: d.ielts,
    cgpaGood: d.cgpaGood,
    unis: [
      'National University of ' + name,
      name + ' University of Science and Technology',
      name + ' University of Arts and Social Sciences'
    ],
    scholarships: [
      name + ' government international scholarships',
      'University tuition waivers / graduate assistantships'
    ]
  };
}

let _studyDB;
function studyDB() {
  if (_studyDB) return _studyDB;
  const out = { ...DETAILED_DB };
  for (const [code, name, region] of WORLD_COUNTRIES) {
    if (!out[code]) out[code] = synthesizeCountry(code, name, region);
  }
  _studyDB = out;
  return out;
}

function publicCatalog() {
  return {
    countries: WORLD_COUNTRIES.map(([code, name]) => [code, name]),
    program_groups: programGroups()
  };
}

module.exports = {
  FIELDS,
  WORLD_COUNTRIES,
  studyDB,
  publicCatalog,
  detectPrograms,
  allProgramNames,
  programLevel
};
