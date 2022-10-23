import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { certToPEM } from '../utils'

const logger = createLogger('auth')

// ✅ TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = process.env.JWKS_URL
const jwksUrl = 'https://dev-58qur7euytmyacl8.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

export async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  if (jwt.header.alg !== 'RS256') {
    throw new Error('Invalid token!')
  }

  const signingKey = await getSigningKey(jwt.header.kid)

  const payload = verify(token, signingKey) as JwtPayload


  // ✅ TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return payload
}

async function getSigningKey(kid) {
  const keys = await getJwks()
  const signingKey = keys.find(key => key.kid === kid);

  if (!signingKey) {
    throw new Error(`Unable to find a signing key that matches '${kid}'`);
  }

  return signingKey.publicKey || signingKey.rsaPublicKey
}

async function getJwks() {
  const res = await Axios.get(jwksUrl)

  const keys = res.data.keys

  if (!keys || !keys.length) {
    throw new Error('The JWKS endpoint did not contain any keys');
  }

  const signingKeys = keys
    .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signature verification
                && key.kty === 'RSA' // We are only supporting RSA (RS256)
                && key.kid           // The `kid` must be present to be useful for later
                && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
    ).map(key => {
      return {
        kid: key.kid,
        nbf: key.nbf,
        publicKey: certToPEM(key.x5c[0])
      };
    });

  if (!signingKeys.length) {
    throw new Error('The JWKS endpoint did not contain any signature verification keys');
  }

  return signingKeys
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
