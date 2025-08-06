import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

interface RequestBody {
  deviceId: string;
}

// Generates an Authsignal token for a generic high-risk action
export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const { deviceId } = JSON.parse(event.body!) as RequestBody;

  // Track the step-up action to determine if a challenge is required
  const { state, token, url } = await authsignal.track({
    action: "stepUp",
    userId,
    attributes: {
      deviceId,
    },
  });

  return {
    state,
    token,
    url,
  };
};
