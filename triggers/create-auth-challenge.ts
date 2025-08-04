import { CreateAuthChallengeTriggerHandler } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;
  const deviceId = event.request.clientMetadata?.deviceId;

  const { isEnrolled, state, url, token } = await authsignal.track({
    action: "mfa",
    userId,
    attributes: {
      email,
      deviceId,
    },
  });

  event.response.publicChallengeParameters = {
    isEnrolled: isEnrolled.toString(),
    state,
    url,
    token,
  };

  return event;
};
