import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { OAuth2Client } from "google-auth-library";
import { authsignal } from "../authsignal";
import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

const oauth2Client = new OAuth2Client();

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  // Exit if the response is only to set the challenge parameters
  if (event.request.privateChallengeParameters.challenge === "PROVIDE_AUTH_PARAMETERS") {
    return event;
  }

  const username = event.userName;
  const signInMethod = event.request.clientMetadata?.signInMethod;

  switch (signInMethod) {
    case "SMS": {
      const { isValid } = await authsignal.validateChallenge({
        action: "cognitoAuth",
        userId: username,
        token: event.request.challengeAnswer,
      });

      event.response.answerCorrect = isValid;

      const phoneNumber = event.request.userAttributes.phone_number;
      const phoneNumberVerified = event.request.userAttributes.phone_number_verified === "true";

      if (isValid && !phoneNumberVerified) {
        await setCognitoPhoneNumberVerified(username, phoneNumber);
      }

      return event;
    }

    case "PASSKEY": {
      const { isValid } = await authsignal.validateChallenge({
        action: "cognitoAuth",
        userId: username,
        token: event.request.challengeAnswer,
      });

      event.response.answerCorrect = isValid;

      return event;
    }

    case "GOOGLE": {
      const idToken = event.request.challengeAnswer;

      const ticket = await oauth2Client.verifyIdToken({ idToken });

      const payload = ticket.getPayload();

      const isEmailVerified = !!payload?.email && !!payload.email_verified;

      event.response.answerCorrect = isEmailVerified;

      return event;
    }

    default:
      throw new Error("Invalid sign-in method");
  }
};

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

async function setCognitoPhoneNumberVerified(username: string, phoneNumber: string) {
  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: process.env.USER_POOL_ID!,
    Username: username,
    UserAttributes: [
      {
        Name: "phone_number",
        Value: phoneNumber,
      },
      {
        Name: "phone_number_verified",
        Value: "true",
      },
    ],
  });

  await cognitoIdentityProviderClient.send(command);
}
