const TABLES = {
  ACCOUNTS: 'accounts',
  APPLICATIONS: 'applications',
  COMPANIES: 'companies',
  CONNECTIONS: 'connections',
  CONVERSATIONS: 'conversations',
  EMPLOYEES: 'employees',
  EMPLOYMENTS: 'employments',
  HIRERS: 'hirers',
  JOBS: 'jobs',
  JOB_TAGS: 'jobTags',
  PEOPLE: 'people',
  PERSON_ROLES: 'personRoles',
  REFERRALS: 'referrals',
  ROLES: 'roles',
  ROLE_TAGS: 'roleTags',
  SURVEYS: 'surveys',
  SURVEY_ANSWERS: 'surveyAnswers',
  SURVEY_ANSWER_CONNECTIONS: 'surveyAnswerConnections',
  SURVEY_QUESTIONS: 'surveyQuestions',
  SURVEY_QUESTION_TAGS: 'surveyQuestionTags',
  SURVEY_SECTIONS: 'surveySections',
  TAGS: 'tags',
  VIEW_EVENTS: 'viewEvents'
}
const FIELDS = {
  GENERIC: {
    ID: 'id',
    CREATED: 'created',
    MODIFIED: 'modified'
  },
  [TABLES.ACCOUNTS]: {
    EMAIL: 'email',
    EMAIL_ADDRESSES: 'emailAddresses',
    DATA: 'data',
    TYPE: 'type',
    PERSON: 'person'
  },
  [TABLES.APPLICATIONS]: {
    PERSON: 'person',
    JOB: 'job',
    REFERRAL: 'referral'
  },
  [TABLES.COMPANIES]: {
    NAME: 'name',
    SLUG: 'slug',
    CLIENT: 'client',
    ONBOARDED: 'onboarded'
  },
  [TABLES.CONNECTIONS]: {
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    SOURCE: 'source',
    PERSON: 'person',
    FROM: 'from',
    ROLE: 'role',
    COMPANY: 'company'
  },
  [TABLES.CONVERSATIONS]: {
    THREAD_ID: 'threadId',
    TYPE: 'type',
    PERSON: 'person',
    RECIPIENT: 'recipient'
  },
  [TABLES.EMPLOYEES]: {
    PERSON: 'person',
    COMPANY: 'company'
  },
  [TABLES.EMPLOYMENTS]: {
    CURRENT: 'current',
    SOURCE: 'source',
    PERSON: 'person',
    COMPANY: 'company'
  },
  [TABLES.HIRERS]: {
    ONBOARDED: 'onboarded',
    TYPE: 'type',
    PERSON: 'person',
    COMPANY: 'company'
  },
  [TABLES.JOBS]: {
    TITLE: 'title',
    SLUG: 'slug',
    URL: 'url',
    LOCATION: 'location',
    REMUNERATION: 'remuneration',
    TEMPLATE: 'template',
    DESCRIPTION: 'description',
    CANDIDATE_DESCRIPTION: 'candidateDescription',
    ROLE_DESCRIPTION: 'roleDescription',
    EXPERIENCE: 'experience',
    REQUIREMENTS: 'requirements',
    BONUS: 'bonus',
    STATUS: 'status',
    COMPANY: 'company'
  },
  [TABLES.JOB_TAGS]: {
    SOURCE: 'source',
    JOB: 'job',
    TAG: 'tag'
  },
  [TABLES.PEOPLE]: {
    EMAIL: 'email',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    URL: 'url'
  },
  [TABLES.PERSON_ROLES]: {
    CURRENT: 'current',
    PERSON: 'person',
    ROLE: 'role'
  },
  [TABLES.REFERRALS]: {
    PERSON: 'person',
    JOB: 'job',
    PARENT: 'parent'
  },
  [TABLES.ROLES]: {
    NAME: 'name'
  },
  [TABLES.ROLE_TAGS]: {
    SOURCE: 'source',
    ROLE: 'role',
    TAG: 'tag'
  },
  [TABLES.SURVEYS]: {
    SLUG: 'slug',
    INTRO_TITLE: 'introTitle',
    INTRO_DESCRIPTION: 'introDescription',
    OUTRO_TITLE: 'outroTitle',
    OUTRO_DESCRIPTION: 'outroDescription',
    SURVEY_SECTIONS: 'surveySections',
    COMPANY: 'company'
  },
  [TABLES.SURVEY_ANSWERS]: {
    PERSON: 'person',
    SURVEY_QUESTION: 'surveyQuestion'
  },
  [TABLES.SURVEY_ANSWER_CONNECTIONS]: {
    SURVEY_ANSWER: 'surveyAnswer',
    CONNECTION: 'connection'
  },
  [TABLES.SURVEY_QUESTIONS]: {
    SLUG: 'slug',
    TITLE: 'title',
    DESCRIPTION: 'description',
    REQUIRED: 'required',
    TYPE: 'type',
    SURVEY_SECTION: 'surveySection'
  },
  [TABLES.SURVEY_QUESTION_TAGS]: {
    SOURCE: 'source',
    SURVEY_QUESTION: 'surveyQuestion',
    TAG: 'tag'
  },
  [TABLES.SURVEY_SECTIONS]: {
    SLUG: 'slug',
    TITLE: 'title',
    DESCRIPTION: 'description',
    SURVEY_QUESTIONS: 'surveyQuestions',
    SURVEY: 'survey'
  },
  [TABLES.TAGS]: {
    NAME: 'name',
    TYPE: 'type'
  },
  [TABLES.VIEW_EVENTS]: {
    BROWSER_ID: 'browserId',
    JOB: 'job'
  }
}
const ENUMS = {
  JOB_STATUSES: createEnumDefinition(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  HIRER_TYPES: createEnumDefinition(['MEMBER', 'ADMIN']),
  DATA_SOURCES: createEnumDefinition(['MANUAL', 'LINKEDIN', 'SURVEY', 'NUDJ']),
  ACCOUNT_TYPES: createEnumDefinition(['GOOGLE', 'OTHER']),
  QUESTION_TYPES: createEnumDefinition(['CONNECTIONS', 'COMPANIES']),
  TAG_TYPES: createEnumDefinition(['EXPERTISE', 'SENIORITY'])
}

function createEnumDefinition (items) {
  const enumDefinition = items.reduce((enumDefinition, item) => {
    enumDefinition[item] = item
    return enumDefinition
  }, {})
  enumDefinition.values = items
  return enumDefinition
}

function defaultConfig (t, knex) {
  t.charset('utf8mb4') // to support emoji
  t.collate('utf8mb4_bin') // to support emoji
  t.uuid(FIELDS.GENERIC.ID).primary()
  t.timestamp(FIELDS.GENERIC.CREATED).defaultTo(knex.fn.now()).notNullable()
  t.timestamp(FIELDS.GENERIC.MODIFIED).defaultTo(knex.fn.now()).notNullable()
}
function emailType (fieldName, t, knex) {
  // https://dba.stackexchange.com/questions/37014/in-what-data-type-should-i-store-an-email-address-in-database
  return t.string(fieldName, 320)
}
function urlType (fieldName, t, knex) {
  // https://stackoverflow.com/questions/219569/best-database-field-type-for-a-url
  return t.string(fieldName, 2083)
}
function relationType (fieldName, table, t, knex) {
  return t.uuid(fieldName).references(FIELDS.GENERIC.ID).inTable(table)
}

module.exports = {
  // constants
  TABLES,
  FIELDS,
  ENUMS,

  // functions
  defaultConfig,
  emailType,
  urlType,
  relationType
}
