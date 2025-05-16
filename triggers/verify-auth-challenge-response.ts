import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { authsignal } from "../lib/authsignal";
import { updateCognitoUserAttributes } from "../lib/cognito";

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  // Exit if the response is only to set the challenge parameters
  if (event.request.privateChallengeParameters.challenge === "PROVIDE_AUTH_PARAMETERS") {
    return event;
  }

  // For SMS and passkey this will be an Authsignal token
  // For Apple and Google sign-in it will be an ID token
  const token = event.request.challengeAnswer;

  const { isValid, verificationMethod } = await authsignal.validateChallenge({
    action: "cognitoAuth",
    userId: event.userName,
    token,
  });

  event.response.answerCorrect = isValid;

  if (isValid && verificationMethod === "SMS") {
    const phoneNumberVerified = event.request.userAttributes.phone_number_verified === "true";

    // Set the phone number as verified in Cognito if it is not already
    if (!phoneNumberVerified) {
      await updateCognitoUserAttributes({ username: event.userName, phoneNumberVerified: true });
    }
  }

  return event;
};
