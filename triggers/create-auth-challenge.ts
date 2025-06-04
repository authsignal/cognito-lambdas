import { CreateAuthChallengeTriggerHandler } from "aws-lambda";

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  event.response.privateChallengeParameters = { challenge: "CUSTOM_CHALLENGE" };

  return event;
};
