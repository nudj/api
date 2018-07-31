const {
  TABLES,
  FIELDS,
  ENUMS,
  INDICES,
  COLLECTIONS,
  defaultConfig,
  emailType,
  urlType,
  relationType
} = require('../lib/sql')
const { nosql } = require('../lib/stores')

exports.up = async knex => {
  await knex.schema

    .createTable(TABLES.PEOPLE, t => {
      const {
        EMAIL,
        FIRST_NAME,
        LAST_NAME,
        URL,
        EMAIL_PREFERENCE
      } = FIELDS[TABLES.PEOPLE]

      defaultConfig(t, knex)
      emailType(EMAIL, t, knex).notNullable()
      t.string(FIRST_NAME).nullable()
      t.string(LAST_NAME).nullable()
      urlType(URL, t, knex).nullable()
      t.enum(EMAIL_PREFERENCE, ENUMS.ACCOUNT_TYPES.values).nullable()
      t.unique(EMAIL, INDICES[TABLES.PEOPLE][EMAIL].name)
    })

    .createTable(TABLES.COMPANIES, t => {
      const {
        NAME,
        SLUG,
        DESCRIPTION,
        LOCATION,
        LOGO,
        URL,
        CLIENT
      } = FIELDS[TABLES.COMPANIES]

      defaultConfig(t, knex)
      t.string(NAME).notNullable()
      t.string(SLUG).notNullable()
      t.text(DESCRIPTION).nullable()
      t.string(LOCATION).nullable()
      urlType(LOGO, t, knex).nullable()
      urlType(URL, t, knex).nullable()
      t.boolean(CLIENT).defaultTo(false).notNullable()
      t.unique(NAME, INDICES[TABLES.COMPANIES][NAME].name)
      t.unique(SLUG, INDICES[TABLES.COMPANIES][SLUG].name)
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
      t.string(BONUS).notNullable()
      t.enum(STATUS, ENUMS.JOB_STATUSES.values).defaultTo(ENUMS.JOB_STATUSES.DRAFT).notNullable()
      relationType(COMPANY, TABLES.COMPANIES, t, knex).notNullable()
      t.unique([COMPANY, SLUG], INDICES[TABLES.JOBS][[COMPANY, SLUG].join('')].name)
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
      t.unique(PERSON, INDICES[TABLES.HIRERS][PERSON].name)
    })

    .createTable(TABLES.REFERRALS, t => {
      const {
        SLUG,
        PERSON,
        JOB,
        PARENT
      } = FIELDS[TABLES.REFERRALS]

      defaultConfig(t, knex)
      t.string(SLUG, 10).notNullable()
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(JOB, TABLES.JOBS, t, knex).notNullable()
      relationType(PARENT, TABLES.REFERRALS, t, knex).nullable()
      t.unique(SLUG, INDICES[TABLES.REFERRALS][SLUG].name)
      t.unique([JOB, PERSON], INDICES[TABLES.REFERRALS][[JOB, PERSON].join('')].name)
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
      t.unique([JOB, PERSON], INDICES[TABLES.APPLICATIONS][[JOB, PERSON].join('')].name)
    })

    .createTable(TABLES.EMPLOYMENTS, t => {
      const {
        SOURCE,
        PERSON,
        COMPANY
      } = FIELDS[TABLES.EMPLOYMENTS]

      defaultConfig(t, knex)
      t.enum(SOURCE, ENUMS.DATA_SOURCES.values).notNullable()
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(COMPANY, TABLES.COMPANIES, t, knex).notNullable()
      t.unique([COMPANY, PERSON], INDICES[TABLES.EMPLOYMENTS][[COMPANY, PERSON].join('')].name)
    })

    .createTable(TABLES.CURRENT_EMPLOYMENTS, t => {
      const {
        EMPLOYMENT,
        PERSON
      } = FIELDS[TABLES.CURRENT_EMPLOYMENTS]

      defaultConfig(t, knex)
      relationType(EMPLOYMENT, TABLES.EMPLOYMENTS, t, knex).notNullable()
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      t.unique(PERSON, INDICES[TABLES.CURRENT_EMPLOYMENTS][PERSON].name)
    })

    .createTable(TABLES.EMPLOYEES, t => {
      const {
        PERSON,
        COMPANY
      } = FIELDS[TABLES.EMPLOYEES]

      defaultConfig(t, knex)
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(COMPANY, TABLES.COMPANIES, t, knex).notNullable()
      t.unique(PERSON, INDICES[TABLES.EMPLOYEES][PERSON].name)
    })

    .createTable(TABLES.ROLES, t => {
      const {
        NAME
      } = FIELDS[TABLES.ROLES]

      defaultConfig(t, knex)
      t.string(NAME).notNullable()
      t.unique(NAME, INDICES[TABLES.ROLES][NAME].name)
    })

    .createTable(TABLES.PERSON_ROLES, t => {
      const {
        PERSON,
        ROLE,
        SOURCE
      } = FIELDS[TABLES.PERSON_ROLES]

      defaultConfig(t, knex)
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(ROLE, TABLES.ROLES, t, knex).notNullable()
      t.enum(SOURCE, ENUMS.DATA_SOURCES.values).notNullable()
      t.unique([PERSON, ROLE], INDICES[TABLES.PERSON_ROLES][[PERSON, ROLE].join('')].name)
    })

    .createTable(TABLES.CURRENT_PERSON_ROLES, t => {
      const {
        PERSON,
        PERSON_ROLE
      } = FIELDS[TABLES.CURRENT_PERSON_ROLES]

      defaultConfig(t, knex)
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(PERSON_ROLE, TABLES.PERSON_ROLES, t, knex).notNullable()
      t.unique(PERSON, INDICES[TABLES.CURRENT_PERSON_ROLES][PERSON].name)
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
      t.unique([FROM, PERSON], INDICES[TABLES.CONNECTIONS][[FROM, PERSON].join('')].name)
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
      t.unique(EMAIL, INDICES[TABLES.ACCOUNTS][EMAIL].name)
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
      t.unique(THREAD_ID, INDICES[TABLES.CONVERSATIONS][THREAD_ID].name)
    })

    .createTable(TABLES.SURVEYS, t => {
      const {
        SLUG,
        INTRO_TITLE,
        INTRO_DESCRIPTION,
        OUTRO_TITLE,
        OUTRO_DESCRIPTION,
        SURVEY_SECTIONS
      } = FIELDS[TABLES.SURVEYS]

      defaultConfig(t, knex)
      t.string(SLUG).notNullable()
      t.string(INTRO_TITLE).notNullable()
      t.text(INTRO_DESCRIPTION).notNullable()
      t.string(OUTRO_TITLE).nullable()
      t.text(OUTRO_DESCRIPTION).nullable()
      t.json(SURVEY_SECTIONS).notNullable().comment('Array of surveySection ids denoting their order')
      t.unique(SLUG, INDICES[TABLES.SURVEYS][SLUG].name)
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
      t.string(SLUG).notNullable()
      t.string(TITLE).notNullable()
      t.text(DESCRIPTION).notNullable()
      t.json(SURVEY_QUESTIONS).notNullable().comment('Array of surveyQuestion ids denoting their order')
      relationType(SURVEY, TABLES.SURVEYS, t, knex).notNullable()
      t.unique([SLUG, SURVEY], INDICES[TABLES.SURVEY_SECTIONS][[SLUG, SURVEY].join('')].name)
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
      t.string(SLUG).notNullable()
      t.string(TITLE).notNullable()
      t.text(DESCRIPTION).notNullable()
      t.boolean(REQUIRED).defaultTo(false).notNullable()
      t.enum(TYPE, ENUMS.QUESTION_TYPES.values).notNullable()
      relationType(SURVEY_SECTION, TABLES.SURVEY_SECTIONS, t, knex).notNullable()
      t.unique([SLUG, SURVEY_SECTION], INDICES[TABLES.SURVEY_QUESTIONS][[SLUG, SURVEY_SECTION].join('')].name)
    })

    .createTable(TABLES.SURVEY_ANSWERS, t => {
      const {
        PERSON,
        SURVEY_QUESTION
      } = FIELDS[TABLES.SURVEY_ANSWERS]

      defaultConfig(t, knex)
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(SURVEY_QUESTION, TABLES.SURVEY_QUESTIONS, t, knex).notNullable()
      t.unique([PERSON, SURVEY_QUESTION], INDICES[TABLES.SURVEY_ANSWERS][[PERSON, SURVEY_QUESTION].join('')].name)
    })

    .createTable(TABLES.SURVEY_ANSWER_CONNECTIONS, t => {
      const {
        SURVEY_ANSWER,
        CONNECTION
      } = FIELDS[TABLES.SURVEY_ANSWER_CONNECTIONS]

      defaultConfig(t, knex)
      relationType(SURVEY_ANSWER, TABLES.SURVEY_ANSWERS, t, knex).notNullable()
      relationType(CONNECTION, TABLES.CONNECTIONS, t, knex).notNullable()
      t.unique([CONNECTION, SURVEY_ANSWER], INDICES[TABLES.SURVEY_ANSWER_CONNECTIONS][[CONNECTION, SURVEY_ANSWER].join('')].name)
    })

    .createTable(TABLES.COMPANY_SURVEYS, t => {
      const {
        COMPANY,
        SURVEY
      } = FIELDS[TABLES.COMPANY_SURVEYS]

      defaultConfig(t, knex)
      relationType(COMPANY, TABLES.COMPANIES, t, knex).notNullable()
      relationType(SURVEY, TABLES.SURVEYS, t, knex).notNullable()
      t.unique([COMPANY, SURVEY], INDICES[TABLES.COMPANY_SURVEYS][[COMPANY, SURVEY].join('')].name)
    })

    .createTable(TABLES.TAGS, t => {
      const {
        NAME,
        TYPE
      } = FIELDS[TABLES.TAGS]

      defaultConfig(t, knex)
      t.string(NAME).notNullable()
      t.enum(TYPE, ENUMS.TAG_TYPES.values).notNullable()
      t.unique([NAME, TYPE], INDICES[TABLES.TAGS][[NAME, TYPE].join('')].name)
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
      t.unique([JOB, TAG], INDICES[TABLES.JOB_TAGS][[JOB, TAG].join('')].name)
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
      t.unique([ROLE, TAG], INDICES[TABLES.ROLE_TAGS][[ROLE, TAG].join('')].name)
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
      t.unique([SURVEY_QUESTION, TAG], INDICES[TABLES.SURVEY_QUESTION_TAGS][[SURVEY_QUESTION, TAG].join('')].name)
    })

    .createTable(TABLES.RELATED_JOBS, t => {
      const {
        FROM,
        TO
      } = FIELDS[TABLES.RELATED_JOBS]

      defaultConfig(t, knex)
      relationType(FROM, TABLES.JOBS, t, knex).notNullable()
      relationType(TO, TABLES.JOBS, t, knex).notNullable()
      t.unique([FROM, TO], INDICES[TABLES.RELATED_JOBS][[FROM, TO].join('')].name)
    })

    .createTable(TABLES.ACCESS_REQUESTS, t => {
      const {
        PERSON,
        COMPANY
      } = FIELDS[TABLES.ACCESS_REQUESTS]

      defaultConfig(t, knex)
      relationType(PERSON, TABLES.PEOPLE, t, knex).notNullable()
      relationType(COMPANY, TABLES.COMPANIES, t, knex).notNullable()
      t.unique([COMPANY, PERSON], INDICES[TABLES.ACCESS_REQUESTS][[COMPANY, PERSON].join('')].name)
    })

  // create all required collections in the nosql store
  await Promise.all(Object.values(COLLECTIONS).map(async collectionName => {
    let collection
    try {
      collection = nosql.collection(collectionName)
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') throw error
    }
    return collection.truncate()
  }))
}

exports.down = async knex => {
  await knex.schema
    .dropTable(TABLES.ACCESS_REQUESTS)
    .dropTable(TABLES.RELATED_JOBS)
    .dropTable(TABLES.SURVEY_QUESTION_TAGS)
    .dropTable(TABLES.ROLE_TAGS)
    .dropTable(TABLES.JOB_TAGS)
    .dropTable(TABLES.TAGS)
    .dropTable(TABLES.SURVEY_ANSWER_CONNECTIONS)
    .dropTable(TABLES.SURVEY_ANSWERS)
    .dropTable(TABLES.SURVEY_QUESTIONS)
    .dropTable(TABLES.SURVEY_SECTIONS)
    .dropTable(TABLES.COMPANY_SURVEYS)
    .dropTable(TABLES.SURVEYS)
    .dropTable(TABLES.CONVERSATIONS)
    .dropTable(TABLES.ACCOUNTS)
    .dropTable(TABLES.CONNECTIONS)
    .dropTable(TABLES.CURRENT_PERSON_ROLES)
    .dropTable(TABLES.PERSON_ROLES)
    .dropTable(TABLES.ROLES)
    .dropTable(TABLES.EMPLOYEES)
    .dropTable(TABLES.CURRENT_EMPLOYMENTS)
    .dropTable(TABLES.EMPLOYMENTS)
    .dropTable(TABLES.APPLICATIONS)
    .dropTable(TABLES.REFERRALS)
    .dropTable(TABLES.HIRERS)
    .dropTable(TABLES.JOBS)
    .dropTable(TABLES.COMPANIES)
    .dropTable(TABLES.PEOPLE)

  // drop all collections in the nosql store
  const collections = await nosql.collections()
  return Promise.all(collections.map(async collection => {
    try {
      await collection.drop()
    } catch (error) {
      if (!error.message.startsWith('unknown collection')) {
        throw error
      }
    }
  }))
}
