const { parse } = require('graphql')
const pluralize = require('pluralize')
const some = require('lodash/some')
const { merge } = require('@nudj/library')

module.exports = ({ customTypeDefs, customResolvers, transaction }) => {
  function getRelationsFor (typeResolvers, typeName, field, fieldName, isList) {
    switch (field.kind) {
      case 'FieldDefinition':
      case 'NonNullType':
        typeResolvers = getRelationsFor(
          typeResolvers,
          typeName,
          field.type,
          fieldName,
          isList
        )
        break
      case 'ListType':
        typeResolvers = getRelationsFor(
          typeResolvers,
          typeName,
          field.type,
          fieldName,
          true
        )
        break
      case 'NamedType':
        if (isCustomType(field.name.value)) {
          const targetName = getPluralisms(field.name.value)
          if (isList) {
            typeResolvers[fieldName.plural] = (parent, args, context) => {
              if (parent[fieldName.original]) {
                // full referential integrity usually denoting many->many relationship
                return transaction(
                  (store, params) => {
                    const { type, ids } = params
                    return store.readMany({ type, ids })
                  },
                  {
                    type: targetName.plural,
                    ids: parent[fieldName.original]
                  }
                )
              } else {
                // no full referential integrity usually denoting one->many relationship
                return transaction(
                  (store, params) => {
                    const { type, filters } = params
                    return store.readAll({ type, filters })
                  },
                  {
                    type: targetName.plural,
                    filters: {
                      [typeName.singular]: parent.id
                    }
                  }
                )
              }
            }
            typeResolvers[`${fieldName.singular}ById`] = (
              parent,
              args,
              context
            ) => {
              if (args.id) {
                return transaction(
                  (store, params) => {
                    const { type, filters } = params
                    return store.readOne({ type, filters })
                  },
                  {
                    type: targetName.plural,
                    filters: {
                      id: args.id,
                      [typeName.singular]: parent.id
                    }
                  }
                )
              } else {
                return null
              }
            }
            typeResolvers[`${fieldName.singular}ByFilters`] = (
              parent,
              args,
              context
            ) => {
              return transaction(
                (store, params) => {
                  const { type, filters } = params
                  return store.readOne({ type, filters })
                },
                {
                  type: targetName.plural,
                  filters: merge(args.filters, {
                    [typeName.singular]: parent.id
                  })
                }
              )
            }
            typeResolvers[`${fieldName.plural}ByFilters`] = (
              parent,
              args,
              context
            ) => {
              return transaction(
                (store, params) => {
                  const { type, filters } = params
                  return store.readAll({ type, filters })
                },
                {
                  type: targetName.plural,
                  filters: merge(args.filters, {
                    [typeName.singular]: parent.id
                  })
                }
              )
            }
          } else {
            typeResolvers[fieldName.singular] = (parent, args, context) => {
              if (parent[fieldName.singular] || parent[fieldName.original]) {
                return transaction(
                  (store, params) => {
                    const { type, id } = params
                    return store.readOne({ type, id })
                  },
                  {
                    type: targetName.plural,
                    id: parent[fieldName.singular] || parent[fieldName.original]
                  }
                )
              } else {
                return transaction(
                  (store, params) => {
                    const { type, filters } = params
                    return store.readOne({ type, filters })
                  },
                  {
                    type: targetName.plural,
                    filters: {
                      [typeName.singular]: parent.id
                    }
                  }
                )
              }
            }
          }
        }
        break
    }
    return typeResolvers
  }
  function getPluralisms (original) {
    return {
      original,
      singular: pluralize.singular(
        original[0].toLowerCase() + original.slice(1)
      ),
      plural: pluralize.plural(original[0].toLowerCase() + original.slice(1)),
      Singular: pluralize.singular(
        original[0].toUpperCase() + original.slice(1)
      ),
      Plural: pluralize.plural(original[0].toUpperCase() + original.slice(1))
    }
  }
  function isCustomType (value) {
    return tally.types.includes(value)
  }

  let parsedDefinitions = parse(customTypeDefs).definitions
  let tally = parsedDefinitions.reduce(
    (tally, definition) => {
      switch (definition.kind) {
        case 'ScalarTypeDefinition':
          tally.scalars.push(definition.name.value)
          break
        case 'EnumTypeDefinition':
          tally.enums.push(definition.name.value)
          break
        case 'ObjectTypeDefinition':
          if (!tally.root.includes(definition.name.value)) {
            tally.types.push(definition.name.value)
          }
          break
      }
      return tally
    },
    {
      root: ['Query', 'Mutation'],
      scalars: [],
      enums: [],
      types: []
    }
  )
  let resolvers = {
    Query: {},
    Mutation: {}
  }
  let schema = {
    scalars: [],
    enums: {},
    types: {
      Query: [],
      Mutation: []
    },
    inputs: {}
  }

  // main loop
  parsedDefinitions.forEach(definition => {
    const type = definition.name.value
    const typeName = getPluralisms(type)

    switch (definition.kind) {
      case 'ScalarTypeDefinition':
        schema.scalars.push(type)
        break
      case 'EnumTypeDefinition':
        schema.enums[type] = definition.values.map(value => value.name.value)
        break
      case 'ObjectTypeDefinition':
        // root resolver schemas
        schema.types.Query.push(`${typeName.singular}(id: ID): ${type}`)
        schema.types.Mutation.push(`${typeName.singular}(id: ID): ${type}`)
        schema.types.Query.push(
          `${typeName.singular}ByFilters(filters: ${type}FilterInput): ${type}`
        )
        schema.types.Mutation.push(
          `${typeName.singular}ByFilters(filters: ${type}FilterInput): ${type}`
        )
        schema.types.Query.push(
          `${typeName.plural}(filters: ${type}FilterInput): [${type}]`
        )
        schema.types.Mutation.push(
          `${typeName.plural}(filters: ${type}FilterInput): [${type}]`
        )
        schema.types.Mutation.push(`delete${type}(id: ID!): ${type}`)

        // custom type definitions and inputs
        let fieldStrings = {
          type: [],
          create: [],
          update: [],
          filter: []
        }
        definition.fields.forEach(field => {
          let typeConfig = {
            unique: some(
              field.directives,
              directive => directive.name.value === 'isUnique'
            )
          }
          let setting = field
          while (setting.type) {
            switch (setting.type.kind) {
              case 'ListType':
                typeConfig.list = true
                typeConfig.requiredList = typeConfig.required
                typeConfig.required = false
                break
              case 'NonNullType':
                typeConfig.required = true
                break
              case 'NamedType':
                typeConfig.name = setting.type.name.value
                typeConfig.string = setting.type.name.value
                break
            }
            setting = setting.type
          }
          if (typeConfig.required) {
            typeConfig.string = `${typeConfig.string}!`
          }
          if (typeConfig.list) {
            typeConfig.string = `[${typeConfig.string}]`
            if (typeConfig.requiredList) {
              typeConfig.string = `${typeConfig.string}!`
            }
          }
          fieldStrings.type.push(
            `${field.name.value}: ${typeConfig.string}${
              typeConfig.unique ? ' @isUnique' : ''
            }`
          )

          // add field to filter input schema
          if (!['id'].includes(field.name.value) && !typeConfig.list) {
            if (tally.types.includes(typeConfig.name)) {
              fieldStrings.filter.push(`${field.name.value}: ID`)
            } else {
              fieldStrings.filter.push(
                `${field.name.value}: ${typeConfig.name}`
              )
            }
          }

          // add field to update input schema
          if (!['id', 'created', 'modified'].includes(field.name.value)) {
            if (tally.types.includes(typeConfig.name)) {
              if (typeConfig.list) {
                fieldStrings.update.push(`${field.name.value}: [ID!]`)
              } else {
                fieldStrings.update.push(`${field.name.value}: ID`)
              }
            } else {
              fieldStrings.update.push(
                `${field.name.value}: ${typeConfig.name}`
              )
            }
          }

          // add [field]By[Id|Filters] to schema
          if (typeConfig.list && tally.types.includes(typeConfig.name)) {
            let fieldNamePluralisms = getPluralisms(field.name.value)
            fieldStrings.type.push(
              `${fieldNamePluralisms.singular}ById(id: ID): ${typeConfig.name}`
            )
            fieldStrings.type.push(
              `${fieldNamePluralisms.singular}ByFilters(filters: ${
                typeConfig.name
              }FilterInput): ${typeConfig.name}`
            )
            fieldStrings.type.push(
              `${fieldNamePluralisms.plural}ByFilters(filters: ${
                typeConfig.name
              }FilterInput): [${typeConfig.name}!]`
            )
          }
          if (
            !['id', 'created', 'modified'].includes(field.name.value) &&
            !typeConfig.list
          ) {
            if (tally.types.includes(typeConfig.name)) {
              fieldStrings.create.push(
                `${field.name.value}: ID${typeConfig.required ? '!' : ''}`
              )
            } else {
              fieldStrings.create.push(
                `${field.name.value}: ${typeConfig.string}`
              )
            }
          }
        })
        schema.types[type] = fieldStrings.type.concat('_depth: Int')
        schema.inputs[`${type}FilterInput`] = fieldStrings.filter
        if (fieldStrings.create.length) {
          schema.types.Mutation.push(
            `create${type}(input: ${type}CreateInput): ${type}`
          )
          schema.inputs[`${type}CreateInput`] = fieldStrings.create
          resolvers.Mutation[`create${typeName.original}`] = (
            obj,
            args,
            context
          ) => {
            return transaction(
              (store, params) => {
                const { type, data } = params
                return store.create({ type, data })
              },
              {
                type: typeName.plural,
                data: args.input
              }
            )
          }
        }
        if (fieldStrings.update.length) {
          schema.types.Mutation.push(
            `update${type}(id: ID!, input: ${type}UpdateInput): ${type}`
          )
          schema.inputs[`${type}UpdateInput`] = fieldStrings.update
          resolvers.Mutation[`update${typeName.original}`] = (
            obj,
            args,
            context
          ) => {
            return transaction(
              (store, params) => {
                const { type, id, data } = params
                return store.update({ type, id, data })
              },
              {
                type: typeName.plural,
                id: args.id,
                data: args.input
              }
            )
          }
        }

        // get one (by id)
        resolvers.Query[typeName.singular] = (obj, args, context) => {
          return args.id
            ? transaction(
                (store, params) => {
                  const { type, id } = params
                  return store.readOne({ type, id })
                },
              {
                type: typeName.plural,
                id: args.id
              }
              )
            : null
        }
        resolvers.Mutation[typeName.singular] =
          resolvers.Query[typeName.singular]

        // get one (by filters)
        resolvers.Query[`${typeName.singular}ByFilters`] = (
          obj,
          args,
          context
        ) => {
          return transaction(
            (store, params) => {
              const { type, filters } = params
              return store.readOne({ type, filters })
            },
            {
              type: typeName.plural,
              filters: args.filters
            }
          )
        }
        resolvers.Mutation[`${typeName.singular}ByFilters`] =
          resolvers.Query[`${typeName.singular}ByFilters`]

        // get all (filterable)
        resolvers.Query[typeName.plural] = (obj, args, context) => {
          return transaction(
            (store, params) => {
              const { type, filters } = params
              return store.readAll({ type, filters })
            },
            {
              type: typeName.plural,
              filters: args.filters
            }
          )
        }
        resolvers.Mutation[typeName.plural] = resolvers.Query[typeName.plural]

        // delete (by id)
        resolvers.Mutation[`delete${typeName.original}`] = (
          obj,
          args,
          context
        ) => {
          return transaction(
            (store, params) => {
              const { type, id } = params
              return store.delete({ type, id })
            },
            {
              type: typeName.plural,
              id: args.id
            }
          )
        }

        // custom type resolvers
        resolvers[type] = definition.fields.reduce(
          (typeResolvers, field) =>
            getRelationsFor(
              typeResolvers,
              typeName,
              field,
              getPluralisms(field.name.value)
            ),
          {}
        )
        break
    }
  })

  schema.types.Query.push(`user(id: ID!): Person`)
  schema.types.Mutation.push(`user(id: ID!): Person`)
  schema.types.Mutation.push(
    `setNotification(type: NotificationType! message: String!): Notification`
  )
  schema.types.Mutation.push(
    `storeSurveyAnswer(surveyQuestion: ID! person: ID! connections: [ID!]!): SurveyAnswer`
  )
  schema.types.Query.push(
    `setNotification(type: NotificationType! message: String!): Notification`
  )
  schema.types.Person.push(
    `searchConnections(query: String!, fields: [[String!]!]!): [Connection!]!`
  )
  schema.types.Person.push(
    `getOrCreateConnection(to: PersonCreateInput!, source: String!): Connection`
  )
  schema.types.Person.push(
    `getOrCreateConnections(to: [PersonCreateInput!]!, source: String!): [Connection]`
  )
  schema.types.Person.push(
    `getOrCreateFormerEmployer(formerEmployer: CompanyCreateInput!, source: String!): FormerEmployer`
  )
  schema.types.Person.push(
    `updateTaskByFilters(filters: PersonTaskFilterInput!, data: PersonTaskUpdateInput!): PersonTask`
  )

  schema.types.Hirer.push(`setOnboarded: HirerOnboardedEvent`)
  schema.types.Mutation.push(
    `updatePerson(id: ID!, data: PersonUpdateInput!): Person`
  )
  schema.types.Query.push(
    `fetchTemplate(type: String! keys: Data repo: String! tags: [String!]!): Data`
  )

  let typeDefs = ''

  // add scalars
  typeDefs += schema.scalars
    .map(
      type => `
    scalar ${type}
  `
    )
    .join('')

  // add enums
  typeDefs += Object.keys(schema.enums)
    .map(
      name => `
    enum ${name} {
      ${schema.enums[name].join(`
      `)}
    }
  `
    )
    .join('')

  // add types
  typeDefs += Object.keys(schema.types)
    .map(
      type => `
    type ${type} {
      ${schema.types[type].join(`
      `)}
    }
  `
    )
    .join('')

  // add inputs
  typeDefs += Object.keys(schema.inputs)
    .map(
      input => `
    input ${input} {
      ${schema.inputs[input].join(`
      `)}
    }
  `
    )
    .join('')

  // custom resolvers
  resolvers = merge(resolvers, customResolvers)

  return {
    typeDefs,
    resolvers
  }
}
