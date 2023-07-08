import fetch, {Response} from "node-fetch";

export default class ApiAdapter {
  /**
   * @param {AdapterConfig} config
   */
  constructor(config) {
    if (!config) {
      throw new Error("ApiAdapter config missing")
    }
    if (typeof config.baseUrl !== "string") {
      throw new Error("Invalid parameter config.baseUrl")
    }
    this._config = config
    this.middleware = {
      /** @type {RequestMiddleware[]} */
      req: []
    }
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
  /**
   * @returns {ApiAdapter}
   */
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
   * @param {HttpMethod} method
   * @param {string} path
   * @param {object} [data]
   * @param {RequestConfig} [config]
   * @returns
   */
  async makeRequest (method, path, data, config) {
    const opts = Object.assign({}, config)

    for (let cb of this.middleware.req) {
      await cb(opts)
    }

    const endpointUrl = new URL(this._config.baseUrl + path)
    if (opts.query) {
      Object.entries(opts.query).forEach(([key, value]) => endpointUrl.searchParams.append(key, '' + value))
    }
    const headers = Object.assign({}, this._config.defaultHeaders, opts.headers)
    if (data && typeof data === "object") {
      headers['Content-Type'] = 'application/json'
    }
    if (opts.auth) {
      headers["Authorization"] = 'Bearer ' + opts.auth
    }

    return fetch(endpointUrl.toString(), {
      method,
      body: data ? JSON.stringify(data) : undefined,
      headers,
    })
  }
}

/**
 *
 * @param {fetch.Response} response
 * @returns {Promise<T>}
 * @template T
 */
async function unwrapSuccessfulJson(response) {
  const text = await response.text()

  const contentType = response.headers.get('Content-Type') || ""
  if (!contentType.includes('application/json')) {
    throw new HttpError(`Response of ${response.url} is of wrong Content-Type: ${contentType}, Status: ${response.status}\n   ${text}`, response, text)
  }

  const json = JSON.parse(text)
  if (response.status >= 400) {
    throw new HttpError(`Request to ${response.url} failed with status=${response.status}\n  ${text}`, response, json)
  }

  return json
}

const HttpErrorResponses = new WeakMap()
class HttpError extends Error {
  /**
   *
   * @param {string} message
   * @param {fetch.Response} [response]
   * @param {object|string} responseBody
   */
  constructor(message, response, responseBody) {
    super(message)

    this.responseBody = responseBody
    HttpErrorResponses.set(this, response)
  }

  getResponse() {
    return HttpErrorResponses.get(this)
  }
}


/**
 * @typedef {object} RequestConfig
 *
 * @property {Record<string, (string|number)>} [query]
 * @property {Record<string, string>} [headers]
 * @property {string} [auth]
 */
/**
 * @typedef {object} AdapterConfig
 *
 * @property {string} baseUrl
 * @property {Record<string, string|string[]>} [defaultHeaders]
 */

// type JsonShortcut = {
//   get(path: string, config?: RequestConfig): any,
//   post(path: string, data?: object, config?: RequestConfig): any,
//   put(path: string, data?: object, config?: RequestConfig): any,
//   patch(path: string, data?: object, config?: RequestConfig): any,
//   delete(path: string, config?: RequestConfig): any,
// }
/**
 * @typedef {'get'|'post'|'put'|'delete'|string} HttpMethod
 */
/**
 * @typedef {function} RequestMiddleware
 *
 * @param {RequestConfig} config
 */
