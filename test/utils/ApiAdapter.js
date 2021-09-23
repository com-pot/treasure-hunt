import fetch from "node-fetch";

export default class ApiAdapter {
  /**
   * @param {ApiAdapterConfig} config
   */
  constructor(config) {
    if (!config) {
      throw new Error("ApiAdapter config missing")
    }
    if (typeof config.baseUrl !== "string") {
      throw new Error("Invalid parameter config.baseUrl")
    }
    this._config = config
  }

  get(path, config) {
    return this.makeRequest('get', path, undefined, config)
  }
  post(path, data, config) {
    return this.makeRequest('post', path, data, config)
  }
  put(path, data, config) {
    return this.makeRequest('put', path, data, config)
  }
  patch(path, data, config) {
    return this.makeRequest('patch', path, data, config)
  }
  delete(path, config) {
    return this.makeRequest('delete', path, undefined, config)
  }
  get json() {
    if (!this._jsonShortcut) {
      this._jsonShortcut = {
        get: (path, config) => this.get(path, config).then(unwrapSuccessfulJson),
        post: (path, data, config) => this.post(path, data, config).then(unwrapSuccessfulJson),
        put: (path, data, config) => this.put(path, data, config).then(unwrapSuccessfulJson),
        patch: (path, data, config) => this.patch(path, data, config).then(unwrapSuccessfulJson),
        delete: (path, config) => this.delete(path, config).then(unwrapSuccessfulJson),
      }
    }
    return this._jsonShortcut
  }

  /**
   *
   * @param {'get'|'post'|'put'|'delete'|string} method
   * @param {string} path
   * @param {Object} [data]
   * @param {RequestConfig} [config]
   * @returns {Promise<Response>}
   */
  makeRequest (method, path, data, config) {
    const endpointUrl = new URL(this._config.baseUrl + path)
    if (config && config.query) {
      Object.keys(config.query).forEach((key) => endpointUrl.searchParams.append(key, config.query[key]))
    }
    const headers = Object.assign({}, this._config.defaultHeaders, config && config.headers)
    if (data && typeof data === "object") {
      headers['Content-Type'] = 'application/json'
    }
    if (config && config.auth) {
      headers["Authorization"] = 'Bearer ' + config.auth
    }

    return fetch(endpointUrl.toString(), {
      method,
      body: data ? JSON.stringify(data) : undefined,
      headers,
    })
  }
}

const unwrapSuccessfulJson = async (/**Response*/response) => {
  const text = await response.text()

  const contentType = response.headers.get('Content-Type') || ""
  if (!contentType.includes('application/json')) {
    const e = new Error(`Response of ${response.url} is of wrong Content-Type: ${contentType}, Status: ${response.status}\n   ${text}`)
    e.response = response
    e.responseBody = text
    throw e
  }

  const json = JSON.parse(text)
  if (response.status >= 400) {
    const e = new Error(`Request to ${response.url} failed with status=${response.status}\n  ${text}`)
    e.response = response
    e.responseBody = json
    throw e
  }

  return json
}

/**
 * @typedef {Object} RequestConfig
 *
 * @property {Record<string, (string|number)>} [query]
 * @property {Record<string, string>} [headers]
 * @property {string} [auth]
 */

/**
 * @typedef {Object} ApiAdapterConfig
 *
 * @property {string} baseUrl
 * @property {Record<string, string>} [defaultHeaders]
 */
