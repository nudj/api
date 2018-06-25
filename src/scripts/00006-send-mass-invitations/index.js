const { promisify } = require('util')
const { parse } = require('csv')
const path = require('path')
const fs = require('fs')

const { resolvers } = require('../../gql/schema/company/inviteMembers')
const { store } = require('../../gql/adaptors/arango')
const setupDataLoaderCache = require('../../gql/lib/setup-dataloader-cache')

const { inviteMembers } = resolvers.Company
const parseCsv = promisify(parse)
const readFile = promisify(fs.readFile)

const csvHeaderName = 'email'

async function fetchCompanyForPerson (context, person) {
  const hirer = await context.store.readOne({
    type: 'hirers',
    filters: { person }
  })

  let company
  if (hirer) {
    company = hirer && await context.store.readOne({
      type: 'companies',
      id: hirer.company
    })
  } else {
    throw new Error(`Person ${person} is not a hirer`)
  }

  if (company) {
    return company
  } else {
    throw new Error(`Company with id ${hirer.company} does not exist`)
  }
}

async function action ({ db, arg: userId }) {
  const context = {
    web: {
      protocol: 'https',
      hostname: process.env.WEB_HOSTNAME
    },
    userId,
    store: store({
      db,
      getDataLoader: setupDataLoaderCache(db, {})
    })
  }
  const csvData = await readFile(path.join(__dirname, 'team.csv'))
  const [ headers, ...rows ] = await parseCsv(csvData)
  const emailAddressIndex = headers.indexOf(csvHeaderName)
  const emailAddresses = rows.map(row => row[emailAddressIndex])

  const company = await fetchCompanyForPerson(context, userId)
  const args = {
    emailAddresses,
    awaitIntercom: true
  }

  await inviteMembers(company, args, context)
}

module.exports = action
