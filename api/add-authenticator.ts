import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

interface RequestBody {
  phoneNumber?: string;
  email?: string;
}

// Generates an Authsignal token for enrolling a new authenticator via Client SDK
export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

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
