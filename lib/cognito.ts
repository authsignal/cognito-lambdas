import {
  AdminCreateUserCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  AdminSetUserPasswordCommand,
  ChallengeNameType,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "node:crypto";

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

interface CognitoUserAttributesInput {
  username: string;
  phoneNumber: string;
  email: string;
}

// We can only create users in Cognito with a verified phone number and email
export async function createCognitoUser(input: CognitoUserAttributesInput) {
  const { username, phoneNumber, email } = input;

  const createUserCommand = new AdminCreateUserCommand({
    UserPoolId: process.env.USER_POOL_ID!,
    Username: username,
    MessageAction: "SUPPRESS",
    UserAttributes: [
      { Name: "phone_number", Value: phoneNumber },
      { Name: "phone_number_verified", Value: "true" },
      { Name: "email", Value: email },
      { Name: "email_verified", Value: "true" },
    ],
  });

  await cognitoIdentityProviderClient.send(createUserCommand);

  const setUserPasswordCommand = new AdminSetUserPasswordCommand({
    Password: crypto.randomBytes(32).toString("base64"),
    Username: username,
    UserPoolId: process.env.USER_POOL_ID!,
    Permanent: true,
  });

  await cognitoIdentityProviderClient.send(setUserPasswordCommand);
}

interface AuthenticateCognitoUserInput {
  username: string;
  answer: string;
}

export async function authenticateCognitoUser(input: AuthenticateCognitoUserInput) {
  const { username, answer } = input;

  const initiateAuthCommand = new AdminInitiateAuthCommand({
    UserPoolId: process.env.USER_POOL_ID!,
    ClientId: process.env.USER_POOL_CLIENT_ID!,
    AuthFlow: "CUSTOM_AUTH",
    AuthParameters: {
      USERNAME: username,
    },
  });

  const initiateAuthOutput = await cognitoIdentityProviderClient.send(initiateAuthCommand);

  const respondToAuthChallengeCommand = new AdminRespondToAuthChallengeCommand({
    UserPoolId: process.env.USER_POOL_ID!,
    ClientId: process.env.USER_POOL_CLIENT_ID!,
    ChallengeName: ChallengeNameType.CUSTOM_CHALLENGE,
    Session: initiateAuthOutput.Session,
    ChallengeResponses: {
      USERNAME: username,
      ANSWER: answer,
    },
  });

  const respondToAuthChallengeOutput = await cognitoIdentityProviderClient.send(respondToAuthChallengeCommand);

  return {
    accessToken: respondToAuthChallengeOutput.AuthenticationResult?.AccessToken,
    refreshToken: respondToAuthChallengeOutput.AuthenticationResult?.RefreshToken,
  };
}
