import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { OAuth2Client } from "google-auth-library";
import { authsignal } from "../authsignal";

const oauth2Client = new OAuth2Client();

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  event.response.answerCorrect = false;

  // Exit if the response is only to set the challenge parameters
  if (event.request.privateChallengeParameters.challenge === "PROVIDE_AUTH_PARAMETERS") {
    return event;
  }

  const signInMethod = event.request.clientMetadata?.signInMethod;

  switch (signInMethod) {
    case "SMS": {
      const { isValid } = await authsignal.validateChallenge({
        action: "cognitoSmsAuth",
        userId: event.userName,
        token: event.request.challengeAnswer,
      });

      event.response.answerCorrect = isValid;

      return event;
    }

    case "PASSKEY": {
      const { isValid } = await authsignal.validateChallenge({
        action: "cognitoPasskeyAuth",
        userId: event.userName,
        token: event.request.challengeAnswer,
      });

      event.response.answerCorrect = isValid;

      return event;
    }

    case "GOOGLE": {
      const idToken = event.request.challengeAnswer;

      const ticket = await oauth2Client.verifyIdToken({ idToken });

      const payload = ticket.getPayload();

      const isEmailVerified = !!payload?.email && !!payload.email_verified;

      event.response.answerCorrect = isEmailVerified;

      return event;
    }

    default:
      throw new Error("Invalid sign-in method");
  }
};
