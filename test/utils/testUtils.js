import ApiAdapter from "./ApiAdapter.js";


let instances = {}

function createTestApi(authToken) {
  const defaultHeaders = {
    Accept: 'application/json',
  }
  if (authToken) {
    defaultHeaders.Authorization = 'Bearer ' + authToken
  }

  const apiAdapter = new ApiAdapter({
    baseUrl: process.env.TEST_API_BASE_URL,
    defaultHeaders,
  })
  apiAdapter.middleware.req.push((/**RequestConfig*/ config) => {
    if (!config.query) {
      config.query = {}
    }
    config.query['devAuth'] = process.env.BACKSTAGE_DEV_AUTH
  })

  return apiAdapter
}

export default {
  /** @returns {ApiAdapter} */
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
   * @param {ApiAdapter} api
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
