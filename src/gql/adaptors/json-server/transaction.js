const store = require('./store')
const { AppError } = require('@nudj/library/errors')

const baseURL = process.env.DB_API_URL

module.exports = async (action, params) => {
  try {
    return await action(store({ baseURL }), params)
  } catch (error) {
    throw new AppError(error,
      `JsonServerTransaction`,
      baseURL,
      params
    )
  }
}
