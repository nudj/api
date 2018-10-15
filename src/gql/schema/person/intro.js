const { values: hirerTypes } = require('../enums/hirer-types')

module.exports = {
  typeDefs: `
    extend type Person {
      intro (id: ID!): Intro
    }
  `,
  resolvers: {
    Person: {
      intro: async (person, args, context) => {
        const { id: introId } = args

        const intro = await context.sql.readOne({
          type: 'intros',
          id: introId
        })
        if (!intro) return null

        if (intro.person === person.id) return intro

        const [
          hirer,
          job
        ] = await Promise.all([
          await context.sql.readOne({
            type: 'hirers',
            filters: {
              person: person.id
            }
          }),
          await context.sql.readOne({
            type: 'jobs',
            id: intro.job
          })
        ])

        if (
          hirer &&
          hirer.type === hirerTypes.ADMIN &&
          hirer.company === job.company
        ) {
          return intro
        }

        return null
      }
    }
  }
}
