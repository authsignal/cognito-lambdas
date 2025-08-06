import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

// Generates an Authsignal token for enrolling a new authenticator via Client SDK
export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const { token } = await authsignal.track({
    action: "addAuthenticator",
    userId,
    attributes: {
      scope: "add:authenticators",
    },
  });

  return {
    token,
  };
};
