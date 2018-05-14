const format = require('date-fns/format')
const randomstring = require('randomstring')
const kebabCase = require('lodash/kebabCase')

const {
  TABLES,
  FIELDS
} = require('../../lib/sql')

const OLD_COLLECTIONS = {
  PEOPLE: TABLES.PEOPLE,
  COMPANIES: TABLES.COMPANIES,
  JOBS: TABLES.JOBS,
  HIRERS: TABLES.HIRERS,
  REFERRALS: TABLES.REFERRALS,
  APPLICATIONS: TABLES.APPLICATIONS,
  EMPLOYMENTS: TABLES.EMPLOYMENTS,
  EMPLOYEES: TABLES.EMPLOYEES,
  ROLES: TABLES.ROLES,
  PERSON_ROLES: TABLES.PERSON_ROLES,
  CONNECTIONS: TABLES.CONNECTIONS,
  ACCOUNTS: TABLES.ACCOUNTS,
  CONVERSATIONS: TABLES.CONVERSATIONS,
  SURVEYS: TABLES.SURVEYS,
  SURVEY_SECTIONS: TABLES.SURVEY_SECTIONS,
  SURVEY_QUESTIONS: TABLES.SURVEY_QUESTIONS,
  SURVEY_ANSWERS: TABLES.SURVEY_ANSWERS,
  TAGS: TABLES.TAGS,
  JOB_TAGS: TABLES.JOB_TAGS,
  ROLE_TAGS: TABLES.ROLE_TAGS,
  SURVEY_QUESTION_TAGS: TABLES.SURVEY_QUESTION_TAGS,
  EVENTS: 'events'
}
const NEW_COLLECTIONS = {
  JOB_VIEW_EVENTS: 'jobViewEvents'
}
const TABLE_ORDER = [
  TABLES.PEOPLE,
  TABLES.COMPANIES,
  TABLES.JOBS,
  TABLES.HIRERS,
  TABLES.REFERRALS,
  TABLES.APPLICATIONS,
  TABLES.EMPLOYMENTS,
  TABLES.EMPLOYEES,
  TABLES.ROLES,
  TABLES.PERSON_ROLES,
  TABLES.CONNECTIONS,
  TABLES.ACCOUNTS,
  TABLES.CONVERSATIONS,
  TABLES.SURVEYS,
  TABLES.SURVEY_SECTIONS,
  TABLES.SURVEY_QUESTIONS,
  TABLES.SURVEY_ANSWERS,
  TABLES.TAGS,
  TABLES.JOB_TAGS,
  TABLES.ROLE_TAGS,
  TABLES.SURVEY_QUESTION_TAGS
]
const NEW_TO_OLD_COLLECTION = {
  [NEW_COLLECTIONS.JOB_VIEW_EVENTS]: OLD_COLLECTIONS.EVENTS
}
const FIELD_TO_PROP = {
  [TABLES.ACCOUNTS]: {
    [FIELDS[TABLES.ACCOUNTS].EMAIL]: 'emailAddress'
  }
}
const RELATIONS = {
  [TABLES.JOBS]: {
    [FIELDS[TABLES.JOBS].COMPANY]: TABLES.COMPANIES
  },
  [TABLES.HIRERS]: {
    [FIELDS[TABLES.HIRERS].PERSON]: TABLES.PEOPLE,
    [FIELDS[TABLES.HIRERS].COMPANY]: TABLES.COMPANIES
  },
  [TABLES.REFERRALS]: {
    [FIELDS[TABLES.REFERRALS].PERSON]: TABLES.PEOPLE,
    [FIELDS[TABLES.REFERRALS].JOB]: TABLES.JOBS,
    [FIELDS[TABLES.REFERRALS].PARENT]: TABLES.REFERRALS
  },
  [TABLES.APPLICATIONS]: {
    [FIELDS[TABLES.APPLICATIONS].PERSON]: TABLES.PEOPLE,
    [FIELDS[TABLES.APPLICATIONS].JOB]: TABLES.JOBS,
    [FIELDS[TABLES.APPLICATIONS].REFERRAL]: TABLES.REFERRALS
  },
  [TABLES.EMPLOYMENTS]: {
    [FIELDS[TABLES.EMPLOYMENTS].PERSON]: TABLES.PEOPLE,
    [FIELDS[TABLES.EMPLOYMENTS].COMPANY]: TABLES.COMPANIES
  },
  [TABLES.EMPLOYEES]: {
    [FIELDS[TABLES.EMPLOYEES].PERSON]: TABLES.PEOPLE,
    [FIELDS[TABLES.EMPLOYEES].COMPANY]: TABLES.COMPANIES
  },
  [TABLES.PERSON_ROLES]: {
    [FIELDS[TABLES.PERSON_ROLES].PERSON]: TABLES.PEOPLE,
    [FIELDS[TABLES.PERSON_ROLES].ROLE]: TABLES.ROLES
  },
  [TABLES.CONNECTIONS]: {
    [FIELDS[TABLES.CONNECTIONS].PERSON]: TABLES.PEOPLE,
    [FIELDS[TABLES.CONNECTIONS].FROM]: TABLES.PEOPLE,
    [FIELDS[TABLES.CONNECTIONS].ROLE]: TABLES.ROLES,
    [FIELDS[TABLES.CONNECTIONS].COMPANY]: TABLES.COMPANIES
  },
  [TABLES.ACCOUNTS]: {
    [FIELDS[TABLES.ACCOUNTS].PERSON]: TABLES.PEOPLE
  },
  [TABLES.CONVERSATIONS]: {
    [FIELDS[TABLES.CONVERSATIONS].PERSON]: TABLES.PEOPLE,
    [FIELDS[TABLES.CONVERSATIONS].RECIPIENT]: TABLES.PEOPLE
  },
  [TABLES.SURVEYS]: {
    [FIELDS[TABLES.SURVEYS].COMPANY]: TABLES.COMPANIES
  },
  [TABLES.SURVEY_SECTIONS]: {
    [FIELDS[TABLES.SURVEY_SECTIONS].SURVEY]: TABLES.SURVEYS
  },
  [TABLES.SURVEY_QUESTIONS]: {
    [FIELDS[TABLES.SURVEY_QUESTIONS].SURVEY_SECTION]: TABLES.SURVEY_SECTIONS
  },
  [TABLES.SURVEY_ANSWERS]: {
    [FIELDS[TABLES.SURVEY_ANSWERS].SURVEY_QUESTION]: TABLES.SURVEY_QUESTIONS,
    [FIELDS[TABLES.SURVEY_ANSWERS].PERSON]: TABLES.PEOPLE
  },
  [TABLES.SURVEY_ANSWER_CONNECTIONS]: {
    [FIELDS[TABLES.SURVEY_ANSWER_CONNECTIONS].SURVEY_ANSWER]: TABLES.SURVEY_ANSWERS,
    [FIELDS[TABLES.SURVEY_ANSWER_CONNECTIONS].CONNECTION]: TABLES.CONNECTIONS
  },
  [TABLES.JOB_TAGS]: {
    [FIELDS[TABLES.JOB_TAGS].JOB]: TABLES.JOBS,
    [FIELDS[TABLES.JOB_TAGS].TAG]: TABLES.TAGS
  },
  [TABLES.ROLE_TAGS]: {
    [FIELDS[TABLES.ROLE_TAGS].ROLE]: TABLES.ROLES,
    [FIELDS[TABLES.ROLE_TAGS].TAG]: TABLES.TAGS
  },
  [TABLES.SURVEY_QUESTION_TAGS]: {
    [FIELDS[TABLES.SURVEY_QUESTION_TAGS].SURVEY_QUESTION]: TABLES.SURVEY_QUESTIONS,
    [FIELDS[TABLES.SURVEY_QUESTION_TAGS].TAG]: TABLES.TAGS
  }
}
const SELF_RELATIONS = {
  [TABLES.REFERRALS]: [FIELDS[TABLES.REFERRALS].PARENT]
}
const MANY_RELATIONS = {
  [TABLES.SURVEY_ANSWERS]: {
    connections: {
      tableName: TABLES.SURVEY_ANSWER_CONNECTIONS,
      relations: RELATIONS[TABLES.SURVEY_ANSWER_CONNECTIONS],
      parent: {
        table: TABLES.SURVEY_ANSWERS,
        field: FIELDS[TABLES.SURVEY_ANSWER_CONNECTIONS].SURVEY_ANSWER
      },
      child: {
        table: TABLES.CONNECTIONS,
        field: FIELDS[TABLES.SURVEY_ANSWER_CONNECTIONS].CONNECTION
      }
    }
  }
}
const randomSlugGenerator = () => randomstring.generate({
  length: 7,
  capitalization: 'lowercase',
  readable: true
})
const fieldSlugGenerator = field => (data, addRandom) => {
  let random = ''
  if (addRandom) {
    random = `-${randomstring.generate({
      length: 3,
      capitalization: 'lowercase',
      readable: true
    })}`
  }
  return kebabCase(data[field]) + random
}
const SLUG_GENERATORS = {
  [TABLES.REFERRALS]: {
    generator: randomSlugGenerator
  },
  [TABLES.SURVEY_SECTIONS]: {
    generator: fieldSlugGenerator(FIELDS[TABLES.SURVEY_SECTIONS].TITLE),
    index: 'bySurveySlug'
  },
  [TABLES.SURVEY_QUESTIONS]: {
    generator: fieldSlugGenerator(FIELDS[TABLES.SURVEY_QUESTIONS].TITLE),
    index: 'bySectionSlug'
  }
}
const newToOldCollection = collection => NEW_TO_OLD_COLLECTION[collection] || collection
const fieldToProp = (table, prop) => (FIELD_TO_PROP[table] && FIELD_TO_PROP[table][prop]) || prop
const dateToTimestamp = date => {
  date = date || format(new Date())
  return date.split('.')[0].replace('T', ' ')
}

module.exports = {
  TABLE_ORDER,
  OLD_COLLECTIONS,
  NEW_COLLECTIONS,
  RELATIONS,
  SELF_RELATIONS,
  MANY_RELATIONS,
  SLUG_GENERATORS,
  newToOldCollection,
  fieldToProp,
  dateToTimestamp
}
