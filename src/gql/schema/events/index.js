module.exports = {
  typeDefs: `
    type Event {
      id: ID!
      created: DateTime!
      modified: DateTime!
      eventType: EventType!,
      entityType: EventEntityType!,
      entityId: ID!,
      browserId: ID
    }
  `
}
