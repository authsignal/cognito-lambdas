import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { authsignal } from "../lib/authsignal";
import { setCognitoEmailVerified } from "../lib/cognito";

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  // For SMS, email OTP, and passkey this will be an Authsignal token
  // For Apple and Google sign-in it will be an Apple or Google ID token
  const token = event.request.challengeAnswer;

  const userId = event.userName;

  const { isValid } = await authsignal.validateChallenge({
    action: "cognitoAuth",
    userId,
    token,
  });

  event.response.answerCorrect = isValid;

  const { email, emailVerified, phoneNumberVerified } = await authsignal.getUser({ userId });

  // Ensure that both email and phone number are verified
  if (!email || !emailVerified || !phoneNumberVerified) {
    throw new Error("Both email and phone number must be verified.");
  }

  if (event.request.userAttributes.email_verified !== "true") {
    await setCognitoEmailVerified({ username: event.userName, email });
  }

  return event;
};
