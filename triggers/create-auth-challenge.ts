import { CreateAuthChallengeTriggerHandler } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  // If there is no session it means there is no previous username/password step
  // This means we're performing a passwordless login via passkey
  // In this case we don't need to track an action and return a pre-built UI URL
  if (event.request.session.length === 0) {
    event.response.privateChallengeParameters = { isPasswordlessLogin: "true" };

    return event;
  }

  const deviceId = event.request.clientMetadata?.deviceId;
  const isDeviceTrusted = event.request.clientMetadata?.isDeviceTrusted ?? "false";

  const { state, url, token } = await authsignal.track({
    action: "mfa",
    userId,
    attributes: {
      email,
      deviceId,
      custom: {
        isDeviceTrusted,
      },
    },
  });

  event.response.publicChallengeParameters = {
    state,
    url,
    token,
  };

  return event;
};
