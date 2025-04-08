import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "./authsignal";

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const claims = event.requestContext.authorizer.jwt.claims;

  const userId = claims.sub as string;

  const userAuthenticatorId = event.pathParameters?.authenticator_id;

  if (!userAuthenticatorId) {
    throw new Error("'userAuthenticatorId' is required");
  }

  await authsignal.deleteAuthenticator({ userId, userAuthenticatorId });
};
