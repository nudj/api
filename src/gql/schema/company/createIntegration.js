const fetchIntegrationHelper = require('../../lib/fetch-integration-helper')
const { values: jobStatusTypes } = require('../enums/job-status-types')

module.exports = {
  typeDefs: `
    extend type Company {
      createIntegration(type: CompanyIntegrationType!, data: Data!): CompanyIntegration
    }
  `,
  resolvers: {
    Company: {
      createIntegration: async (company, args, context) => {
        const { data, type } = args
        const integrationHelper = fetchIntegrationHelper({ type, data })

        const existingIntegration = await context.sql.readOne({
          type: 'companyIntegrations',
          filters: {
            company: company.id
          }
        })

        if (existingIntegration) {
          throw new Error(`Company already has an integration of type "${existingIntegration.type}"`)
        }

        // Verify credentials
        await integrationHelper.verify()

        const [ integration, companyJobs ] = await Promise.all([
          context.sql.create({
            type: 'companyIntegrations',
            data: {
              company: company.id,
              type,
              data
            }
          }),
          context.sql.readAll({
            type: 'jobs',
            filters: { company: company.id }
          })
        ])

        // Set all jobs currently on nudj to `BACKUP` state
        await Promise.all(companyJobs.map(job => context.sql.update({
          type: 'jobs',
          id: job.id,
          data: { status: jobStatusTypes.BACKUP }
        })))

        // Sync integration
        await integrationHelper.sync(context)

        await context.sql.update({
          type: 'companies',
          id: company.id,
          data: {
            ats: type
          }
        })

        return integration
      }
    }
  }
}
