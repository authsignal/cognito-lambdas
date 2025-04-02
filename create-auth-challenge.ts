import { Authsignal } from "@authsignal/node";
import { CreateAuthChallengeTriggerHandler } from "aws-lambda";

const apiSecretKey = process.env.AUTHSIGNAL_SECRET!;
const apiUrl = process.env.AUTHSIGNAL_URL!;

const authsignal = new Authsignal({ apiSecretKey, apiUrl });

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  // We use the Cognito username as the Authsignal userId
  const userId = event.userName;

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
