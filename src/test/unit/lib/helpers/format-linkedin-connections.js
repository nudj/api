/* eslint-env mocha */
const { expect } = require('chai')
const formatLinkedinConnections = require('../../../../gql/lib/helpers/format-linkedin-connections')

const connectionsCsvAsJson = [{
  'Email Address': 'connectionOne@email.tld',
  'First Name': 'Tim',
  'Last Name': 'McNudjer',
  Position: 'Tim Robinson',
  Company: 'nudj'
}, {
  EmailAddress: 'connectionTwo@email.tld',
  FirstName: 'Nick',
  LastName: 'McNudjer',
  Position: 'CTO',
  Company: 'nudj'
}]

const formatted = [{
  email: 'connectionTwo@email.tld',
  firstName: 'Nick',
  lastName: 'McNudjer',
  title: 'CTO',
  company: 'nudj'
}, {
  email: 'connectionOne@email.tld',
  firstName: 'Tim',
  lastName: 'McNudjer',
  title: 'Tim Robinson',
  company: 'nudj'
}]

describe('formatLinkedinConnections', () => {
  it('returns an array of nudj people', () => {
    const output = formatLinkedinConnections(connectionsCsvAsJson)

    expect(output).to.deep.equal(formatted)
  })

  it('filters connections without an email address', () => {
    expect(
      formatLinkedinConnections([
        {
          'Email Address': ''
        },
        {
          'Email Address': 'example'
        }
      ]).length
    ).to.equal(1)
  })

  it('returns an alphabetically sorted list', () => {
    expect(
      formatLinkedinConnections([
        {
          'Email Address': 'b',
          'First Name': 'b'
        },
        {
          'Email Address': 'a',
          'First Name': 'a'
        }
      ])
    ).to.deep.equal([
      {
        email: 'a',
        firstName: 'a',
        lastName: '',
        title: '',
        company: ''
      },
      {
        email: 'b',
        firstName: 'b',
        lastName: '',
        title: '',
        company: ''
      }
    ])
  })
})
