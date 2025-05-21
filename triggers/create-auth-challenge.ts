import { CreateAuthChallengeTriggerHandler } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  if (!event.request.session || !event.request.session.length) {
    // When Create Auth Challenge is called the 1st time
    // We let the user respond by providing some auth parameters
    const challenge = "PROVIDE_AUTH_PARAMETERS";

    event.response.challengeMetadata = challenge;
    event.response.privateChallengeParameters = { challenge };
    event.response.publicChallengeParameters = { challenge };

    return event;
  }

  const signInMethod = event.request.clientMetadata?.signInMethod;

  if (!signInMethod) {
    throw new Error("signInMethod is required");
  }

  // If signing in via SMS or email, send an Authsignal token back to the client
  // This will be used to perform an OTP challenge with the Authsignal Client SDK
  if (signInMethod === "SMS" || signInMethod === "EMAIL") {
    const phoneNumber = event.request.userAttributes.phone_number;
    const email = event.request.userAttributes.email;

    const { token, enrolledVerificationMethods } = await authsignal.track({
      action: "cognitoAuth",
      userId: event.userName,
      attributes: {
        phoneNumber,
        email,
      },
    });

    const phoneNumberVerified = enrolledVerificationMethods?.find((m) => m === "SMS") ? "true" : "false";
    const emailVerified = enrolledVerificationMethods?.find((m) => m === "EMAIL_OTP") ? "true" : "false";

    event.response.publicChallengeParameters = { token, phoneNumberVerified, emailVerified };
  }

  event.response.privateChallengeParameters = { challenge: signInMethod };

  return event;
};
