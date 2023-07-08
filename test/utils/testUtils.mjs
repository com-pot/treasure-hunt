import ApiAdapter from "./ApiAdapter.mjs";

import { loadEnv } from "vite"

let instances = {}

/**
 *
 * @param {object} opts
 * @param {string} opts.baseUrl
 * @param {string} [opts.authToken]
 * @param {string} [opts.devAuth]
 * @returns
 */
function createTestApi(opts) {
  const defaultHeaders = {
    Accept: 'application/json',
  }
  if (opts.authToken) {
    defaultHeaders.Authorization = 'Bearer ' + opts.authToken
  }

  const apiAdapter = new ApiAdapter({
    baseUrl: opts.baseUrl,
    defaultHeaders,
  })
  apiAdapter.middleware.req.push((config) => {
    if (!opts.devAuth) return
    if (!config.query) config.query = {}
    config.query['devAuth'] = opts.devAuth
  })

  return apiAdapter
}

export default {
  /**
   *
   * @param {true|string} [authToken]
   * @returns {ApiAdapter}
   */
  useApi(authToken) {
    const env = loadEnv("", process.cwd(), '')

    const baseUrl = env.TEST_API_BASE_URL
    if (!baseUrl) {
      throw new Error("Missing env variable TEST_API_BASE_URL")
    }
    const devAuth = env.BACKSTAGE_DEV_AUTH

    const opts = {
      baseUrl,
      devAuth,
    }
    if (authToken === true) {
      if (!instances.testApiAuth) {
        opts.authToken = env.TEST_API_AUTH_TOKEN
        instances.testApiAuth = createTestApi(opts)
      }

      return instances.testApiAuth
    }
    if (authToken) {
      opts.authToken = authToken
      return createTestApi(opts)
    }

    if (!instances.testApi) {
      instances.testApi = createTestApi(opts)
    }
    return instances.testApi
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
