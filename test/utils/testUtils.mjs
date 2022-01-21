import ApiAdapter from "./ApiAdapter.mjs";


let instances = {}

/**
 *
 * @param {string} [authToken]
 * @returns
 */
function createTestApi(authToken) {
  const defaultHeaders = {
    Accept: 'application/json',
  }
  if (authToken) {
    defaultHeaders.Authorization = 'Bearer ' + authToken
  }

  const baseUrl = process.env.TEST_API_BASE_URL
  if (!baseUrl) {
    throw new Error("Missing variable TEST_API_BASE_URL")
  }

  const apiAdapter = new ApiAdapter({
    baseUrl,
    defaultHeaders,
  })
  apiAdapter.middleware.req.push((config) => {
    const devAuth = process.env.BACKSTAGE_DEV_AUTH
    if (!devAuth) {
      return
    }
    if (!config.query) {
      config.query = {}
    }
    config.query['devAuth'] = devAuth
  })

  return apiAdapter
}

export default {
  /**
   *
   * @param {true|string} [auth]
   * @returns {ApiAdapter}
   */
  useApi(auth) {
    if (auth === true) {
      return instances.testApiAuth || (instances.testApi = createTestApi(process.env.TEST_API_AUTH_TOKEN))
    }
    if (auth) {
      return createTestApi(auth)
    }

    return instances.testApi || (instances.testApi = createTestApi())
  },

  /**
   *
   * @param {ApiAdapter} api
   * @param {AuthCredentials} credentials
   * @returns
   */
  async useTestUser(api, credentials) {
    if (!credentials) {
      credentials = {
        login: 'test-boy-' + Date.now(),
        pass: 't3st',
      }
      await api.json.post('/auth/account', credentials)
    }

    const result = await api.json.post('/auth/auth-token', credentials)
    return Object.assign({}, result, credentials)
  },
}

/**
 * @typedef {object} AuthCredentials
 *
 * @property {string} login
 * @property {string} pass
 */
