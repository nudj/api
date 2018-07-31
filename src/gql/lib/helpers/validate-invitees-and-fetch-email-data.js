const uniqBy = require('lodash/uniqBy')
const hashGenerator = require('hash-generator')

const fetchPerson = require('./fetch-person')
const {
  sendInternalEmail,
  fromViaNudj
} = require('../mailer')

const validateInviteesAndFetchEmailData = async (company, args, context) => {
  const members = uniqBy(args.members, 'email')
  const emailAddresses = members.map(member => member.email)

  if (!emailAddresses.length) {
    throw new Error('No email addresses provided')
  }

  const {
    firstName,
    lastName,
    email: senderEmail
  } = await fetchPerson(context, context.userId)

  const senderName = firstName && lastName && `${firstName} ${lastName}`
  const from = senderName && fromViaNudj(senderName)
  const subject = senderName
    ? `Help ${senderName} and the rest of ${company.name} hire more great people using nudj`
    : `You've been invited to join nudj!`

  const jobs = await context.sql.readAll({
    type: 'jobs',
    filters: {
      company: company.id
    }
  })

  if (!company.hash) {
    company = await context.sql.update({
      type: 'companies',
      id: company.id,
      data: {
        hash: hashGenerator(128)
      }
    })
  }

  // ensure the people being invited are not already hirers at another company
  await Promise.all(emailAddresses.map(async email => {
    const person = await context.sql.readOne({
      type: 'people',
      filters: { email }
    })

    if (!person) return

    const hirer = await context.sql.readOne({
      type: 'hirers',
      filters: { person: person.id }
    })

    if (!hirer) return

    if (hirer.company !== company.id) {
      await sendInternalEmail({
        subject: 'Teammate invitation failed',
        html: `A hirer for ${company.name} attempted to add a teammate with the email address "${email}", but that email address is already related to a different company with id: "${hirer.company}"`
      })
      throw new Error(`User with email address "${email}" is already signed up with another company`)
    }
  }))

  return {
    from,
    subject,
    senderName,
    senderEmail,
    company,
    jobs,
    members,
    emailAddresses,
    hash: company.hash
  }
}

module.exports = validateInviteesAndFetchEmailData
