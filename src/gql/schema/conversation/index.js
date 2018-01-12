module.exports = {
  typeDefs: `
    type Conversation {
      id: ID!
      created: DateTime!
      modified: DateTime!
      type: EmailPreference!
    }

    input ConversationFilterInput {
      id: ID
      person: ID
      recipient: ID
    }
  `
}
