// Rule-based AI recommendation engine (runs locally, no external API cost)
// Analyzes a candidate profile and returns universities, programs, scholarships,
// countries, eligibility, match score, requirements and next steps.

const { studyDB, detectPrograms, programLevel } = require('./catalog');

const DB = studyDB();

function toCGPA(val) {
  if (val == null || val === '') return null;
  let n = parseFloat(String(val).replace(/[^0-9.%]/g, ''));
  if (isNaN(n)) return null;
  const s = String(val);
  if (s.includes('%')) return Math.round((n / 100) * 4 * 100) / 100;      // % -> 4.0 scale approx
  if (n > 4) return Math.round((n / 5) * 4 * 100) / 100;                  // 5-point scale
  return n;
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
  const level = programLevel(profile);

  const uniquePrograms = detectPrograms(profile);

  // Score every country that offers higher education (BS / Master's / PhD)
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
    // Work experience bonus (stronger for Master's / MBA; lighter for BS)
    if (workYears >= 2) s += level === 'bachelor' ? 2 : 4;
    // Study gap
    if (gradYear && nowYear - gradYear > 4) s -= 3;
    // Preferred country boost
    if (code === recCountry) s += 15;
    // Level-specific note
    if (level === 'phd') reasons.push('PhD places typically require a relevant master’s (or strong bachelor’s) and a research proposal');
    if (level === 'bachelor') reasons.push('Bachelor (BS/BA) intake is widely offered at public and private universities');
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
    eligibleCountries: eligible.slice(0, 20).map(c => c.name),
    notes: []
  };
  if (cgpa != null && cgpa < 2.5) eligibility.notes.push('A CGPA below 2.5 limits options at top-ranked universities; consider private/public universities with flexible intake or gain work experience first.');
  if (!hasEnglish) eligibility.notes.push('No English test recorded - IELTS/TOEFL/PTE will almost certainly be required. Plan to take one soon.');
  else if (ielts != null && ielts < 6.5) eligibility.notes.push(`IELTS ${ielts} is below the common 6.5 requirement - pre-sessional English courses are an option in UK/AU/NL.`);
  if (gradYear && nowYear - gradYear > 4) eligibility.notes.push(`Study gap of ${nowYear - gradYear} years - a work-experience letter or study-intent SOP will help admissions.`);
  if (workYears >= 2) eligibility.notes.push('Your 2+ years of work experience strengthens MBA and professional master’s applications.');
  if (level === 'phd') eligibility.notes.push('PhD applications are stronger with a research proposal, publications or a faculty supervisor match.');
  if (level === 'bachelor') eligibility.notes.push('BS/BA applications typically need secondary-school transcripts (and foundation/pathway study if grades are below direct-entry).');

  const requirements = [
    'Valid passport (min. 6 months validity)',
    'Transcripts & degree certificate (attested / WES where required)',
    hasEnglish ? `English test report (IELTS/PTE as per university)` : 'IELTS/TOEFL/PTE - book your test',
    level === 'phd' ? 'Research proposal, CV and 2-3 academic recommendation letters' : 'Statement of Purpose (SOP) & 2-3 recommendation letters',
    'Financial proof / bank statements for visa',
    budget > 0 && budget < 15000 ? 'Look for low-tuition countries (Germany, Italy, China, Turkey, Norway, Argentina) or fully-funded scholarships' : 'Proof of funds covering year 1 tuition + living costs'
  ];

  const nextSteps = [
    'Save your profile and review the recommended universities above.',
    !hasEnglish ? 'Register for IELTS/PTE and target 6.5+.' : 'Check each shortlisted university’s exact English requirement.',
    level === 'phd' ? 'Draft a research proposal and email potential supervisors in your field.' : 'Prepare SOP, CV-style academic resume and reference letters.',
    'Apply 6-9 months before intake (Fall intake closes ~May-June).',
    budget > 0 && budget < 15000 ? 'Prioritise scholarship-funded options from the list above.' : 'Keep financial documents ready for the visa stage.',
    'Subscribe (if trial ended) and consult again after you receive test scores.'
  ];

  return {
    generated_at: new Date().toISOString(),
    profile_summary: {
      cgpa_4_0: cgpa, ielts, budget_usd_year: budget,
      work_years: workYears, detected_programs: uniquePrograms, study_level: level
    },
    match_score: topCountries[0] ? topCountries[0].score : 0,
    countries: ranked.slice(0, 8).map(c => ({
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
