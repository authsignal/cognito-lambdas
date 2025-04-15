import { CreateAuthChallengeTriggerHandler } from "aws-lambda";
import { authsignal } from "./authsignal";

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  const userId = event.request.userAttributes.sub;

  // Only required when using email OTP sign-in
  const email = event.request.userAttributes.email;

  // Only required when using SMS OTP sign-in
  const phoneNumber = event.request.userAttributes.phone_number;

  const { url, token, isEnrolled } = await authsignal.track({
    action: "cognitoAuth",
    userId,
    attributes: {
      email,
      phoneNumber,
    },
  });

  event.response.publicChallengeParameters = {
    url, // Only required when using the Authsignal pre-built UI
    token, // Only required when using the Authsignal Web or Mobile SDKs
    isEnrolled: isEnrolled.toString(),
  };

  return event;
};
