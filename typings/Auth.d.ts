interface JwtHeader {
  alg: Algorithm;
  typ: AlgorithmFormat;
}

interface JwtClaim {
  iss: string;
  scope: string;
  aud: string;
  exp: number;
  iat: number;
}

interface TokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

declare type Byte = number;
type Algorithm = 'RS256';
type AlgorithmFormat = 'JWT';
