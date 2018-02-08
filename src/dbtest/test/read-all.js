const {
  db,
  setupDatabase,
  truncateDatabase,
  expect
} = require('../lib')

describe('readAll', () => {
  beforeEach(async () => {
    await setupDatabase(db)
  })

  afterEach(async () => {
    await truncateDatabase(db)
  })

  it('HAS TO WORK', async () => {
    expect(true).to.be.true()
  })
})
