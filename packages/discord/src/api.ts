import fetch from 'node-fetch'

export function createAPI(token = process.env.DISCORD_BOT_TOKEN) {
  const baseURL = 'https://discord.com/api/v8'
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
  }

  /**
   * @typedef {Object} RequestResponse
   * @property {Object} data
   * @property {Object} error
   * @property {number} status
   */

  /**
   * @typedef {Object.<string, any>} RequestPayload
   */

  /**
   * @type RequestHandler
   * @param {string} url
   * @param {RequestPayload} payload
   * @returns {RequestResponse}
   */
  async function request(url, payload) {
    if (payload) options.body = JSON.stringify(payload)
    const response = await fetch(`${baseURL}${url}`, options)

    let data
    let error
    let status = response.status

    if (response.ok) {
      data = await response.json()
    } else {
      error = await response.json()
    }

    return { data, error, status }
  }

  let api = {}

  /**
   * @name get
   * @param {string} url
   * @returns {Promise<RequestResponse>}
   */
  api.get = function (url) {
    return request(url)
  }

  /**
   * @name post
   * @param {string} url
   * @param {RequestPayload} payload
   * @returns {Promise<RequestResponse>}
   */
  api.post = function (url, payload) {
    options.method = 'POST'
    return request(url, payload)
  }

  /**
   * @name put
   * @param {string} url
   * @param {RequestPayload} payload
   * @returns {Promise<RequestResponse>}
   */
  api.put = function (url, payload) {
    options.method = 'PUT'
    return request(url, payload)
  }

  /**
   * @name delete
   * @param {string} url
   * @param {RequestPayload} payload
   * @returns {Promise<RequestResponse>}
   */
  api.delete = function (url, payload) {
    options.method = 'DELETE'
    return request(url, payload)
  }

  return api
}
