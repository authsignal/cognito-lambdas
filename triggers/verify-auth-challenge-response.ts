import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { authsignal } from "../lib/authsignal";
import { updateCognitoUserAttributes } from "../lib/cognito";

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  // Exit if the response is only to set the challenge parameters
  if (event.request.privateChallengeParameters.challenge === "PROVIDE_AUTH_PARAMETERS") {
    return event;
  }

  // For SMS, email OTP, and passkey this will be an Authsignal token
  // For Apple and Google sign-in it will be an Apple or Google ID token
  const token = event.request.challengeAnswer;

  const { isValid, verificationMethod } = await authsignal.validateChallenge({
    action: "cognitoAuth",
    userId: event.userName,
    token,
  });

  event.response.answerCorrect = isValid;

  const phoneNumberVerified = event.request.userAttributes.phone_number_verified === "true";
  const emailVerified = event.request.userAttributes.email_verified === "true";

  // Set the phone number as verified in Cognito if it is not already
  if (isValid && verificationMethod === "SMS" && !phoneNumberVerified) {
    await updateCognitoUserAttributes({ username: event.userName, phoneNumberVerified: true });
  }

  // Set the email as verified in Cognito if it is not already
  if (isValid && verificationMethod === "EMAIL_OTP" && !emailVerified) {
    await updateCognitoUserAttributes({ username: event.userName, emailVerified: true });
  }

  return event;
};
