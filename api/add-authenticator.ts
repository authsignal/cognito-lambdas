import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

// Generates an Authsignal token for enrolling a new authenticator via Client SDK
// E.g. email OTP, SMS OTP, or passkey
export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const claims = event.requestContext.authorizer.jwt.claims;

  const userId = claims.username as string;

  const { token: authsignalToken } = await authsignal.track({
    userId,
    action: "addAuthenticator",
    attributes: {
      scope: "add:authenticators",
    },
  });

  return {
    authsignalToken,
  };
};
