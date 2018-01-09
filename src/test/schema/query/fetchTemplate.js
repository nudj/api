/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

const server = nock('https://nudj-test.prismic.io')

const response = {
  refs:
  [ { id: 'master',
    ref: 'WiWjZycAAGre8W18',
    label: 'Master',
    isMasterRef: true } ],
  bookmarks: {},
  types:
  { 'dashboard-jobs': 'dashboardJobsTooltip',
    tooltip: 'tooltip',
    dialog: 'dialog',
    composemessage: 'composeMessage' },
  tags:
  [ 'jobsDashboard',
    'createMessage',
    'sendExternal',
    'selectLength',
    'selectStyle',
    'selectReferrers',
    'external',
    'notFirstTime',
    'selectChannel',
    'long',
    'professional',
    'survey',
    'sendMessage',
    'firstTime',
    'sendInternal',
    'taskList',
    'importContacts',
    'linkedIn',
    'hirerSurvey',
    'leaveSendExternalPage',
    'hirerSurveyPageLeave',
    'bff',
    'formal',
    'internal',
    'familiar',
    'short' ],
  forms:
  { everything:
  { method: 'GET',
    enctype: 'application/x-www-form-urlencoded',
    action: 'https://nudj-hirer.prismic.io/api/v1/documents/search',
    fields: [] } },
  oauth_initiate: 'https://nudj-hirer.prismic.io/auth',
  oauth_token: 'https://nudj-hirer.prismic.io/auth/token',
  version: 'c62e61d',
  license: 'All Rights Reserved',
  experiments: { draft: [], running: [] } }

describe('Query.fetchTemplate', () => {
  beforeEach(() => {
    server
      .get('/api')
      .reply(200, response)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should fetch a single template', async () => {
    const db = {}
    const operation = `
      query (
        $type: String!
        $repo: String!
        $tags: [String!]!
        $keys: Data
      ) {
        fetchTemplate (type: $type repo: $repo tags: $tags keys: $keys)
      }
    `
    const variables = {
      type: 'composemessage',
      repo: 'test',
      tags: ['external']
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        fetchTemplate: {
          subject: 'test'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      hirers: []
    }
    const operation = `
      query ($id: ID!) {
        hirer(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'hirer2'
    }

    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['hirer']
      }))
  })
})
