const {
  send,
  jobNotificationEmailBodyTemplate
} = require('../../lib/mailer')

module.exports = async (context, company, job) => {
  const allCompanyHirers = await context.sql.readAll({
    type: 'hirers',
    filters: {
      company: company.id,
      onboarded: true
    }
  })

  const teamMateHirers = allCompanyHirers.filter(hirer => hirer.person !== context.userId)

  if (!teamMateHirers.length) return

  const teamMatePeople = await context.sql.readMany({
    type: 'people',
    ids: teamMateHirers.map(hirer => hirer.person)
  })

  await Promise.all(teamMatePeople.map(person => send({
    from: 'hello@nudj.co',
    to: person.email,
    subject: 'New jobs on nudj!',
    html: jobNotificationEmailBodyTemplate({
      person,
      company,
      job
    })
  })))
}
