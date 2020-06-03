/**
 * Auth token is formatted to {@link https://developers.google.com/identity/protocols/oauth2/service-account#authorizingrequests}
 *
 * @private
 * @param email the database service account email address
 * @param key the database service account private key
 * @param authUrl the authorization url
 * @returns {string} the access token needed for making future requests
 */
class Auth {
  email: string;
  key: string;
  authUrl: string;
  scope: string;
  jwtHeaderBase64_: string;

  constructor(email: string, key: string) {
    this.email = email;
    this.key = key;

    // TODO: Fix below variables to be static private when V8 allows for it.
    // @see {@link https://issuetracker.google.com/issues/150896358 Google Issue Tracker}
    this.authUrl = 'https://oauth2.googleapis.com/token';
    this.scope = 'https://www.googleapis.com/auth/datastore';
    this.jwtHeaderBase64_ = Utilities.base64EncodeWebSafe(JSON.stringify(this.jwtHeader_));
  }

  /**
   * Fetch the access token
   *
   * @returns {string} The generated access token string
   */
  get accessToken(): string {
    const request = new Request(this.authUrl, '', this.options_).post<TokenResponse>();
    return request.access_token;
  }

  /**
   * Creates the JSON Web Token for OAuth 2.0
   *
   * @returns {string} JWT to utilize
   */
  get createJwt_(): string {
    const jwtClaimBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(this.jwtPayload_));
    const signatureInput = `${this.jwtHeaderBase64_}.${jwtClaimBase64}`;
    const signature: number[] = Utilities.computeRsaSha256Signature(signatureInput, this.key);
    return `${signatureInput}.${Utilities.base64EncodeWebSafe(signature)}`;
  }

  get jwtPayload_(): JwtClaim {
    const seconds = ~~(new Date().getTime() / 1000);
    return {
      iss: this.email,
      scope: this.scope,
      aud: this.authUrl,
      exp: seconds + 3600, // Expiry set to 1 hour (maximum)
      iat: seconds,
    };
  }

  get jwtHeader_(): JwtHeader {
    return {
      alg: 'RS256',
      typ: 'JWT',
    };
  }

  get options_(): RequestOptions {
    const payload = {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: this.createJwt_,
    };
    return { payload: Util_.parameterize(payload, false) };
  }
}
