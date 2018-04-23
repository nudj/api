const { generateId } = require('@nudj/library')
const { idTypes } = require('@nudj/library/lib/constants')

async function up ({ db, step }) {
  await step('Create `personRoles` collection', async () => {
    try {
      const collection = db.collection('personRoles')
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') {
        throw error
      }
    }
  })

  await step('Create `role` & `personRole` from `Person.title` field', async () => {
    const personRolesCollection = db.collection('personRoles')
    const rolesCollection = db.collection('roles')
    const peopleCollection = db.collection('people')
    const peopleCursor = await peopleCollection.all()
    const allPeople = await peopleCursor.all()

    await Promise.all(allPeople.map(async person => {
      if (!person.title) return

      const roleData = { name: person.title }

      let role
      try {
        role = await rolesCollection.firstExample(roleData)
      } catch (error) {
        if (error.message !== 'no match') throw error
      }

      if (!role) {
        const response = await rolesCollection.save({
          ...roleData,
          _key: generateId(idTypes.ROLE, roleData)
        }, { returnNew: true })
        role = response.new
      }

      await personRolesCollection.save({
        _key: generateId(),
        current: true,
        person: person._key,
        role: role._key
      })

      return peopleCollection.update(person, {
        title: null
      }, { keepNull: false })
    }))
  })
}

async function down ({ db, step }) {
  await step('Create `Person.title` field from `personRoles`', async () => {
    const personRolesCollection = db.collection('personRoles')
    const rolesCollection = db.collection('roles')
    const peopleCollection = db.collection('people')

    const personRolesCursor = await personRolesCollection.all()
    const allPersonRoles = await personRolesCursor.all()
    const personRoles = allPersonRoles.filter(personRole => personRole.current)

    await Promise.all(personRoles.map(async personRole => {
      const person = await peopleCollection.document(personRole.person)
      const role = await rolesCollection.document(personRole.role)

      return peopleCollection.update(person, {
        title: role.name
      })
    }))
  })

  await step('Remove `personRoles` collection', async () => {
    try {
      const collection = db.collection('personRoles')
      await collection.drop()
    } catch (error) {
      if (error.message !== 'unknown collection \'personRoles\'') {
        throw error
      }
    }
  })
}

module.exports = { up, down }
