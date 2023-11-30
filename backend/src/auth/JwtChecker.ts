import { expressjwt, GetVerificationKey } from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';

export const checkJwt = expressjwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-qprsmox8bpmaln3b.us.auth0.com/.well-known/jwks.json`
  }) as GetVerificationKey,
  audience: 'https://dev-qprsmox8bpmaln3b.us.auth0.com/api/v2/',
  issuer: `https://dev-qprsmox8bpmaln3b.us.auth0.com/`,
  algorithms: ['RS256']
});