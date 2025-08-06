import { DefineAuthChallengeTriggerHandler } from "aws-lambda";

export const handler: DefineAuthChallengeTriggerHandler = async (event) => {
  const { session } = event.request;

  const latestSession = session.length > 0 ? session[session.length - 1] : undefined;

  // Create custom challenge for passwordless login via passkey
  if (!latestSession) {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";

    return event;
  }

  // Create password verifier challenge for username and password login
  if (latestSession.challengeName === "SRP_A") {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "PASSWORD_VERIFIER";

    return event;
  }

  // Create custom challenge for MFA after username and password login
  if (latestSession.challengeName === "PASSWORD_VERIFIER") {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";

    return event;
  }

  // Handle successful custom challenge
  // This is either for passwordless login via passkey or MFA after username and password login
  if (latestSession.challengeName === "CUSTOM_CHALLENGE" && latestSession.challengeResult) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;

    return event;
  }

  // Something went wrong - fail authentication
  event.response.issueTokens = false;
  event.response.failAuthentication = true;

  return event;
};
