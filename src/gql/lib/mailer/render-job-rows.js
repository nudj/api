const dedent = require('dedent')
const { getJobUrl } = require('@nudj/library')

const renderJobsRows = (web, company, jobs) => jobs.map(job => {
  const jobUrl = getJobUrl({
    protocol: web.protocol,
    hostname: web.hostname,
    job: job.slug,
    company: company.slug
  })

  return dedent`
    <tr>
      <td style="width:75%"><a href="${jobUrl}">${job.title}</a></td>
      <td style="width:25%; text-align: left;">${job.bonus}</td>
    </tr>
  `
}).join('')

module.exports = renderJobsRows
