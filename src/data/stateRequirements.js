// Homeschool requirements by state
// Note: These are general guidelines. Always verify with your state's department of education.
// Hours are annual totals. Some states specify days instead of hours.

export const STATE_REQUIREMENTS = {
  AL: {
    name: 'Alabama',
    hoursRequired: null,
    daysRequired: null,
    subjects: [],
    notes: 'No specific hour requirements. Must provide instruction in specified subjects.',
    complianceLevel: 'low',
    link: 'https://www.alsde.edu/'
  },
  AK: {
    name: 'Alaska',
    hoursRequired: null,
    daysRequired: 180,
    subjects: [],
    notes: 'Home schools must operate for 180 days per year.',
    complianceLevel: 'low',
    link: 'https://education.alaska.gov/'
  },
  AZ: {
    name: 'Arizona',
    hoursRequired: null,
    daysRequired: null,
    subjects: ['reading', 'grammar', 'math', 'social studies', 'science'],
    notes: 'No specific hour or day requirements. Must file affidavit of intent.',
    complianceLevel: 'low',
    link: 'https://www.azed.gov/'
  },
  AR: {
    name: 'Arkansas',
    hoursRequired: null,
    daysRequired: null,
    subjects: [],
    notes: 'Must provide notice of intent. No specific hour requirements.',
    complianceLevel: 'low',
    link: 'https://dese.ade.arkansas.gov/'
  },
  CA: {
    name: 'California',
    hoursRequired: null,
    daysRequired: 175,
    subjects: [],
    notes: 'Private school affidavit required. 175 days of instruction typically expected.',
    complianceLevel: 'moderate',
    link: 'https://www.cde.ca.gov/'
  },
  CO: {
    name: 'Colorado',
    hoursRequired: 968,
    daysRequired: 172,
    subjects: [],
    recommendedHours: {
      'Language Arts': 180,
      'Mathematics': 180,
      'Science': 120,
      'History/Social Studies': 120,
      'Art': 60,
      'Physical Education': 60
    },
    notes: '968 hours for grades 1-8, 1056 hours for grades 9-12. 172 days minimum.',
    complianceLevel: 'moderate',
    link: 'https://www.cde.state.co.us/'
  },
  CT: {
    name: 'Connecticut',
    hoursRequired: 900,
    daysRequired: 180,
    subjects: ['reading', 'writing', 'spelling', 'english grammar', 'geography', 'arithmetic', 'us history', 'citizenship'],
    recommendedHours: {
      'Language Arts': 200,
      'Mathematics': 180,
      'Science': 120,
      'History/Social Studies': 150,
      'Art': 50,
      'Physical Education': 50
    },
    notes: '900 hours minimum instruction recommended. 180 days of instruction.',
    complianceLevel: 'moderate',
    link: 'https://portal.ct.gov/sde'
  },
  DE: {
    name: 'Delaware',
    hoursRequired: null,
    daysRequired: 180,
    subjects: [],
    notes: '180 days of instruction required.',
    complianceLevel: 'low',
    link: 'https://www.doe.k12.de.us/'
  },
  FL: {
    name: 'Florida',
    hoursRequired: null,
    daysRequired: null,
    subjects: [],
    notes: 'Must maintain portfolio and provide annual evaluation. No specific hours.',
    complianceLevel: 'moderate',
    link: 'https://www.fldoe.org/'
  },
  GA: {
    name: 'Georgia',
    hoursRequired: 990,
    daysRequired: 180,
    subjects: ['reading', 'language arts', 'math', 'social studies', 'science'],
    recommendedHours: {
      'Language Arts': 200,
      'Mathematics': 180,
      'Science': 150,
      'History/Social Studies': 150,
      'Art': 60,
      'Physical Education': 60
    },
    notes: '4.5 hours per day minimum, 180 days = 810 hours minimum. Most interpret as ~990 hours.',
    complianceLevel: 'moderate',
    link: 'https://www.gadoe.org/'
  },
  HI: {
    name: 'Hawaii',
    hoursRequired: null,
    daysRequired: null,
    subjects: [],
    notes: 'Must submit notice of intent. No specific hour requirements.',
    complianceLevel: 'low',
    link: 'https://www.hawaiipublicschools.org/'
  },
  ID: {
    name: 'Idaho',
    hoursRequired: null,
    daysRequired: null,
    subjects: [],
    notes: 'No registration or notification required. No specific requirements.',
    complianceLevel: 'none',
    link: 'https://www.sde.idaho.gov/'
  },
  IL: {
    name: 'Illinois',
    hoursRequired: null,
    daysRequired: 176,
    subjects: ['language arts', 'math', 'biological/physical science', 'social sciences', 'fine arts', 'physical development', 'health'],
    notes: 'No registration required. 176 days of attendance expected.',
    complianceLevel: 'low',
    link: 'https://www.isbe.net/'
  },
  IN: {
    name: 'Indiana',
    hoursRequired: null,
    daysRequired: 180,
    subjects: [],
    notes: '180 days of instruction equivalent to public schools.',
    complianceLevel: 'low',
    link: 'https://www.in.gov/doe/'
  },
  IA: {
    name: 'Iowa',
    hoursRequired: 1000,
    daysRequired: 148,
    subjects: ['math', 'reading/language arts', 'science', 'social studies'],
    recommendedHours: {
      'Language Arts': 250,
      'Mathematics': 200,
      'Science': 150,
      'History/Social Studies': 150,
      'Art': 50,
      'Physical Education': 50
    },
    notes: '1000 hours of instruction or 148 days minimum for CPI option.',
    complianceLevel: 'moderate',
    link: 'https://educateiowa.gov/'
  },
  KS: {
    name: 'Kansas',
    hoursRequired: null,
    daysRequired: 186,
    subjects: [],
    notes: 'Must be registered as non-accredited private school. 186 days of instruction.',
    complianceLevel: 'low',
    link: 'https://www.ksde.org/'
  },
  KY: {
    name: 'Kentucky',
    hoursRequired: 1062,
    daysRequired: 177,
    subjects: ['reading', 'writing', 'spelling', 'grammar', 'history', 'math', 'civics'],
    recommendedHours: {
      'Language Arts': 250,
      'Mathematics': 200,
      'Science': 150,
      'History/Social Studies': 200,
      'Art': 50,
      'Physical Education': 50
    },
    notes: '6 hours per day minimum, 177 days = 1062 hours.',
    complianceLevel: 'moderate',
    link: 'https://education.ky.gov/'
  },
  LA: {
    name: 'Louisiana',
    hoursRequired: null,
    daysRequired: 180,
    subjects: [],
    notes: 'Must submit application. 180 days of instruction for state-approved programs.',
    complianceLevel: 'moderate',
    link: 'https://www.louisianabelieves.com/'
  },
  ME: {
    name: 'Maine',
    hoursRequired: null,
    daysRequired: 175,
    subjects: ['english/language arts', 'math', 'science/technology', 'social studies', 'physical education', 'health', 'library skills', 'fine arts', 'career prep'],
    notes: '175 days of instruction required.',
    complianceLevel: 'moderate',
    link: 'https://www.maine.gov/doe/'
  },
  MD: {
    name: 'Maryland',
    hoursRequired: null,
    daysRequired: null,
    subjects: ['english', 'math', 'science', 'social studies', 'art', 'music', 'health', 'physical education'],
    notes: 'Must provide "regular, thorough instruction." Reviews may be required.',
    complianceLevel: 'moderate',
    link: 'https://www.marylandpublicschools.org/'
  },
  MA: {
    name: 'Massachusetts',
    hoursRequired: 900,
    daysRequired: 180,
    subjects: [],
    recommendedHours: {
      'Language Arts': 200,
      'Mathematics': 180,
      'Science': 120,
      'History/Social Studies': 150,
      'Art': 50,
      'Physical Education': 50
    },
    notes: 'Must submit education plan for approval. ~900 hours expected, 180 days.',
    complianceLevel: 'high',
    link: 'https://www.doe.mass.edu/'
  },
  MI: {
    name: 'Michigan',
    hoursRequired: null,
    daysRequired: null,
    subjects: ['reading', 'spelling', 'math', 'science', 'history', 'civics', 'literature', 'writing', 'english grammar'],
    notes: 'No notification required. Must teach required subjects.',
    complianceLevel: 'low',
    link: 'https://www.michigan.gov/mde'
  },
  MN: {
    name: 'Minnesota',
    hoursRequired: null,
    daysRequired: null,
    subjects: ['reading', 'writing', 'literature', 'fine arts', 'math', 'science', 'history', 'geography', 'government', 'health', 'physical education'],
    notes: 'Must file annual report. No specific hour requirements.',
    complianceLevel: 'moderate',
    link: 'https://education.mn.gov/'
  },
  MS: {
    name: 'Mississippi',
    hoursRequired: null,
    daysRequired: null,
    subjects: [],
    notes: 'Certificate of enrollment required. No specific hour requirements.',
    complianceLevel: 'low',
    link: 'https://www.mdek12.org/'
  },
  MO: {
    name: 'Missouri',
    hoursRequired: 1000,
    daysRequired: null,
    subjects: ['reading', 'language arts', 'math', 'social studies', 'science'],
    recommendedHours: {
      'Language Arts': 250,
      'Mathematics': 200,
      'Science': 150,
      'History/Social Studies': 150,
      'Art': 50,
      'Physical Education': 50
    },
    notes: '1000 hours instruction, 600 in core subjects, 400 at regular location.',
    complianceLevel: 'moderate',
    link: 'https://dese.mo.gov/'
  },
  MT: {
    name: 'Montana',
    hoursRequired: 720,
    daysRequired: 180,
    subjects: [],
    recommendedHours: {
      'Language Arts': 180,
      'Mathematics': 150,
      'Science': 100,
      'History/Social Studies': 100,
      'Art': 45,
      'Physical Education': 45
    },
    notes: '720 hours minimum (4 hours/day × 180 days).',
    complianceLevel: 'low',
    link: 'https://opi.mt.gov/'
  },
  NE: {
    name: 'Nebraska',
    hoursRequired: 1032,
    daysRequired: null,
    subjects: ['language arts', 'math', 'science', 'social studies', 'health'],
    recommendedHours: {
      'Language Arts': 250,
      'Mathematics': 200,
      'Science': 150,
      'History/Social Studies': 150,
      'Art': 50,
      'Physical Education': 50
    },
    notes: '1032 hours for elementary, 1080 for high school.',
    complianceLevel: 'moderate',
    link: 'https://www.education.ne.gov/'
  },
  NV: {
    name: 'Nevada',
    hoursRequired: null,
    daysRequired: 180,
    subjects: [],
    notes: 'Must file notice of intent. 180 days equivalent instruction.',
    complianceLevel: 'low',
    link: 'https://doe.nv.gov/'
  },
  NH: {
    name: 'New Hampshire',
    hoursRequired: null,
    daysRequired: null,
    subjects: ['science', 'math', 'language', 'government', 'history', 'health', 'reading', 'writing', 'spelling', 'art', 'music'],
    notes: 'Must notify and provide annual evaluation. No hour requirements.',
    complianceLevel: 'moderate',
    link: 'https://www.education.nh.gov/'
  },
  NJ: {
    name: 'New Jersey',
    hoursRequired: null,
    daysRequired: null,
    subjects: [],
    notes: 'Must provide "equivalent instruction." No registration or hours required.',
    complianceLevel: 'none',
    link: 'https://www.nj.gov/education/'
  },
  NM: {
    name: 'New Mexico',
    hoursRequired: 990,
    daysRequired: null,
    subjects: ['reading', 'language arts', 'math', 'social studies', 'science'],
    recommendedHours: {
      'Language Arts': 250,
      'Mathematics': 200,
      'Science': 150,
      'History/Social Studies': 150,
      'Art': 45,
      'Physical Education': 45
    },
    notes: '5.5 hours/day for 180 days = 990 hours minimum.',
    complianceLevel: 'moderate',
    link: 'https://webnew.ped.state.nm.us/'
  },
  NY: {
    name: 'New York',
    hoursRequired: 900,
    daysRequired: 180,
    subjects: ['math', 'science', 'english', 'social studies', 'art', 'music', 'health', 'physical education', 'library skills'],
    recommendedHours: {
      'Language Arts': 200,
      'Mathematics': 180,
      'Science': 120,
      'History/Social Studies': 150,
      'Art': 50,
      'Physical Education': 50,
      'Health': 30
    },
    notes: '900 hours for grades 1-6, 990 hours for grades 7-12. Quarterly reports required.',
    complianceLevel: 'high',
    link: 'https://www.nysed.gov/'
  },
  NC: {
    name: 'North Carolina',
    hoursRequired: null,
    daysRequired: null,
    subjects: [],
    notes: 'Must file notice and maintain attendance records. No specific hours.',
    complianceLevel: 'low',
    link: 'https://www.dpi.nc.gov/'
  },
  ND: {
    name: 'North Dakota',
    hoursRequired: 875,
    daysRequired: 175,
    subjects: ['english', 'math', 'social studies', 'science', 'health', 'physical education', 'music', 'art'],
    recommendedHours: {
      'Language Arts': 200,
      'Mathematics': 175,
      'Science': 120,
      'History/Social Studies': 150,
      'Art': 40,
      'Physical Education': 50,
      'Health': 30
    },
    notes: '175 days, roughly 5 hours/day = 875 hours.',
    complianceLevel: 'moderate',
    link: 'https://www.nd.gov/dpi/'
  },
  OH: {
    name: 'Ohio',
    hoursRequired: 900,
    daysRequired: null,
    subjects: ['language arts', 'geography', 'us/ohio history', 'government', 'math', 'health', 'physical education', 'fine arts', 'first aid/safety', 'science'],
    recommendedHours: {
      'Language Arts': 200,
      'Mathematics': 180,
      'Science': 120,
      'History/Social Studies': 150,
      'Art': 50,
      'Physical Education': 50,
      'Health': 30
    },
    notes: '900 hours of instruction required annually.',
    complianceLevel: 'moderate',
    link: 'https://education.ohio.gov/'
  },
  OK: {
    name: 'Oklahoma',
    hoursRequired: null,
    daysRequired: 180,
    subjects: ['reading', 'writing', 'math', 'science', 'citizenship', 'us constitution', 'health', 'safety', 'physical education', 'conservation'],
    notes: '180 days of instruction.',
    complianceLevel: 'low',
    link: 'https://sde.ok.gov/'
  },
  OR: {
    name: 'Oregon',
    hoursRequired: null,
    daysRequired: null,
    subjects: [],
    notes: 'Must notify ESD. No specific hour requirements.',
    complianceLevel: 'low',
    link: 'https://www.oregon.gov/ode/'
  },
  PA: {
    name: 'Pennsylvania',
    hoursRequired: 900,
    daysRequired: 180,
    subjects: ['english', 'math', 'science', 'social studies', 'art', 'music', 'physical education', 'health', 'safety', 'fire prevention'],
    recommendedHours: {
      'Language Arts': 200,
      'Mathematics': 180,
      'Science': 120,
      'History/Social Studies': 150,
      'Art': 50,
      'Physical Education': 50,
      'Health': 30
    },
    notes: '900 hours elementary, 990 hours secondary. 180 days. Evaluator required.',
    complianceLevel: 'high',
    link: 'https://www.education.pa.gov/'
  },
  RI: {
    name: 'Rhode Island',
    hoursRequired: null,
    daysRequired: null,
    subjects: ['reading', 'writing', 'geography', 'arithmetic', 'us/ri history', 'government'],
    notes: 'Must receive approval from school committee. Requirements vary by district.',
    complianceLevel: 'high',
    link: 'https://www.ride.ri.gov/'
  },
  SC: {
    name: 'South Carolina',
    hoursRequired: 990,
    daysRequired: 180,
    subjects: ['reading', 'writing', 'math', 'science', 'social studies'],
    recommendedHours: {
      'Language Arts': 250,
      'Mathematics': 200,
      'Science': 150,
      'History/Social Studies': 150,
      'Art': 45,
      'Physical Education': 45
    },
    notes: '4.5 hours/day for 180 days = 810-990 hours. Must maintain records.',
    complianceLevel: 'moderate',
    link: 'https://ed.sc.gov/'
  },
  SD: {
    name: 'South Dakota',
    hoursRequired: null,
    daysRequired: null,
    subjects: ['language arts', 'math'],
    notes: 'Must notify. Must teach language arts and math. No specific hours.',
    complianceLevel: 'low',
    link: 'https://doe.sd.gov/'
  },
  TN: {
    name: 'Tennessee',
    hoursRequired: null,
    daysRequired: 180,
    subjects: [],
    notes: '4 hours instruction per day for 180 days for independent homeschools.',
    complianceLevel: 'low',
    link: 'https://www.tn.gov/education.html'
  },
  TX: {
    name: 'Texas',
    hoursRequired: null,
    daysRequired: null,
    subjects: ['reading', 'spelling', 'grammar', 'math', 'good citizenship'],
    notes: 'No registration or notification required. Must teach required subjects.',
    complianceLevel: 'none',
    link: 'https://tea.texas.gov/'
  },
  UT: {
    name: 'Utah',
    hoursRequired: null,
    daysRequired: null,
    subjects: ['language arts', 'math', 'science', 'social studies', 'arts', 'health', 'computer literacy', 'vocational education'],
    notes: 'Must provide affidavit to local school board. No hour requirements.',
    complianceLevel: 'low',
    link: 'https://www.schools.utah.gov/'
  },
  VT: {
    name: 'Vermont',
    hoursRequired: null,
    daysRequired: null,
    subjects: ['reading', 'writing', 'math', 'citizenship/history', 'literature', 'science', 'fine arts', 'physical education', 'health'],
    notes: 'Must enroll annually and provide assessment results. No hour requirements.',
    complianceLevel: 'moderate',
    link: 'https://education.vermont.gov/'
  },
  VA: {
    name: 'Virginia',
    hoursRequired: null,
    daysRequired: null,
    subjects: [],
    notes: 'Must notify annually and provide evidence of progress. No specific hours.',
    complianceLevel: 'moderate',
    link: 'https://www.doe.virginia.gov/'
  },
  WA: {
    name: 'Washington',
    hoursRequired: 1000,
    daysRequired: 180,
    subjects: ['reading', 'writing', 'spelling', 'language', 'math', 'science', 'social studies', 'history', 'health', 'occupational education', 'art', 'music'],
    recommendedHours: {
      'Language Arts': 250,
      'Mathematics': 200,
      'Science': 150,
      'History/Social Studies': 150,
      'Art': 50,
      'Physical Education': 50
    },
    notes: '1000 hours annual instruction, 180 days. Must file declaration of intent.',
    complianceLevel: 'moderate',
    link: 'https://www.k12.wa.us/'
  },
  WV: {
    name: 'West Virginia',
    hoursRequired: null,
    daysRequired: null,
    subjects: ['reading', 'language arts', 'math', 'science', 'social studies'],
    notes: 'Must provide notice and annual assessment. No specific hours.',
    complianceLevel: 'moderate',
    link: 'https://wvde.us/'
  },
  WI: {
    name: 'Wisconsin',
    hoursRequired: 875,
    daysRequired: null,
    subjects: ['reading', 'language arts', 'math', 'science', 'social studies', 'health'],
    recommendedHours: {
      'Language Arts': 200,
      'Mathematics': 175,
      'Science': 120,
      'History/Social Studies': 150,
      'Art': 40,
      'Physical Education': 50
    },
    notes: '875 hours of instruction required annually.',
    complianceLevel: 'low',
    link: 'https://dpi.wi.gov/'
  },
  WY: {
    name: 'Wyoming',
    hoursRequired: null,
    daysRequired: 175,
    subjects: ['reading', 'writing', 'math', 'civics', 'history', 'literature', 'science'],
    notes: '175 days of instruction.',
    complianceLevel: 'low',
    link: 'https://edu.wyoming.gov/'
  },
  DC: {
    name: 'District of Columbia',
    hoursRequired: null,
    daysRequired: 180,
    subjects: [],
    notes: '180 days of instruction required.',
    complianceLevel: 'low',
    link: 'https://osse.dc.gov/'
  }
}

// Helper to get compliance level description
export const COMPLIANCE_LEVELS = {
  none: {
    label: 'No Regulation',
    description: 'No state requirements for homeschooling',
    color: '#8FB39A'
  },
  low: {
    label: 'Low Regulation',
    description: 'Minimal requirements such as notification only',
    color: '#5A8F7B'
  },
  moderate: {
    label: 'Moderate Regulation',
    description: 'Requirements may include notification, test scores, or curriculum approval',
    color: '#E8A87C'
  },
  high: {
    label: 'High Regulation',
    description: 'Significant requirements including approval, assessments, and teacher qualifications',
    color: '#D4896A'
  }
}

// Get all states as array for dropdowns
export const STATES_LIST = Object.entries(STATE_REQUIREMENTS).map(([code, data]) => ({
  code,
  ...data
})).sort((a, b) => a.name.localeCompare(b.name))
