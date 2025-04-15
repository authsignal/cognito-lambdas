import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "../authsignal";
import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

// Verifies that a new email authenticator has been successfully enrolled
// Sets the email as verified in Cognito
export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const claims = event.requestContext.authorizer.jwt.claims;

  const userId = claims.sub as string;
  const username = claims.username as string;

  const { email, token } = JSON.parse(event.body!);

  const { isValid } = await authsignal.validateChallenge({
    action: "addAuthenticator",
    userId,
    token,
  });

  if (!isValid) {
    throw new Error("Verification failed");
  }

  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: process.env.USER_POOL_ID!,
    Username: username,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "email_verified",
        Value: "true",
      },
    ],
  });

  await cognitoIdentityProviderClient.send(command);
};
