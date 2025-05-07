import { CreateAuthChallengeTriggerHandler } from "aws-lambda";
import { authsignal } from "../authsignal";

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

  const { signInMethod } = event.request.clientMetadata ?? {};

  // If signing in via SMS, send an Authsignal token back to the client
  // This will be used to perform an OTP challenge with the Authsignal Client SDK
  if (signInMethod === "SMS") {
    const userId = event.request.userAttributes.sub;
    const phoneNumber = event.request.userAttributes.phone_number;

    const { token, isEnrolled } = await authsignal.track({
      action: "cognitoSmsAuth",
      userId,
      attributes: {
        phoneNumber,
      },
    });

    event.response.privateChallengeParameters = {
      challenge: "SMS",
    };

    event.response.publicChallengeParameters = {
      token,
      isEnrolled: isEnrolled.toString(),
    };

    return event;
  }

  // If signing in via passkey, no public challenge params are needed
  if (signInMethod === "PASSKEY") {
    event.response.privateChallengeParameters = {
      challenge: "PASSKEY",
    };

    return event;
  }

  throw new Error("Invalid sign-in method");
};
