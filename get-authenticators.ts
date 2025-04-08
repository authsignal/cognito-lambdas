import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "./authsignal";

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const claims = event.requestContext.authorizer.jwt.claims;

  const userId = claims.sub as string;

  const authenticators = await authsignal.getAuthenticators({ userId });

  return authenticators.map((a) => ({
    ...a,
    email: maskEmail(a.email),
    phoneNumber: maskPhoneNumber(a.phoneNumber),
  }));
};

function maskEmail(email?: string) {
  return email?.replace(/^(.)(.*)(.@.*)$/, (_, a, b, c) => a + b.replace(/./g, "*") + c);
}

function maskPhoneNumber(phoneNumber?: string) {
  return phoneNumber?.replace(/.(?=.{4})/g, "*");
}
