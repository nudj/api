/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { generateId } = require('../../../../gql/lib/hash')

describe('generateId', () => {
  describe('when of type `company`', () => {
    it('should generate a hash id', () => {
      const companies = [
        {
          name: 'Javascripters Anonymous'
        },
        {
          name: 'The Big Company Inc.'
        }
      ]
      const hash = generateId('company', companies[0])
      expect(hash).to.exist()
      expect(hash).to.be.a('string')
    })

    it('should always generate the hash based on input', () => {
      const companies = [
        {
          name: 'Javascripters Anonymous'
        },
        {
          name: 'The Big Company Inc.'
        }
      ]
      const hash = generateId('company', companies[0])
      const secondHash = generateId('company', companies[0])
      expect(hash).to.exist()
      expect(hash).to.be.a('string')
      expect(secondHash).to.exist()
      expect(secondHash).to.be.a('string')
      expect(secondHash).to.equal(hash)
    })

    it('should generate different values for different inputs', () => {
      const companies = [
        {
          name: 'Javascripters Anonymous'
        },
        {
          name: 'The Big Company Inc.'
        }
      ]
      const firstId = generateId('company', companies[0])
      const secondId = generateId('company', companies[1])
      expect(firstId).to.exist()
      expect(firstId).to.be.a('string')
      expect(secondId).to.exist()
      expect(secondId).to.be.a('string')
      expect(firstId).to.not.equal(secondId)
    })

    it('should throw error if passed invalid data', () => {
      const badData = {
        name: null
      }
      expect(() => generateId('company', badData)).to.throw('Invalid company')
    })
  })

  describe('when of type `role`', () => {
    it('should generate a hash id', () => {
      const roles = [
        {
          name: 'Diet Coke Machine Technician'
        },
        {
          name: 'Pun Inventor'
        }
      ]
      const hash = generateId('role', roles[0])
      expect(hash).to.exist()
      expect(hash).to.be.a('string')
    })

    it('should always generate the hash based on input', () => {
      const roles = [
        {
          name: 'Diet Coke Machine Technician'
        },
        {
          name: 'Pun Inventor'
        }
      ]
      const hash = generateId('role', roles[0])
      const secondHash = generateId('role', roles[0])
      expect(hash).to.exist()
      expect(hash).to.be.a('string')
      expect(secondHash).to.exist()
      expect(secondHash).to.be.a('string')
      expect(secondHash).to.equal(hash)
    })

    it('should generate different values for different inputs', () => {
      const roles = [
        {
          name: 'Diet Coke Machine Technician'
        },
        {
          name: 'Pun Inventor'
        }
      ]
      const firstId = generateId('role', roles[0])
      const secondId = generateId('role', roles[1])
      expect(firstId).to.exist()
      expect(firstId).to.be.a('string')
      expect(secondId).to.exist()
      expect(secondId).to.be.a('string')
      expect(firstId).to.not.equal(secondId)
    })

    it('should throw error if passed invalid data', () => {
      const badData = {
        name: null
      }
      expect(() => generateId('role', badData)).to.throw('Invalid role')
    })
  })

  describe('when of type `person`', () => {
    it('should generate a hash id', () => {
      const people = [
        {
          email: 'dave@funhouse.dave'
        },
        {
          email: 'phil@lemonlaw.co'
        }
      ]
      const hash = generateId('person', people[0])
      expect(hash).to.exist()
      expect(hash).to.be.a('string')
    })

    it('should always generate the hash based on input', () => {
      const people = [
        {
          email: 'dave@funhouse.dave'
        },
        {
          email: 'phil@lemonlaw.co'
        }
      ]
      const hash = generateId('person', people[0])
      const secondHash = generateId('person', people[0])
      expect(hash).to.exist()
      expect(hash).to.be.a('string')
      expect(secondHash).to.exist()
      expect(secondHash).to.be.a('string')
      expect(secondHash).to.equal(hash)
    })

    it('should generate different values for different inputs', () => {
      const people = [
        {
          email: 'dave@funhouse.dave'
        },
        {
          email: 'phil@lemonlaw.co'
        }
      ]
      const firstId = generateId('person', people[0])
      const secondId = generateId('person', people[1])
      expect(firstId).to.exist()
      expect(firstId).to.be.a('string')
      expect(secondId).to.exist()
      expect(secondId).to.be.a('string')
      expect(firstId).to.not.equal(secondId)
    })

    it('should throw error if passed invalid data', () => {
      const badData = {
        email: null
      }
      expect(() => generateId('person', badData)).to.throw('Invalid person')
    })
  })

  describe('when of type `connection`', () => {
    it('should generate a hash id', () => {
      const connections = [
        {
          from: 'person1',
          firstName: 'Steve',
          lastName: 'Garibaldi',
          email: 'steve@landofsteve.co.uk'
        },
        {
          from: 'person1',
          firstName: 'Jessie',
          lastName: 'White',
          email: 'jess@whitewall.io'
        }
      ]
      const hash = generateId('connection', connections[0])
      expect(hash).to.exist()
      expect(hash).to.be.a('string')
    })

    it('should always generate the hash based on input', () => {
      const connections = [
        {
          from: 'person1',
          firstName: 'Steve',
          lastName: 'Garibaldi',
          email: 'steve@landofsteve.co.uk'
        },
        {
          from: 'person1',
          firstName: 'Jessie',
          lastName: 'White',
          email: 'jess@whitewall.io'
        }
      ]
      const hash = generateId('connection', connections[0])
      const secondHash = generateId('connection', connections[0])
      expect(hash).to.exist()
      expect(hash).to.be.a('string')
      expect(secondHash).to.exist()
      expect(secondHash).to.be.a('string')
      expect(secondHash).to.equal(hash)
    })

    it('should generate different values for different inputs', () => {
      const connections = [
        {
          from: 'person1',
          firstName: 'Steve',
          lastName: 'Garibaldi',
          email: 'steve@landofsteve.co.uk'
        },
        {
          from: 'person1',
          firstName: 'Jessie',
          lastName: 'White',
          email: 'jess@whitewall.io'
        }
      ]
      const firstId = generateId('connection', connections[0])
      const secondId = generateId('connection', connections[1])
      expect(firstId).to.exist()
      expect(firstId).to.be.a('string')
      expect(secondId).to.exist()
      expect(secondId).to.be.a('string')
      expect(firstId).to.not.equal(secondId)
    })

    it('should generate different values for different `from` values', () => {
      const connections = [
        {
          from: 'person1',
          firstName: 'Steve',
          lastName: 'Garibaldi',
          email: 'steve@landofsteve.co.uk'
        },
        {
          from: 'person2',
          firstName: 'Steve',
          lastName: 'Garibaldi',
          email: 'steve@landofsteve.co.uk'
        }
      ]
      const firstId = generateId('connection', connections[0])
      const secondId = generateId('connection', connections[1])
      expect(firstId).to.exist()
      expect(firstId).to.be.a('string')
      expect(secondId).to.exist()
      expect(secondId).to.be.a('string')
      expect(firstId).to.not.equal(secondId)
    })

    it('should generate different values for different `email` values', () => {
      const connections = [
        {
          from: 'person1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'therealjohnsmith@email.co.uk'
        },
        {
          from: 'person1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'otherjohn@email.co.uk'
        }
      ]
      const firstId = generateId('connection', connections[0])
      const secondId = generateId('connection', connections[1])
      expect(firstId).to.exist()
      expect(firstId).to.be.a('string')
      expect(secondId).to.exist()
      expect(secondId).to.be.a('string')
      expect(firstId).to.not.equal(secondId)
    })

    it('should throw error if passed invalid data', () => {
      const badData = {
        name: null
      }
      expect(() => generateId('connection', badData)).to.throw('Invalid connection')
    })
  })
})
