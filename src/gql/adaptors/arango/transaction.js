const axios = require('axios')
const semi = require('semi')
const logger = require('@nudj/library/lib/logger')
const get = require('lodash/get')

const store = require('./store-transaction')
const actionToCollectionLock = require('./action-to-collection-lock')
const actionToString = require('./action-to-string')

const authHash = Buffer.from(process.env.DB_USER + ':' + process.env.DB_PASS).toString('base64')
const baseURL = process.env.DB_API_URL
const request = (options = {}) => {
  return axios(Object.assign({
    url: `${baseURL}/transaction`,
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + authHash
    }
  }, options))
}

module.exports = (action, params) => {
  let actionString
  try {
    // semi does not accept raw functions so wrapping in parentheses
    actionString = `(${actionToString(store, action)})`
    // add semi colons
    actionString = semi.add(actionString)
    // remove newlines and multiple consecutive spaces
    actionString = actionString.replace(/\n/g, ' ').replace(/\s\s+/g, ' ')
    // strip parentheses and trailing semicolon
    actionString = actionString.slice(1, -2)
  } catch (error) {
    logger('error', error)
    throw error
  }

  return request({
    data: {
      collections: {
        write: actionToCollectionLock(action)
      },
      action: actionString,
      params
    }
  })
  .then(response => response.data.result)
  .catch(error => {
    const data = get(error, 'response.data')
    logger('error', data)
    throw data
  })
}
