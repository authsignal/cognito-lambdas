import { Authsignal } from "@authsignal/node";
import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";

const apiSecretKey = process.env.AUTHSIGNAL_SECRET!;
const apiUrl = process.env.AUTHSIGNAL_URL!;

const authsignal = new Authsignal({ apiSecretKey, apiUrl });

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
