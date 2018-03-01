const generateHash = require('./generate-hash')

const generateConnectionImportIds = (connection, from) => {
  if (!connection.email) throw new Error('Invalid connection')
  if (!from) throw new Error('Connection relation missing')

  const { company, title, email } = connection

  return {
    companyId: company ? generateHash(company) : null,
    roleId: title ? generateHash(title) : null,
    personId: generateHash(email),
    connectionId: generateHash(`${email}.${from}`)
  }
}

module.exports = generateConnectionImportIds
