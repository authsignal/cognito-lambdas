import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { authsignal } from "../authsignal";

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;

  const token = event.request.challengeAnswer;

  const { state } = await authsignal.validateChallenge({
    action: "cognitoAuth",
    userId,
    token,
  });

  event.response.answerCorrect = state === "CHALLENGE_SUCCEEDED";

  return event;
};
