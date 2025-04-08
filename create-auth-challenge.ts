import { CreateAuthChallengeTriggerHandler } from "aws-lambda";
import { authsignal } from "./authsignal";

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  const { url, token, isEnrolled } = await authsignal.track({
    action: "cognitoAuth",
    userId,
    attributes: {
      email,
    },
  });

  event.response.publicChallengeParameters = {
    token,
    isEnrolled: isEnrolled.toString(),
  };

  return event;
};
