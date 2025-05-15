import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "../lib/authsignal";
import { updateCognitoUserAttributes } from "../lib/cognito";

// Checks if the user has successfully enrolled an email or SMS authenticator using Authsignal
// Sets the email and/or phone number attributes as verified in Cognito accordingly
export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const username = event.requestContext.authorizer.jwt.claims.username as string;

  const authenticators = await authsignal.getAuthenticators({ userId: username });
  const emailAuthenticator = authenticators.find((a) => a.verificationMethod === "EMAIL_OTP");
  const smsAuthenticator = authenticators.find((a) => a.verificationMethod === "SMS");

  const userAttributes = {
    username,
    email: emailAuthenticator?.email,
    emailVerified: !!emailAuthenticator,
    phoneNumber: smsAuthenticator?.phoneNumber,
    phoneNumberVerified: !!smsAuthenticator,
  };

  await updateCognitoUserAttributes(userAttributes);
};
