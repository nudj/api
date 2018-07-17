const { handleErrors } = require('../../lib')
const updatePerson = require('../../lib/helpers/update-person')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updatePersonAndHirer(
        personId: ID!
        personData: PersonCreateInput!
        hirerData: HirerAdditionalInput
      ): Person
    }
  `,
  resolvers: {
    Mutation: {
      updatePersonAndHirer: handleErrors(async (root, args, context) => {
        const {
          personId,
          personData,
          hirerData
        } = args
        const person = await updatePerson(context, personId, personData)
        const hirer = await context.sql.readOne({
          type: 'hirers',
          filters: {
            person: person.id
          }
        })

        if (hirerData) {
          if (hirer) {
            await context.sql.update({
              type: 'hirers',
              id: hirer.id,
              data: hirerData
            })
          } else {
            await context.sql.create({
              type: 'hirers',
              data: {
                ...hirerData,
                person: person.id
              }
            })
          }
        } else {
          if (hirer) {
            await context.sql.delete({
              type: 'hirers',
              id: hirer.id
            })
          }
        }

        return person
      })
    }
  }
}
