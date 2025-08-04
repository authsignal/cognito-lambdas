import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  console.log("Verify Auth Challenge Response event:", JSON.stringify(event, null, 2));

  const userId = event.request.userAttributes.sub;
  const token = event.request.challengeAnswer;

  const { isEnrolled } = await authsignal.getUser({ userId });

  const { state } = await authsignal.validateChallenge({
    action: "mfa",
    userId,
    token,
  });

  event.response.answerCorrect = (isEnrolled && state === "ALLOW") || state === "CHALLENGE_SUCCEEDED";

  return event;
};
