import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

interface RequestBody {
  token: string;
}

// An example endpoint for a high-risk action requiring step-up authentication
export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;

  const { token } = JSON.parse(event.body!) as RequestBody;

  const { state } = await authsignal.validateChallenge({
    action: "stepUp",
    userId,
    token,
  });

  if (state === "CHALLENGE_SUCCEEDED" || state === "ALLOW") {
    // Proceed with creating payment...

    return {
      statusCode: 200,
    };
  } else {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Step-up authentication failed",
      }),
    };
  }
};
