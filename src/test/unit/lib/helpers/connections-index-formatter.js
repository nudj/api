/* eslint-env mocha */
const chai = require('chai')
const flatten = require('lodash/flatten')

const { merge } = require('@nudj/library')

const connectionsIndexFormatter = require('../../../../gql/lib/helpers/connections-index-formatter')
const { values: tagTypes } = require('../../../../gql/schema/enums/tag-types')

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
    },
    {
      id: 'connection3',
      company: 'company2',
      firstName: 'Sam',
      lastName: 'Smaller',
      person: 'person3',
      role: 'role3',
      source: 'MANUAL'
    },
    {
      id: 'connection4',
      company: 'company3',
      firstName: 'Jack',
      lastName: 'Jackson',
      person: 'person4',
      role: 'role4',
      source: 'LINKEDIN'
    }
  ],
  people: {
    'person1': {
      email: 'penny@email.com'
    },
    'person2': {
      email: 'john@email.com'
    },
    'person3': {
      email: 'sam@email.com'
    },
    'person4': {
      email: 'jack@email.com'
    }
  },
  companies: {
    'company1': {
      name: 'TeachingBlok'
    },
    'company2': {
      name: 'Smaller & Sons'
    },
    'company3': {
      name: 'BigCorp'
    }
  },
  roles: {
    'role1': {
      name: 'Teacher'
    },
    'role2': {
      name: 'Agricultural Manager'
    },
    'role3': {
      name: 'Security Consultant'
    },
    'role4': {
      name: 'Lawyer'
    }
  },
  surveyAnswers: {
    'surveyAnswer1': {
      surveyQuestion: 'surveyQuestion1',
      connections: [ 'connection1', 'connection2' ]
    },
    'surveyAnswer2': {
      surveyQuestion: 'surveyQuestion2',
      connections: [ 'connection2', 'connection3', 'connection1' ]
    },
    'surveyAnswer3': {
      surveyQuestion: 'surveyQuestion3',
      connections: [ 'connection1', 'connection4' ]
    }
  },
  surveyQuestions: {
    'surveyQuestion1': {
      title: 'Who?',
      tags: [ 'entityTag1', 'entityTag4', 'entityTag2' ]
    },
    'surveyQuestion2': {
      title: 'Why?',
      tags: [ 'entityTag2', 'entityTag3', 'entityTag4' ]
    },
    'surveyQuestion3': {
      title: 'Why?',
      tags: [ 'entityTag1', 'entityTag5' ]
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
    },
    'entityTag5': {
      tagId: 'tag5'
    }
  },
  tags: {
    'tag1': {
      name: 'Winning',
      type: tagTypes.EXPERTISE
    },
    'tag2': {
      name: 'Education',
      type: tagTypes.EXPERTISE
    },
    'tag3': {
      name: 'Organisational Skills',
      type: tagTypes.EXPERTISE
    },
    'tag4': {
      name: 'Junior',
      type: tagTypes.SENIORITY
    },
    'tag5': {
      name: 'Manager',
      type: tagTypes.SENIORITY
    }
  }
}

describe('connectionsIndexFormatter', () => {
  it('should combine the data into an array of indexable objects', async () => {
    expect(connectionsIndexFormatter(dbData)).to.deep.equal([
      {
        email: 'penny@email.com',
        firstName: 'Penny',
        lastName: 'Winters',
        fullName: 'Penny Winters',
        experienceTags: [ 'Winning', 'Education', 'Organisational Skills' ],
        role: 'Teacher',
        company: 'TeachingBlok'
      },
      {
        email: 'john@email.com',
        firstName: 'John',
        lastName: 'Scott',
        fullName: 'John Scott',
        experienceTags: [ 'Winning', 'Education', 'Organisational Skills' ],
        role: 'Agricultural Manager',
        company: 'Smaller & Sons'
      },
      {
        company: 'Smaller & Sons',
        email: 'sam@email.com',
        experienceTags: [
          'Education',
          'Organisational Skills'
        ],
        firstName: 'Sam',
        lastName: 'Smaller',
        fullName: 'Sam Smaller',
        role: 'Security Consultant'
      },
      {
        company: 'BigCorp',
        email: 'jack@email.com',
        experienceTags: [
          'Winning'
        ],
        firstName: 'Jack',
        lastName: 'Jackson',
        fullName: 'Jack Jackson',
        role: 'Lawyer'
      }
    ])
  })

  it('should only store tags of type `EXPERTISE`', async () => {
    const results = connectionsIndexFormatter(dbData)
    const addedTags = results.map(result => result.experienceTags)
    expect(flatten(addedTags)).to.not.include('Junior')
    expect(flatten(addedTags)).to.not.include('Manager')
    expect(addedTags).to.deep.equal([
      [
        'Winning',
        'Education',
        'Organisational Skills'
      ],
      [
        'Winning',
        'Education',
        'Organisational Skills'
      ],
      [
        'Education',
        'Organisational Skills'
      ],
      [
        'Winning'
      ]
    ])
  })

  it('should give an empty array to connections without tags', async () => {
    const data = merge(dbData, { connections: [{
      id: 'connection99',
      company: 'company1',
      firstName: 'No',
      lastName: 'Taggerson',
      person: 'person1',
      role: 'role1',
      source: 'LINKEDIN'
    }]
    })
    const results = connectionsIndexFormatter(data)
    expect(results[0].experienceTags).to.deep.equal([])
  })
})
