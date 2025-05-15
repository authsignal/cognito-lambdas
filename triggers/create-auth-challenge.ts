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

  switch (event.request.clientMetadata?.signInMethod) {
    case "SMS": {
      // If signing in via SMS, send an Authsignal token back to the client
      // This will be used to perform an OTP challenge with the Authsignal Client SDK
      const phoneNumber = event.request.userAttributes.phone_number;

      const { token, enrolledVerificationMethods } = await authsignal.track({
        action: "cognitoAuth",
        userId: event.userName,
        attributes: {
          phoneNumber,
        },
      });

      const phoneNumberVerified = enrolledVerificationMethods?.find((m) => m === "SMS") ? "true" : "false";

      event.response.publicChallengeParameters = { token, phoneNumberVerified };
      event.response.privateChallengeParameters = { challenge: "SMS" };

      return event;
    }

    case "PASSKEY": {
      event.response.privateChallengeParameters = { challenge: "PASSKEY" };

      return event;
    }

    case "GOOGLE": {
      event.response.privateChallengeParameters = { challenge: "GOOGLE" };

      return event;
    }

    default:
      throw new Error("Invalid sign-in method");
  }
};
