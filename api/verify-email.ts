import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "../authsignal";

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
  const username = event.requestContext.authorizer.jwt.claims.username as string;

  const { email, token } = JSON.parse(event.body!);

  const { isValid } = await authsignal.validateChallenge({
    action: "addAuthenticator",
    userId: username,
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
