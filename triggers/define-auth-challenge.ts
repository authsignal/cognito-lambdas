import { DefineAuthChallengeTriggerHandler } from "aws-lambda";

export const handler: DefineAuthChallengeTriggerHandler = async (event) => {
  const { session } = event.request;

  const latestSession = session.length > 0 ? session[session.length - 1] : undefined;

  if (!latestSession) {
    // Create custom challenge for passwordless login via passkey
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";

    return event;
  }

  if (latestSession.challengeName === "SRP_A") {
    // Create password verifier challenge for username and password login
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "PASSWORD_VERIFIER";

    return event;
  }

  if (latestSession.challengeName === "PASSWORD_VERIFIER") {
    // Create custom challenge for MFA after username and password login
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";

    return event;
  }

  if (latestSession.challengeName === "CUSTOM_CHALLENGE" && latestSession.challengeResult) {
    // Handle successful custom challenge
    // This is either for passwordless login via passkey or MFA after username and password login
    event.response.issueTokens = true;
    event.response.failAuthentication = false;

    return event;
  }

  // Something went wrong - fail authentication
  event.response.issueTokens = false;
  event.response.failAuthentication = true;

  return event;
};
