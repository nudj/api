const { parse } = require('graphql')
const pluralize = require('pluralize')
const some = require('lodash/some')
const { merge } = require('@nudj/library')

module.exports = ({
  customTypeDefs,
  customResolvers,
  store
}) => {
  function getRelationsFor (typeResolvers, typeName, field, fieldName, isList) {
    switch (field.kind) {
      case 'FieldDefinition':
      case 'NonNullType':
        typeResolvers = getRelationsFor(typeResolvers, typeName, field.type, fieldName, isList)
        break
      case 'ListType':
        typeResolvers = getRelationsFor(typeResolvers, typeName, field.type, fieldName, true)
        break
      case 'NamedType':
        if (isCustomType(field.name.value)) {
          const targetName = getPluralisms(field.name.value)
          if (isList) {
            typeResolvers[fieldName.plural] = (parent, args, context) => {
              if (parent[fieldName.original]) {
                // full referential integrity usually denoting many->many relationship
                return store.readMany({
                  type: targetName.plural,
                  ids: parent[fieldName.original]
                })
              } else {
                // no full referential integrity usually denoting one->many relationship
                return store.readAll({
                  type: targetName.plural,
                  filters: {
                    [`${typeName.singular}Id`]: parent.id
                  }
                })
              }
            }
            typeResolvers[`${fieldName.singular}ByFilter`] = (parent, args, context) => {
              return store.readOne({
                type: targetName.plural,
                filters: merge(args.filters, {
                  [`${typeName.singular}Id`]: parent.id
                })
              })
            }
            typeResolvers[`${fieldName.plural}ByFilter`] = (parent, args, context) => {
              return store.readAll({
                type: targetName.plural,
                filters: merge(args.filters, {
                  [`${typeName.singular}Id`]: parent.id
                })
              })
            }
          } else {
            typeResolvers[fieldName.singular] = (parent, args, context) => {
              if (parent[`${fieldName.singular}Id`] || parent[fieldName.original]) {
                return store.readOne({
                  type: targetName.plural,
                  id: parent[`${fieldName.singular}Id`] || parent[fieldName.original]
                })
              } else {
                return null
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
      singular: pluralize.singular(original[0].toLowerCase() + original.slice(1)),
      plural: pluralize.plural(original[0].toLowerCase() + original.slice(1))
    }
  }
  function isCustomType (value) {
    return tally.types.includes(value)
  }

  let parsedDefinitions = parse(customTypeDefs).definitions
  let tally = parsedDefinitions.reduce((tally, definition) => {
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
  }, {
    root: [ 'Query', 'Mutation' ],
    scalars: [],
    enums: [],
    types: []
  })
  let resolvers = {
    Query: {},
    Mutation: {}
  }
  let schema = {
    scalars: [],
    enums: {},
    types: {
      Query: ['referralDepth(id: ID!): Int'],
      Mutation: []
    },
    inputs: {}
  }

  // custom resolvers
  resolvers = merge(customResolvers, resolvers)

  // main loop
  parsedDefinitions.forEach((definition) => {
    const type = definition.name.value
    const typeName = getPluralisms(type)

    switch (definition.kind) {
      case 'ScalarTypeDefinition':
        // console.log('Scalar', type)
        schema.scalars.push(type)
        break
      case 'EnumTypeDefinition':
        // console.log('Enum', type)
        schema.enums[type] = definition.values.map(value => value.name.value)
        break
      case 'ObjectTypeDefinition':
        // console.log('Type', type)

        // root resolver schemas
        schema.types.Query.push(`${typeName.singular}(id: ID!): ${type}`)
        schema.types.Query.push(`${typeName.singular}ByFilters(filters: ${type}FilterInput): ${type}`)
        schema.types.Query.push(`${typeName.plural}(filters: ${type}FilterInput): [${type}]`)
        schema.types.Mutation.push(`delete${type}(id: ID!): ${type}`)

        // custom type definitions and inputs
        let fieldStrings = {
          type: [],
          create: [],
          update: [],
          filter: []
        }
        definition.fields.forEach((field) => {
          let typeConfig = {
            unique: some(field.directives, directive => directive.name.value === 'isUnique')
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
          fieldStrings.type.push(`${field.name.value}: ${typeConfig.string}${typeConfig.unique ? ' @isUnique' : ''}`)
          if (!['id'].includes(field.name.value) && !tally.types.includes(typeConfig.name) && !typeConfig.list) {
            fieldStrings.filter.push(`${field.name.value}: ${typeConfig.name}`)
          }
          if (typeConfig.list) {
            let fieldNamePluralisms = getPluralisms(field.name.value)
            fieldStrings.type.push(`${fieldNamePluralisms.singular}ByFilter: ${typeConfig.name}`)
            fieldStrings.type.push(`${fieldNamePluralisms.plural}ByFilter: [${typeConfig.name}!]`)
          }
          if (!['id', 'created', 'modified'].includes(field.name.value) && !typeConfig.list) {
            if (tally.types.includes(typeConfig.name)) {
              fieldStrings.create.push(`${field.name.value}: ID${typeConfig.required ? '!' : ''}`)
              fieldStrings.update.push(`${field.name.value}: ID`)
            } else {
              fieldStrings.create.push(`${field.name.value}: ${typeConfig.string}`)
              fieldStrings.update.push(`${field.name.value}: ${typeConfig.string}`)
            }
          }
        })
        schema.types[type] = fieldStrings.type.concat('_depth: Int')
        schema.inputs[`${type}FilterInput`] = fieldStrings.filter
        if (fieldStrings.create.length) {
          schema.types.Mutation.push(`create${type}(input: ${type}CreateInput): ${type}`)
          schema.inputs[`${type}CreateInput`] = fieldStrings.create
          resolvers.Mutation[`create${typeName.original}`] = (obj, args, context) => store.create({ type: typeName.plural, data: args.input })
        }
        if (fieldStrings.update.length) {
          schema.types.Mutation.push(`update${type}(id: ID!, input: ${type}UpdateInput): ${type}`)
          schema.inputs[`${type}UpdateInput`] = fieldStrings.update
          resolvers.Mutation[`update${typeName.original}`] = (obj, args, context) => store.update({ type: typeName.plural, id: args.id, data: args.input })
        }

        // get one (by id)
        resolvers.Query[typeName.singular] = (obj, args, context) => store.readOne({ type: typeName.plural, id: args.id })

        // get one (by filters)
        resolvers.Query[`${typeName.singular}ByFilters`] = (obj, args, context) => store.readOne({ type: typeName.plural, filters: args.filters })

        // get all (filterable)
        resolvers.Query[typeName.plural] = (obj, args, context) => store.readAll({ type: typeName.plural, filters: args.filters })

        // delete (by id)
        resolvers.Mutation[`delete${typeName.original}`] = (obj, args, context) => store.delete({ type: typeName.plural, id: args.id })

        // custom type resolvers
        resolvers[type] = definition.fields.reduce((typeResolvers, field) => getRelationsFor(typeResolvers, typeName, field, getPluralisms(field.name.value)), {
          _depth: (obj, args, context) => {
            let count = null
            function fetchItem (id) {
              return store.readOne({ type: typeName.plural, id }).then(item => {
                count = count === null ? 0 : count + 1
                if (item.parent) {
                  return fetchItem(item.parent)
                } else {
                  return count
                }
              })
            }
            return fetchItem(obj.id)
          }
        })
        break
    }
  })

  let typeDefs = ''

  // add scalars
  typeDefs += schema.scalars.map(type => `
    scalar ${type}
  `).join('')

  // add enums
  typeDefs += Object.keys(schema.enums).map(name => `
    enum ${name} {
      ${schema.enums[name].join(`
      `)}
    }
  `).join('')

  // add types
  typeDefs += Object.keys(schema.types).map(type => `
    type ${type} {
      ${schema.types[type].join(`
      `)}
    }
  `).join('')

  // add inputs
  typeDefs += Object.keys(schema.inputs).map(input => `
    input ${input} {
      ${schema.inputs[input].join(`
      `)}
    }
  `).join('')

  // console.log(typeDefs)
  // console.log(resolvers)

  return {
    typeDefs,
    resolvers
  }
}
