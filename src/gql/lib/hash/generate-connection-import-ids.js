const generateId = require('./generate-id')
const { idTypes } = require('./constants')

const generateConnectionImportIds = (connection, from) => {
  if (!connection.email) throw new Error('Invalid connection')
  if (!from) throw new Error('Connection relation missing')

  const { company, title, email } = connection

  return {
    companyId: company ? generateId(idTypes.COMPANY, { name: company }) : null,
    roleId: title ? generateId(idTypes.ROLE, { name: title }) : null,
    personId: generateId(idTypes.PERSON, { email }),
    connectionId: generateId(idTypes.CONNECTION, { email, from })
  }
}

module.exports = generateConnectionImportIds
