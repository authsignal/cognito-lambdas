import { Authsignal, UserActionState, VerificationMethod } from "@authsignal/node";
import { CreateAuthChallengeTriggerHandler } from "aws-lambda";

const apiSecretKey = process.env.AUTHSIGNAL_SECRET!;
const apiUrl = process.env.AUTHSIGNAL_URL!;

const authsignal = new Authsignal({ apiSecretKey, apiUrl });

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;
  const phoneNumber = event.request.userAttributes.phone_number;

  if (!userId) {
    throw new Error("User is undefined");
  }

  // Check if a challenge has already been initiated via passkey SDK
  const { challengeId } = await authsignal.getChallenge({
    action: "cognitoAuth",
    userId,
    verificationMethod: VerificationMethod.PASSKEY,
  });

  const { url, token, isEnrolled, state } = await authsignal.track({
    action: "cognitoAuth",
    userId,
    attributes: {
      email,
      phoneNumber,
      challengeId,
    },
  });

  if (state === UserActionState.BLOCK) {
    throw new Error("User is blocked");
  }

  event.response.publicChallengeParameters = {
    url, // Required when using the Authsignal pre-built UI
    token, // Required when using Authsignal Web or Mobile SDKs
    isEnrolled: isEnrolled.toString(),
  };

  return event;
};
