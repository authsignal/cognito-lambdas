import {
  AdminUpdateUserAttributesCommand,
  AttributeType,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "../authsignal";
import { VerificationMethod } from "@authsignal/node";

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

// Verifies that a new authenticator has been successfully enrolled
// Sets the corresponding attributes (email or phone number) as verified in Cognito
export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const username = event.requestContext.authorizer.jwt.claims.username as string;

  const { token } = JSON.parse(event.body!);

  const { isValid } = await authsignal.validateChallenge({
    action: "addAuthenticator",
    userId: username,
    token,
  });

  if (!isValid) {
    throw new Error("Verification failed");
  }

  const authenticators = await authsignal.getAuthenticators({ userId: username });
  const emailAuthenticator = authenticators.find((a) => a.verificationMethod === VerificationMethod.EMAIL_OTP);
  const smsAuthenticator = authenticators.find((a) => a.verificationMethod === VerificationMethod.SMS);
  const email = emailAuthenticator?.email;
  const phoneNumber = smsAuthenticator?.phoneNumber;

  await updateCognitoAttributes({ username, email, phoneNumber });
};

interface CognitoAttributesInput {
  username: string;
  email?: string;
  phoneNumber?: string;
}

async function updateCognitoAttributes({ username, email, phoneNumber }: CognitoAttributesInput) {
  const attributes: AttributeType[] = [];

  if (email) {
    attributes.push({
      Name: "email",
      Value: email,
    });

    attributes.push({
      Name: "email_verified",
      Value: "true",
    });
  }

  if (phoneNumber) {
    attributes.push({
      Name: "phone_number",
      Value: phoneNumber,
    });

    attributes.push({
      Name: "phone_number_verified",
      Value: "true",
    });
  }

  if (attributes.length === 0) {
    return;
  }

  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: process.env.USER_POOL_ID!,
    Username: username,
    UserAttributes: attributes,
  });

  await cognitoIdentityProviderClient.send(command);
}
