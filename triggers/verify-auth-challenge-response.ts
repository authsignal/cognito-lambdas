import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { authsignal } from "../authsignal";

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  event.response.answerCorrect = false;

  // Exit if the response is only to set the challenge parameters
  if (event.request.privateChallengeParameters.challenge === "PROVIDE_AUTH_PARAMETERS") {
    return event;
  }

  const userId = event.request.userAttributes.sub;
  const token = event.request.challengeAnswer;
  const signInMethod = event.request.clientMetadata?.signInMethod;

  const action = signInMethod === "PASSKEY" ? "cognitoPasskeyAuth" : "cognitoSmsAuth";

  const { isValid } = await authsignal.validateChallenge({
    action,
    userId,
    token,
  });

  event.response.answerCorrect = isValid;

  return event;
};
