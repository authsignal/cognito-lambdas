import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;

  if (event.request.privateChallengeParameters?.isPasswordlessLogin === "true") {
    // Handle validation for passwordless login via passkey
    const { state } = await authsignal.validateChallenge({
      action: "passkeySignIn",
      userId,
      token: event.request.challengeAnswer,
    });

    event.response.answerCorrect = state === "CHALLENGE_SUCCEEDED";
  } else {
    // Handle validation for MFA after username and password
    // In this case the action state may be ALLOW if the device is trusted
    const { state } = await authsignal.validateChallenge({
      action: "mfa",
      userId,
      token: event.request.challengeAnswer,
    });

    event.response.answerCorrect = state === "ALLOW" || state === "CHALLENGE_SUCCEEDED";
  }

  return event;
};
