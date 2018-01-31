const fetchPerson = async (context, personId) => {
  return await context.transaction((store, params) => {
    const { id } = params
    return store.readOne({
      type: 'people',
      id
    })
    .then(person => {
      if (!person) throw new Error('Person not found')
      return person
    })
  }, { id: personId })
}

module.exports = fetchPerson
