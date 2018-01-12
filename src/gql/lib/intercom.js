const Intercom = require('intercom-client')
const format = require('date-fns/format')
const { logger } = require('@nudj/library')

const intercom = new Intercom.Client({
  token: process.env.INTERCOM_ACCESS_TOKEN
})

function userHasTag (user, name) {
  const tagsList = user.tags.tags || []
  return tagsList.find(tag => tag.name === name)
}

function getBody (response) {
  if (response.statusCode !== 200) {
    throw new Error(`Intercom gone done broke: ${response.status}`)
  }
  return response.body
}

function getFirstFromResult (result) {
  return result.contacts[0]
}

function fetchLeadBy (filter) {
  return intercom.leads
    .listBy(filter)
    .then(getBody)
    .then(getFirstFromResult)
}

function fetchUserBy (filter) {
  return intercom.users
    .listBy(filter)
    .then(getBody)
}

function createLead (data) {
  return intercom.leads
    .create(data)
    .then(getBody)
}

function createUser (data) {
  return intercom.users
    .create(data)
    .then(getBody)
}

function tagUser (user, tag) {
  return intercom.tags
    .tag({
      name: tag,
      users: [{
        id: user.id
      }]
    })
    .then(getBody)
    .then(() => user)
}

function logAndReturn (data, ...itemsToLog) {
  logger('info', ...itemsToLog)
  return data
}

function createUniqueLeadAndTag (data, tag) {
  logger('info', 'createUniqueLeadAndTag', data, tag)
  return fetchLeadBy({ email: data.email })
    .then((user) => user || createLead(data))
    .then((user) => tagUser(user, tag))
    .then((user) => logAndReturn(user, 'User created and tagged', data, tag))
    .catch((error) => logger('error', 'Intercom', 'createUniqueLeadAndTag', data, tag, error))
}

function createUniqueUserAndTag (data, tag) {
  logger('info', 'createUniqueUserAndTag', data, tag)
  return fetchUserBy({ email: data.email })
    .catch((error) => {
      logger('error', 'Intercom', 'fetchUserBy', data, tag, error)
      return null
    })
    .then((user) => user || createUser(data))
    .then((user) => userHasTag(user, tag) ? user : tagUser(user, tag))
    .then((user) => logAndReturn(user, 'User created and tagged', data, tag))
    .catch((error) => logger('error', 'Intercom', 'createUniqueUserAndTag', data, tag, error))
}

function convert (visitor, user) {
  return intercom.visitors
    .convert({
      visitor,
      user,
      type: 'user'
    })
}

function convertVisitorToUser (visitor, user) {
  logger('info', 'convertVisitorToUser', visitor, user)
  return convert(visitor, user)
    .then(() => logger('info', 'Visitor converted to user', visitor, user))
    .catch((error) => logger('error', 'Intercom', 'convertVisitorToUser', visitor, user, error))
}

function updateUser (patch) {
  logger('info', 'updateUser', patch)
  return intercom.users
    .update(patch)
    .then(() => logger('info', 'User updated', patch))
    .catch((error) => logger('error', 'Intercom', 'updateUser', patch, error))
}

const getTimestampInSeconds = () => format(new Date(), 'X')

function logEvent ({ event_name, email, metadata }) {
  logger('info', 'logEvent', event_name, email, metadata)
  return intercom.events.create({
    created_at: getTimestampInSeconds(),
    event_name,
    email,
    metadata
  })
  .catch((error) => logger('error', 'Intercom', 'logEvent', event_name, email, metadata, error))
}

module.exports = {
  createUniqueLeadAndTag,
  createUniqueUserAndTag,
  logEvent,
  convertVisitorToUser,
  updateUser
}
