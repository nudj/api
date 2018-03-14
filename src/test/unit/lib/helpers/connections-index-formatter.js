/* eslint-env mocha */
const chai = require('chai')
const uniqBy = require('lodash/uniqBy')
const connectionsIndexFormatter = require('../../../../gql/lib/helpers/connections-index-formatter')

const expect = chai.expect

const dbData = {
  connections: [
    {
      id: 'connection1',
      company: 'company1',
      firstName: 'Penny',
      lastName: 'Winters',
      person: 'person1',
      role: 'role1',
      source: 'LINKEDIN'
    },
    {
      id: 'connection2',
      company: 'company2',
      firstName: 'John',
      lastName: 'Scott',
      person: 'person2',
      role: 'role2',
      source: 'LINKEDIN'
    }
  ],
  people: {
    'person1': {
      email: 'penny@email.com'
    },
    'person2': {
      email: 'john@email.com'
    }
  },
  companies: {
    'company1': {
      name: 'TeachingBlok'
    },
    'company2': {
      name: 'Smaller & Sons'
    }
  },
  roles: {
    'role1': {
      name: 'Teacher'
    },
    'role2': {
      name: 'Agricultural Manager'
    }
  },
  surveyAnswers: {
    'surveyAnswer1': {
      surveyQuestion: 'surveyQuestion1',
      connections: [ 'connection1' ]
    },
    'surveyAnswer2': {
      surveyQuestion: 'surveyQuestion2',
      connections: [ 'connection2' ]
    }
  },
  surveyQuestions: {
    'surveyQuestion1': {
      title: 'Who?',
      tags: [ 'entityTag1', 'entityTag2' ]
    },
    'surveyQuestion2': {
      title: 'Why?',
      tags: [ 'entityTag2', 'entityTag3', 'entityTag4' ]
    }
  },
  entityTags: {
    'entityTag1': {
      tagId: 'tag1'
    },
    'entityTag2': {
      tagId: 'tag2'
    },
    'entityTag3': {
      tagId: 'tag3'
    },
    'entityTag4': {
      tagId: 'tag4'
    }
  },
  tags: {
    'tag1': {
      name: 'Winning',
      type: 'expertise'
    },
    'tag2': {
      name: 'Education',
      type: 'expertise'
    },
    'tag3': {
      name: 'Organisational Skills',
      type: 'expertise'
    },
    'tag4': {
      name: 'Ice Cream',
      type: 'random'
    }
  }
}

describe.only('connectionsIndexFormatter', () => {
  it('should format the data correctly', async () => {
    expect(connectionsIndexFormatter(dbData)).to.deep.equal([
      {
        email: 'penny@email.com',
        firstName: 'Penny',
        lastName: 'Winters',
        fullName: 'Penny Winters',
        experienceTags: [ 'Winning', 'Education' ],
        role: 'Teacher',
        company: 'TeachingBlok'
      },
      {
        email: 'john@email.com',
        firstName: 'John',
        lastName: 'Scott',
        fullName: 'John Scott',
        experienceTags: [ 'Education', 'Organisational Skills' ],
        role: 'Agricultural Manager',
        company: 'Smaller & Sons'
      }
    ])
  })
})
