import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class KeycloakJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:9090';
    const realm = process.env.KEYCLOAK_REALM || 'orderly';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: `${keycloakUrl}/realms/${realm}`,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
      }),
    });
  }

  validate(payload: any) {
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.preferred_username,
      roles: payload.realm_access?.roles || [],
    };
  }
}
