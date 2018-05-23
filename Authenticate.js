/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* global Utilities, base64EncodeSafe_, fetchObject_ */

/**
 * Auth token is formatted to {@link https://developers.google.com/identity/protocols/OAuth2ServiceAccount#authorizingrequests}
 *
 * @private
 */
function getAuthToken_ (email, key, authUrl) {
  const jwt = createJwt_(email, key, authUrl)

  var options = {
    'method': 'post',
    'payload': 'grant_type=' + decodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + jwt,
    'muteHttpExceptions': true
  }

  const responseObj = fetchObject_(authUrl, options)
  return responseObj['access_token']
}

/**
 * Creates the JSON Web Token for OAuth 2.0
 *
 * @private
 * @param email
 * @param key
 * @param authUrl
 * @returns {string} JWT to utilize
 */
function createJwt_ (email, key, authUrl) {
  const jwtHeader = {'alg': 'RS256', 'typ': 'JWT'}

  const now = new Date()
  const nowSeconds = now.getTime() / 1000

  now.setHours(now.getHours() + 1)
  const oneHourFromNowSeconds = now.getTime() / 1000

  const jwtClaim = {
    'iss': email,
    'scope': 'https://www.googleapis.com/auth/datastore',
    'aud': authUrl,
    'exp': oneHourFromNowSeconds,
    'iat': nowSeconds
  }

  const jwtHeaderBase64 = base64EncodeSafe_(JSON.stringify(jwtHeader))
  const jwtClaimBase64 = base64EncodeSafe_(JSON.stringify(jwtClaim))

  const signatureInput = jwtHeaderBase64 + '.' + jwtClaimBase64

  const signature = Utilities.computeRsaSha256Signature(signatureInput, key)
  const encodedSignature = base64EncodeSafe_(signature)

  return signatureInput + '.' + encodedSignature
}
