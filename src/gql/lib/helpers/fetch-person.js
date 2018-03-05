const fetchPerson = async (context, id) => {
  const person = await context.store.readOne({
    type: 'people',
    id
  })

  if (!person) throw new Error('Person not found')
  return person
}

module.exports = fetchPerson
