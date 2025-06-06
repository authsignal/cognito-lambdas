import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

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

  return event;
};
