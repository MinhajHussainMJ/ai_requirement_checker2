// Rule-based AI recommendation engine (runs locally, no external API cost)
// Analyzes a candidate profile and returns universities, programs, scholarships,
// countries, eligibility, match score, requirements and next steps.

const DB = {
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
    unis: ['University of Malaya', 'Universiti Teknologi Malaysia', 'Taylor\u2019s University',
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
    unis: ['NUST Islamabad', 'LUMS Lahore', 'FAST NUCES', 'PIEDAS', 'Air University'],
    scholarships: ['HEC Need-based & Merit scholarships', 'Punjab Educational Endowment Fund (PEEF)', 'University assistantships']
  }
};

const PROGRAM_MAP = [
  { k: 'computer|software|it |information technology|data science|ai|artificial intelligence|cyber', p: { CS: 'MSc Computer Science', DS: 'MSc Data Science', AI: 'MSc Artificial Intelligence', IT: 'MSc Information Technology', CE: 'MSc Cybersecurity' } },
  { k: 'business|management|commerce|mba|marketing|finance|account|economic', p: { BS: 'MSc Management', MBA: 'MBA', FIN: 'MSc Finance', ACC: 'MSc Accounting & Finance', MKT: 'MSc Marketing' } },
  { k: 'engineer|mechanical|electrical|civil|chemical|electronics|telecom', p: { ME: 'MSc Mechanical Engineering', EE: 'MSc Electrical Engineering', CE2: 'MSc Civil Engineering', ChE: 'MSc Chemical Engineering', TE: 'MSc Telecommunication Engineering' } },
  { k: 'health|medical|nursing|pharm|public health', p: { NUR: 'MSc Nursing', PH: 'MPH (Public Health)', PHAR: 'MPharm / MSc Pharmacy' } },
];

const PROGRAM_NAMES = ['MSc Computer Science', 'MSc Data Science', 'MSc Artificial Intelligence',
  'MBA', 'MSc Management', 'MSc Finance', 'MSc Public Health', 'MSc Nursing',
  'MSc Mechanical Engineering', 'MSc Electrical Engineering', 'MSc Cybersecurity',
  'MSc Information Technology', 'MSc Education', 'MSc Psychology'];

function toCGPA(val) {
  if (val == null || val === '') return null;
  let n = parseFloat(String(val).replace(/[^0-9.%]/g, ''));
  if (isNaN(n)) return null;
  const s = String(val);
  if (s.includes('%')) return Math.round((n / 100) * 4 * 100) / 100;      // % -> 4.0 scale approx
  if (n > 4) return Math.round((n / 5) * 4 * 100) / 100;                  // 5-point scale
  return n;
}

function detectPrograms(field) {
  const f = (field || '').toLowerCase();
  for (const row of PROGRAM_MAP) {
    const keys = row.k.split('|').map(s => s.trim());
    if (keys.some(k => k && f.includes(k))) return Object.values(row.p);
  }
  return ['Master\u2019s programme aligned with your field'];
}

function analyze(profile) {
  const cgpa = toCGPA(profile.cgpa);
  const ielts = parseFloat(profile.english_score) || null;
  const hasEnglish = !!profile.english_test && profile.english_test !== 'None';
  const budget = parseFloat(String(profile.budget || '').replace(/[^0-9.]/g, '')) || 0; // USD per year
  const gradYear = parseInt(profile.grad_year) || null;
  const workYears = parseFloat(profile.work_exp) || 0;
  const nowYear = new Date().getFullYear();
  const recCountry = (profile.country || '').toUpperCase();

  const wanted = detectPrograms(profile.field).concat(
    PROGRAM_NAMES.includes(profile.program) ? [profile.program] : []);
  const uniquePrograms = [...new Set(wanted)];

  // Score every country
  const ranked = Object.entries(DB).map(([code, c]) => {
    let s = 45;
    const reasons = [];
    // Budget fit (tuition + living vs stated budget)
    const totalCost = c.tuitionYear + c.livingYear;
    if (budget > 0) {
      if (totalCost <= budget) { s += 20; reasons.push('Fits within your budget'); }
      else if (totalCost <= budget * 1.3) { s += 10; reasons.push('Slightly above budget - scholarships can bridge the gap'); }
      else { s -= 15; reasons.push('Typical costs exceed your stated budget'); }
    } else { s += 10; }
    // CGPA
    if (cgpa != null) {
      if (cgpa >= 3.5) s += 12;
      else if (cgpa >= c.cgpaGood) { s += 8; }
      else if (cgpa >= 2.2) { s += 2; }
      else s -= 10;
    }
    // English
    if (!hasEnglish) s -= 8;
    else if (ielts != null) {
      if (ielts >= c.ielts + 0.5) s += 10;
      else if (ielts >= c.ielts) s += 6;
      else if (ielts >= c.ielts - 0.5) s += 0;
      else s -= 10;
    }
    // Work experience bonus
    if (workYears >= 2) s += 4;
    // Study gap
    if (gradYear && nowYear - gradYear > 4) s -= 3;
    // Preferred country boost
    if (code === recCountry) s += 15;
    s = Math.max(20, Math.min(98, Math.round(s)));
    return { code, ...c, score: s, reasons };
  }).sort((a, b) => b.score - a.score);

  const topCountries = ranked.slice(0, 4);
  const uniList = [];
  ranked.slice(0, 3).forEach(c => c.unis.slice(0, 3).forEach(u =>
    uniList.push({ university: u, country: c.name, score: c.score })));

  const scholarshipList = [];
  ranked.slice(0, 4).forEach(c => c.scholarships.forEach(sc =>
    scholarshipList.push({ scholarship: sc, country: c.name })));

  // Eligibility summary
  const eligible = ranked.filter(c =>
    (cgpa == null || cgpa >= 2.2) && (!hasEnglish || ielts == null || ielts >= c.ielts - 0.5));
  const eligibility = {
    overall: cgpa != null && cgpa >= 3.0 ? 'Strong' : cgpa != null && cgpa >= 2.5 ? 'Moderate' : cgpa != null ? 'Needs improvement' : 'Add your CGPA for a full assessment',
    eligibleCountries: eligible.map(c => c.name),
    notes: []
  };
  if (cgpa != null && cgpa < 2.5) eligibility.notes.push('A CGPA below 2.5 limits options at top-ranked universities; consider private/public universities with flexible intake or gain work experience first.');
  if (!hasEnglish) eligibility.notes.push('No English test recorded - IELTS/TOEFL/PTE will almost certainly be required. Plan to take one soon.');
  else if (ielts != null && ielts < 6.5) eligibility.notes.push(`IELTS ${ielts} is below the common 6.5 requirement - pre-sessional English courses are an option in UK/AU/NL.`);
  if (gradYear && nowYear - gradYear > 4) eligibility.notes.push(`Study gap of ${nowYear - gradYear} years - a work-experience letter or study-intent SOP will help admissions.`);
  if (workYears >= 2) eligibility.notes.push('Your 2+ years of work experience strengthens MBA and professional master\u2019s applications.');

  const requirements = [
    'Valid passport (min. 6 months validity)',
    'Transcripts & degree certificate (attested / WES where required)',
    hasEnglish ? `English test report (IELTS/PTE as per university)` : 'IELTS/TOEFL/PTE - book your test',
    'Statement of Purpose (SOP) & 2-3 recommendation letters',
    'Financial proof / bank statements for visa',
    budget > 0 && budget < 15000 ? 'Look for low-tuition countries (Germany, Italy, China, Turkey) or fully-funded scholarships' : 'Proof of funds covering year 1 tuition + living costs'
  ];

  const nextSteps = [
    'Save your profile and review the recommended universities above.',
    !hasEnglish ? 'Register for IELTS/PTE and target 6.5+.' : 'Check each shortlisted university\u2019s exact English requirement.',
    'Prepare SOP, CV-style academic resume and reference letters.',
    'Apply 6-9 months before intake (Fall intake closes ~May-June).',
    budget > 0 && budget < 15000 ? 'Prioritise scholarship-funded options from the list above.' : 'Keep financial documents ready for the visa stage.',
    'Subscribe (if trial ended) and consult again after you receive test scores.'
  ];

  return {
    generated_at: new Date().toISOString(),
    profile_summary: {
      cgpa_4_0: cgpa, ielts, budget_usd_year: budget,
      work_years: workYears, detected_programs: uniquePrograms
    },
    match_score: topCountries[0] ? topCountries[0].score : 0,
    countries: ranked.slice(0, 6).map(c => ({
      country: c.name, code: c.code, score: c.score,
      est_tuition_usd_year: c.tuitionYear, est_living_usd_year: c.livingYear,
      min_ielts: c.ielts, reasons: c.reasons
    })),
    universities: uniList.slice(0, 9),
    programs: uniquePrograms,
    scholarships: scholarshipList.slice(0, 8),
    eligibility, requirements, next_steps: nextSteps
  };
}

module.exports = { analyze };
