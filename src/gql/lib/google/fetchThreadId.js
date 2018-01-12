const { NotFound } = require('@nudj/library/errors')

module.exports = async (context, person, recipientEmail) => {
  return await context.transaction((store, params) => {
    const { recipientEmail, person } = params
    return store.readOne({
      type: 'people',
      filters: { email: recipientEmail }
    })
    .then(recipient => {
      if (!recipient) throw new Error('Recipient not found')
      return store.readOne({
        type: 'conversations',
        filters: { person: person.id, recipient: recipient.id }
      })
      .catch(error => {
        if (error.constructor !== NotFound) {
          throw error
        }
        return null
      })
    })
  }, { recipientEmail, person })
}
