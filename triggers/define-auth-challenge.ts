import { DefineAuthChallengeTriggerHandler } from "aws-lambda";

export const handler: DefineAuthChallengeTriggerHandler = async (event) => {
  const { session } = event.request;

  if (session.length === 1 && session[0].challengeName === "SRP_A") {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "PASSWORD_VERIFIER";
  } else if (session.length === 2 && session[1].challengeName === "PASSWORD_VERIFIER") {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";
  } else if (
    session.length === 3 &&
    session[2].challengeName === "CUSTOM_CHALLENGE" &&
    session[2].challengeResult === true
  ) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else {
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  }

  return event;
};
