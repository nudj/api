const camelcase = require('lodash/camelCase')
const get = require('lodash/get')

const normaliseLinkedinContact = (contact) => {
  const normalisedContact = {}

  Object.keys(contact).forEach(key => {
    normalisedContact[camelcase(key)] = contact[key]
  })

  return normalisedContact
}

const formatLinkedinConnection = contact => {
  const normalisedContact = normaliseLinkedinContact(contact)

  return {
    email: get(normalisedContact, 'emailAddress', ''),
    firstName: get(normalisedContact, 'firstName', ''),
    lastName: get(normalisedContact, 'lastName', ''),
    title: get(normalisedContact, 'position', ''),
    company: get(normalisedContact, 'company', '')
  }
}

const formatLinkedinConnections = (contacts) => {
  return contacts
    .map(formatLinkedinConnection)
    .filter(person => person.email)
    .sort((a, b) => {
      if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) {
        return -1
      } else {
        return a.firstName.toLowerCase() > b.firstName.toLowerCase() ? 1 : 0
      }
    })
}

module.exports = formatLinkedinConnections
