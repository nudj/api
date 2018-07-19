module.exports = {
  typeDefs: `
    extend type Company {
      surveyOrDefault: Survey
    }
  `,
  resolvers: {
    Company: {
      surveyOrDefault: async (company, args, context) => {
        const edge = await context.sql.readOne({
          type: 'companySurveys',
          filters: {
            company: company.id
          }
        })
        if (edge) {
          return context.sql.readOne({
            type: 'surveys',
            id: edge.survey
          })
        } else {
          return context.sql.readOne({
            type: 'surveys',
            filters: {
              slug: 'default'
            }
          })
        }
      }
    }
  }
}
