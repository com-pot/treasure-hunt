import ApiAdapter from "./ApiAdapter.js";


let instances = {}

function createTestApi(authToken) {
  const defaultHeaders = {
    Accept: 'application/json',
  }
  if (authToken) {
    defaultHeaders.Authorization = 'Bearer ' + authToken
  }

  return new ApiAdapter({
    baseUrl: process.env.TEST_API_BASE_URL,
    defaultHeaders,
  })
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
  }
}
