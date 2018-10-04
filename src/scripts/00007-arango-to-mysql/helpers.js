const format = require('date-fns/format')

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
  COMPANY_SURVEYS: TABLES.COMPANY_SURVEYS,
  SURVEY_SECTIONS: TABLES.SURVEY_SECTIONS,
  SURVEY_QUESTIONS: TABLES.SURVEY_QUESTIONS,
  SURVEY_ANSWERS: TABLES.SURVEY_ANSWERS,
  TAGS: TABLES.TAGS,
  JOB_TAGS: TABLES.JOB_TAGS,
  ROLE_TAGS: TABLES.ROLE_TAGS,
  SURVEY_QUESTION_TAGS: TABLES.SURVEY_QUESTION_TAGS,
  ACCESS_REQUESTS: TABLES.ACCESS_REQUESTS,
  ACCEPTED_ACCESS_REQUESTS: TABLES.ACCEPTED_ACCESS_REQUESTS,
  MESSAGE_EVENTS: 'messageEvents',
  EVENTS: 'events',
  INTROS: 'intros'
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
  TABLES.COMPANY_SURVEYS,
  TABLES.SURVEY_SECTIONS,
  TABLES.SURVEY_QUESTIONS,
  TABLES.SURVEY_ANSWERS,
  TABLES.TAGS,
  TABLES.JOB_TAGS,
  TABLES.ROLE_TAGS,
  TABLES.SURVEY_QUESTION_TAGS,
  TABLES.ACCESS_REQUESTS,
  TABLES.ACCEPTED_ACCESS_REQUESTS,
  TABLES.JOB_VIEW_EVENTS,
  TABLES.MESSAGE_EVENTS,
  TABLES.INTROS
]
const NEW_TABLES_TO_OLD_COLLECTIONS = {
  [TABLES.JOB_VIEW_EVENTS]: OLD_COLLECTIONS.EVENTS
}
const FIELD_TO_PATH = {
  [TABLES.ACCOUNTS]: {
    [FIELDS[TABLES.ACCOUNTS].EMAIL]: 'emailAddress'
  },
  [TABLES.JOBS]: {
    [FIELDS[TABLES.JOBS].TEMPLATE]: 'templateTags.0'
  },
  [TABLES.JOB_VIEW_EVENTS]: {
    [FIELDS[TABLES.JOB_VIEW_EVENTS].JOB]: 'entityId'
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
  [TABLES.COMPANY_SURVEYS]: {
    [FIELDS[TABLES.COMPANY_SURVEYS].COMPANY]: TABLES.COMPANIES,
    [FIELDS[TABLES.COMPANY_SURVEYS].SURVEY]: TABLES.SURVEYS
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
  },
  [TABLES.ACCESS_REQUESTS]: {
    [FIELDS[TABLES.ACCESS_REQUESTS].PERSON]: TABLES.PEOPLE,
    [FIELDS[TABLES.ACCESS_REQUESTS].COMPANY]: TABLES.COMPANIES
  },
  [TABLES.ACCEPTED_ACCESS_REQUESTS]: {
    [FIELDS[TABLES.ACCEPTED_ACCESS_REQUESTS].ACCESS_REQUEST]: TABLES.ACCESS_REQUESTS,
    [FIELDS[TABLES.ACCEPTED_ACCESS_REQUESTS].HIRER]: TABLES.HIRERS
  },
  [TABLES.JOB_VIEW_EVENTS]: {
    [FIELDS[TABLES.JOB_VIEW_EVENTS].JOB]: TABLES.JOBS
  },
  [TABLES.INTROS]: {
    [FIELDS[TABLES.INTROS].JOB]: TABLES.JOBS,
    [FIELDS[TABLES.INTROS].PERSON]: TABLES.PEOPLE,
    [FIELDS[TABLES.INTROS].CANDIDATE]: TABLES.PEOPLE
  }
}
const SELF_RELATIONS = {
  [TABLES.REFERRALS]: [FIELDS[TABLES.REFERRALS].PARENT]
}
const FROM_TO_RELATIONS = {
  [TABLES.JOBS]: {
    field: 'relatedJobs',
    edgeTable: TABLES.RELATED_JOBS
  }
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
const ORDER_CACHES = {
  [TABLES.SURVEYS]: {
    [FIELDS[TABLES.SURVEYS].SURVEY_SECTIONS]: TABLES.SURVEY_SECTIONS
  },
  [TABLES.SURVEY_SECTIONS]: {
    [FIELDS[TABLES.SURVEY_SECTIONS].SURVEY_QUESTIONS]: TABLES.SURVEY_QUESTIONS
  }
}
const newTableToOldCollection = table => NEW_TABLES_TO_OLD_COLLECTIONS[table] || table
const fieldToPath = (table, prop) => (FIELD_TO_PATH[table] && FIELD_TO_PATH[table][prop]) || prop
const dateToTimestamp = date => {
  date = date || format(new Date())
  return date.split('.')[0].replace('T', ' ')
}

module.exports = {
  TABLE_ORDER,
  OLD_COLLECTIONS,
  NEW_TABLES_TO_OLD_COLLECTIONS,
  RELATIONS,
  SELF_RELATIONS,
  FROM_TO_RELATIONS,
  MANY_RELATIONS,
  ORDER_CACHES,
  newTableToOldCollection,
  fieldToPath,
  dateToTimestamp
}
