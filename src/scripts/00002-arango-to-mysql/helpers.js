const {
  TABLES,
  FIELDS
} = require('../../lib/sql')

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
  TABLES.VIEW_EVENTS,
  TABLES.SURVEYS,
  TABLES.SURVEY_SECTIONS,
  TABLES.SURVEY_QUESTIONS,
  TABLES.SURVEY_ANSWERS,
  TABLES.SURVEY_ANSWER_CONNECTIONS,
  TABLES.TAGS,
  TABLES.JOB_TAGS,
  TABLES.ROLE_TAGS,
  TABLES.SURVEY_QUESTION_TAGS
]
const TABLE_TO_COLLECTION = {
  [TABLES.VIEW_EVENTS]: 'events'
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
  [TABLES.VIEW_EVENTS]: {
    [FIELDS[TABLES.VIEW_EVENTS].JOB]: TABLES.JOBS
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
  [TABLES.ROLE_TAGS]: {
    [FIELDS[TABLES.ROLE_TAGS].ROLE]: TABLES.ROLES,
    [FIELDS[TABLES.ROLE_TAGS].TAG]: TABLES.TAGS
  }
}
const SELF_RELATIONS = {
  [TABLES.REFERRALS]: [FIELDS[TABLES.REFERRALS].PARENT]
}
const MANY_RELATIONS = {
  [TABLES.SURVEY_ANSWERS]: {
    'connections': {
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
const tableToCollection = table => TABLE_TO_COLLECTION[table] || table
const dateToTimestamp = date => date.replace('T', ' ').replace('Z', '')

module.exports = {
  TABLE_ORDER,
  RELATIONS,
  SELF_RELATIONS,
  MANY_RELATIONS,
  tableToCollection,
  dateToTimestamp
}
