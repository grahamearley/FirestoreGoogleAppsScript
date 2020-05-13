/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* eslint quote-props: ["error", "always"] */

/**
 * Auth token is formatted to {@link https://developers.google.com/identity/protocols/OAuth2ServiceAccount#authorizingrequests}
 *
 * @private
 * @param email the database service account email address
 * @param key the database service account private key
 * @param authUrl the authorization url
 * @returns {string} the access token needed for making future requests
 */
function getAuthToken_ (email, key, authUrl) {
  const jwt = createJwt_(email, key, authUrl)

  var options = {
    'payload': 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt
  }
  const responseObj = new FirestoreRequest_(authUrl, null, options).post()
  return responseObj.access_token
}

/**
 * Creates the JSON Web Token for OAuth 2.0
 *
 * @private
 * @param email the database service account email address
 * @param key the database service account private key
 * @param authUrl the authorization url
 * @returns {string} JWT to utilize
 */
function createJwt_ (email, key, authUrl) {
  const jwtHeader = {
    'alg': 'RS256',
    'typ': 'JWT'
  }

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

  const jwtHeaderBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(jwtHeader))
  const jwtClaimBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(jwtClaim))

  const signatureInput = jwtHeaderBase64 + '.' + jwtClaimBase64

  const signature = Utilities.computeRsaSha256Signature(signatureInput, key)
  const encodedSignature = Utilities.base64EncodeWebSafe(signature)

  return signatureInput + '.' + encodedSignature
}
