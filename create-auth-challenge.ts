import { Authsignal, UserActionState } from "@authsignal/node";
import { CreateAuthChallengeTriggerHandler } from "aws-lambda";

const apiSecretKey = process.env.AUTHSIGNAL_SECRET!;
const apiUrl = process.env.AUTHSIGNAL_URL!;

const authsignal = new Authsignal({ apiSecretKey, apiUrl });

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub ?? event.userName;

  if (!userId) {
    throw new Error("User is undefined");
  }

  // 'email' is required when using email OTP sign-in
  const email = event.request.userAttributes.email;

  // 'phoneNumber' is required when using SMS OTP sign-in
  const phoneNumber = event.request.userAttributes.phone_number;

  const { url, token, isEnrolled, state } = await authsignal.track({
    action: "cognitoAuth",
    userId,
    attributes: {
      email,
      phoneNumber,
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
