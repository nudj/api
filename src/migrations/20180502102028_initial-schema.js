const {
  TABLES,
  FIELDS,
  ENUMS,
  defaultConfig,
  emailType,
  urlType,
  relationType
} = require('../lib/sql')

exports.up = async knex => {
  await knex.schema

    .createTable(TABLES.PEOPLE, t => {
      const {
        EMAIL,
        FIRST_NAME,
        LAST_NAME,
        URL
      } = FIELDS[TABLES.PEOPLE]

      defaultConfig(t, knex)
      emailType(EMAIL, t, knex).notNullable()
      t.string(FIRST_NAME).nullable()
      t.string(LAST_NAME).nullable()
      urlType(URL, t, knex).nullable()
      t.unique(EMAIL, 'byEmail')
    })

    .createTable(TABLES.COMPANIES, t => {
      const {
        NAME,
        SLUG,
        CLIENT,
        ONBOARDED
      } = FIELDS[TABLES.COMPANIES]

      defaultConfig(t, knex)
      t.string(NAME).notNullable()
      t.string(SLUG).notNullable()
      t.boolean(CLIENT).defaultTo(false).notNullable()
      t.boolean(ONBOARDED).defaultTo(false).notNullable()
      t.unique(NAME, 'byName')
      t.unique(SLUG, 'bySlug')
    })

    .createTable(TABLES.JOBS, t => {
      const {
        TITLE,
        SLUG,
        URL,
        LOCATION,
        REMUNERATION,
        TEMPLATE,
        DESCRIPTION,
        CANDIDATE_DESCRIPTION,
        ROLE_DESCRIPTION,
        EXPERIENCE,
        REQUIREMENTS,
        BONUS,
        STATUS,
        COMPANY
      } = FIELDS[TABLES.JOBS]

      defaultConfig(t, knex)
      t.string(TITLE).notNullable()
      t.string(SLUG).notNullable()
      urlType(URL, t, knex).nullable()
      t.string(LOCATION).nullable()
      t.string(REMUNERATION).nullable()
      t.string(TEMPLATE).nullable()
      t.text(DESCRIPTION).nullable()
      t.text(CANDIDATE_DESCRIPTION).nullable()
      t.text(ROLE_DESCRIPTION).nullable()
      t.text(EXPERIENCE).nullable()
      t.text(REQUIREMENTS).nullable()
      t.integer(BONUS).notNullable()
      t.enum(STATUS, ENUMS.JOB_STATUSES.values).defaultTo(ENUMS.JOB_STATUSES.DRAFT).notNullable()
      relationType(COMPANY, TABLES.COMPANIES, t, knex).notNullable()
      t.unique([COMPANY, SLUG], 'byCompanySlug')
    })

    .createTable(TABLES.HIRERS, t => {
      const {
        ONBOARDED,
        TYPE,
        PERSON,
        COMPANY
      } = FIELDS[TABLES.HIRERS]

      defaultConfig(t, knex)
      t.boolean(ONBOARDED).defaultTo(false).notNullable()
      t.enum(TYPE, ENUMS.HIRER_TYPES.values).defaultTo(ENUMS.HIRER_TYPES.MEMBER).notNullable()
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(COMPANY, TABLES.COMPANIES, t, knex).notNullable()
      t.unique(PERSON, 'byPerson')
    })

    .createTable(TABLES.REFERRALS, t => {
      const {
        SLUG,
        PERSON,
        JOB,
        PARENT
      } = FIELDS[TABLES.REFERRALS]

      defaultConfig(t, knex)
      t.string(SLUG, 8).notNullable()
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(JOB, TABLES.JOBS, t, knex).notNullable()
      relationType(PARENT, TABLES.REFERRALS, t, knex).nullable()
      t.unique(SLUG, 'bySlug')
      t.unique([PERSON, JOB], 'byPersonJob')
    })

    .createTable(TABLES.APPLICATIONS, t => {
      const {
        PERSON,
        JOB,
        REFERRAL
      } = FIELDS[TABLES.APPLICATIONS]

      defaultConfig(t, knex)
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(JOB, TABLES.JOBS, t, knex).notNullable()
      relationType(REFERRAL, TABLES.REFERRALS, t, knex).nullable()
      t.unique([PERSON, JOB], 'byPersonJob')
    })

    .createTable(TABLES.EMPLOYMENTS, t => {
      const {
        CURRENT,
        SOURCE,
        PERSON,
        COMPANY
      } = FIELDS[TABLES.EMPLOYMENTS]

      defaultConfig(t, knex)
      t.boolean(CURRENT).defaultTo(false).notNullable()
      t.enum(SOURCE, ENUMS.DATA_SOURCES.values).notNullable()
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(COMPANY, TABLES.COMPANIES, t, knex).notNullable()
      t.unique([PERSON, COMPANY], 'byPersonCompany')
      t.unique([PERSON, CURRENT], 'byPersonCurrent')
    })

    .createTable(TABLES.EMPLOYEES, t => {
      const {
        PERSON,
        COMPANY
      } = FIELDS[TABLES.EMPLOYEES]

      defaultConfig(t, knex)
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(COMPANY, TABLES.COMPANIES, t, knex).notNullable()
      t.unique(PERSON, 'byPerson')
    })

    .createTable(TABLES.ROLES, t => {
      const {
        NAME
      } = FIELDS[TABLES.ROLES]

      defaultConfig(t, knex)
      t.string(NAME).notNullable()
      t.unique(NAME, 'byName')
    })

    .createTable(TABLES.PERSON_ROLES, t => {
      const {
        CURRENT,
        PERSON,
        ROLE
      } = FIELDS[TABLES.PERSON_ROLES]

      defaultConfig(t, knex)
      t.boolean(CURRENT).defaultTo(false).notNullable()
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(ROLE, TABLES.ROLES, t, knex).notNullable()
      t.unique([PERSON, ROLE], 'byPersonRole')
      t.unique([PERSON, CURRENT], 'byPersonCurrent')
    })

    .createTable(TABLES.CONNECTIONS, t => {
      const {
        FIRST_NAME,
        LAST_NAME,
        SOURCE,
        PERSON,
        FROM,
        ROLE,
        COMPANY
      } = FIELDS[TABLES.CONNECTIONS]

      defaultConfig(t, knex)
      t.string(FIRST_NAME).notNullable()
      t.string(LAST_NAME).notNullable()
      t.enum(SOURCE, ENUMS.DATA_SOURCES.values).defaultTo(ENUMS.DATA_SOURCES.LINKEDIN).notNullable()
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(FROM, TABLES.PEOPLE, t, knex).notNullable()
      relationType(ROLE, TABLES.ROLES, t, knex).nullable()
      relationType(COMPANY, TABLES.COMPANIES, t, knex).nullable()
      t.unique([PERSON, FROM], 'byPersonFrom')
    })

    .createTable(TABLES.ACCOUNTS, t => {
      const {
        EMAIL,
        EMAIL_ADDRESSES,
        DATA,
        TYPE,
        PERSON
      } = FIELDS[TABLES.ACCOUNTS]

      defaultConfig(t, knex)
      emailType(EMAIL, t, knex).notNullable()
      t.json(EMAIL_ADDRESSES).notNullable().comment('Array of all emails associated with account')
      t.json(DATA).notNullable().comment('Object of account authorisation secrets')
      t.enum(TYPE, ENUMS.ACCOUNT_TYPES.values).defaultTo(ENUMS.ACCOUNT_TYPES.GOOGLE).notNullable()
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      t.unique(EMAIL, 'byEmail')
    })

    .createTable(TABLES.CONVERSATIONS, t => {
      const {
        THREAD_ID,
        TYPE,
        PERSON,
        RECIPIENT
      } = FIELDS[TABLES.CONVERSATIONS]

      defaultConfig(t, knex)
      t.string(THREAD_ID).notNullable()
      t.enum(TYPE, ENUMS.ACCOUNT_TYPES.values).defaultTo(ENUMS.ACCOUNT_TYPES.GOOGLE).notNullable()
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(RECIPIENT, TABLES.PEOPLE, t, knex).notNullable()
      t.unique(THREAD_ID, 'byThreadId')
    })

    .createTable(TABLES.SURVEYS, t => {
      const {
        SLUG,
        INTRO_TITLE,
        INTRO_DESCRIPTION,
        OUTRO_TITLE,
        OUTRO_DESCRIPTION,
        SURVEY_SECTIONS,
        COMPANY
      } = FIELDS[TABLES.SURVEYS]

      defaultConfig(t, knex)
      t.string(SLUG).nullable()
      t.string(INTRO_TITLE).notNullable()
      t.text(INTRO_DESCRIPTION).notNullable()
      t.string(OUTRO_TITLE).nullable()
      t.text(OUTRO_DESCRIPTION).nullable()
      t.json(SURVEY_SECTIONS).notNullable().comment('Array of surveySection ids denoting their order')
      relationType(COMPANY, TABLES.COMPANIES, t, knex).notNullable()
      t.unique([COMPANY, SLUG], 'byCompanySlug')
    })

    .createTable(TABLES.SURVEY_SECTIONS, t => {
      const {
        SLUG,
        TITLE,
        DESCRIPTION,
        SURVEY_QUESTIONS,
        SURVEY
      } = FIELDS[TABLES.SURVEY_SECTIONS]

      defaultConfig(t, knex)
      t.string(SLUG).nullable()
      t.string(TITLE).notNullable()
      t.text(DESCRIPTION).notNullable()
      t.json(SURVEY_QUESTIONS).notNullable().comment('Array of surveyQuestion ids denoting their order')
      relationType(SURVEY, TABLES.SURVEYS, t, knex).notNullable()
      t.unique([SURVEY, SLUG], 'bySurveySlug')
    })

    .createTable(TABLES.SURVEY_QUESTIONS, t => {
      const {
        SLUG,
        TITLE,
        DESCRIPTION,
        REQUIRED,
        TYPE,
        SURVEY_SECTION
      } = FIELDS[TABLES.SURVEY_QUESTIONS]

      defaultConfig(t, knex)
      t.string(SLUG).nullable()
      t.string(TITLE).notNullable()
      t.text(DESCRIPTION).notNullable()
      t.boolean(REQUIRED).defaultTo(false).notNullable()
      t.enum(TYPE, ENUMS.QUESTION_TYPES.values).notNullable()
      relationType(SURVEY_SECTION, TABLES.SURVEY_SECTIONS, t, knex).notNullable()
      t.unique([SURVEY_SECTION, SLUG], 'bySectionSlug')
    })

    .createTable(TABLES.SURVEY_ANSWERS, t => {
      const {
        PERSON,
        SURVEY_QUESTION
      } = FIELDS[TABLES.SURVEY_ANSWERS]

      defaultConfig(t, knex)
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(SURVEY_QUESTION, TABLES.SURVEY_QUESTIONS, t, knex).notNullable()
      t.unique([PERSON, SURVEY_QUESTION], 'byPersonQuestion')
    })

    .createTable(TABLES.SURVEY_ANSWER_CONNECTIONS, t => {
      const {
        SURVEY_ANSWER,
        CONNECTION
      } = FIELDS[TABLES.SURVEY_ANSWER_CONNECTIONS]

      defaultConfig(t, knex)
      relationType(SURVEY_ANSWER, TABLES.SURVEY_ANSWERS, t, knex).notNullable()
      relationType(CONNECTION, TABLES.CONNECTIONS, t, knex).notNullable()
      t.unique([SURVEY_ANSWER, CONNECTION], 'byAnswerConnection')
    })

    .createTable(TABLES.TAGS, t => {
      const {
        NAME,
        TYPE
      } = FIELDS[TABLES.TAGS]

      defaultConfig(t, knex)
      t.string(NAME).notNullable()
      t.enum(TYPE, ENUMS.TAG_TYPES.values).notNullable()
      t.unique([NAME, TYPE], 'byNameType')
    })

    .createTable(TABLES.JOB_TAGS, t => {
      const {
        SOURCE,
        JOB,
        TAG
      } = FIELDS[TABLES.JOB_TAGS]

      defaultConfig(t, knex)
      t.enum(SOURCE, ENUMS.DATA_SOURCES.values).notNullable()
      relationType(JOB, TABLES.JOBS, t, knex).notNullable()
      relationType(TAG, TABLES.TAGS, t, knex).notNullable()
      t.unique([JOB, TAG], 'byJobTag')
    })

    .createTable(TABLES.ROLE_TAGS, t => {
      const {
        SOURCE,
        ROLE,
        TAG
      } = FIELDS[TABLES.ROLE_TAGS]

      defaultConfig(t, knex)
      t.enum(SOURCE, ENUMS.DATA_SOURCES.values).notNullable()
      relationType(ROLE, TABLES.ROLES, t, knex).notNullable()
      relationType(TAG, TABLES.TAGS, t, knex).notNullable()
      t.unique([ROLE, TAG], 'byRoleTag')
    })

    .createTable(TABLES.SURVEY_QUESTION_TAGS, t => {
      const {
        SOURCE,
        SURVEY_QUESTION,
        TAG
      } = FIELDS[TABLES.SURVEY_QUESTION_TAGS]

      defaultConfig(t, knex)
      t.enum(SOURCE, ENUMS.DATA_SOURCES.values).notNullable()
      relationType(SURVEY_QUESTION, TABLES.SURVEY_QUESTIONS, t, knex).notNullable()
      relationType(TAG, TABLES.TAGS, t, knex).notNullable()
      t.unique([SURVEY_QUESTION, TAG], 'byQuestionTag')
    })
}
exports.down = async knex => {
  await knex.schema
    .dropTable(TABLES.SURVEY_QUESTION_TAGS)
    .dropTable(TABLES.ROLE_TAGS)
    .dropTable(TABLES.JOB_TAGS)
    .dropTable(TABLES.TAGS)
    .dropTable(TABLES.SURVEY_ANSWER_CONNECTIONS)
    .dropTable(TABLES.SURVEY_ANSWERS)
    .dropTable(TABLES.SURVEY_QUESTIONS)
    .dropTable(TABLES.SURVEY_SECTIONS)
    .dropTable(TABLES.SURVEYS)
    .dropTable(TABLES.CONVERSATIONS)
    .dropTable(TABLES.ACCOUNTS)
    .dropTable(TABLES.CONNECTIONS)
    .dropTable(TABLES.PERSON_ROLES)
    .dropTable(TABLES.ROLES)
    .dropTable(TABLES.EMPLOYEES)
    .dropTable(TABLES.EMPLOYMENTS)
    .dropTable(TABLES.APPLICATIONS)
    .dropTable(TABLES.REFERRALS)
    .dropTable(TABLES.HIRERS)
    .dropTable(TABLES.JOBS)
    .dropTable(TABLES.COMPANIES)
    .dropTable(TABLES.PEOPLE)
}
