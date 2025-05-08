import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { OAuth2Client } from "google-auth-library";
import crypto from "node:crypto";
import { v4 } from "uuid";
import { authsignal, queryUsersByEmail, queryUsersByPhoneNumber } from "../authsignal";

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

const oauth2Client = new OAuth2Client();

export const handler = async (event: APIGatewayProxyEventV2) => {
  const { phoneNumber, googleIdToken } = JSON.parse(event.body!);

  if (phoneNumber) {
    return handleSmsAuth(phoneNumber);
  } else if (googleIdToken) {
    return handleGoogleAuth(googleIdToken);
  }

  throw new Error("Invalid request parameters");
};

async function handleSmsAuth(phoneNumber: string) {
  const users = await queryUsersByPhoneNumber(phoneNumber);

  if (users[0]?.username) {
    return {
      username: users[0].username,
    };
  }

  // Create a new user if none exists
  // The Cognito username will be the Authsignal user ID
  const username = v4();

  await createCognitoUser({ username, phoneNumber });

  await createAuthsignalUser({ username, phoneNumber });

  return {
    username,
  };
}

async function handleGoogleAuth(idToken: string) {
  const ticket = await oauth2Client.verifyIdToken({ idToken });

  const payload = ticket.getPayload();

  const verifiedEmail = payload?.email && payload.email_verified ? payload.email : undefined;

  if (!verifiedEmail) {
    throw new Error("Invalid ID token");
  }

  const users = await queryUsersByEmail(verifiedEmail);

  if (users.length > 0) {
    const user = users[0];
    const { username } = user;

    return {
      username,
    };
  }

  // We have a new user who has not verified their phone number
  // Create a new user in Cognito with a dummy phone number value
  // This is because our user pool requires a phone number
  // We will update the phone number later and mark it as verified
  const username = v4();
  const phoneNumber = DUMMY_PHONE_NUMBER;
  const email = verifiedEmail;

  await createCognitoUser({ username, phoneNumber, email });

  await createAuthsignalUser({ username, phoneNumber, email });

  return {
    username,
  };
}

interface CreateUserInput {
  username: string;
  phoneNumber: string;
  email?: string;
  emailVerified?: boolean;
}

async function createCognitoUser({ username, phoneNumber, email }: CreateUserInput) {
  const userAttributes = [{ Name: "phone_number", Value: phoneNumber }];

  if (email) {
    userAttributes.push({ Name: "email", Value: email });
  }

  const createUserCommand = new AdminCreateUserCommand({
    ForceAliasCreation: false,
    UserPoolId: process.env.USER_POOL_ID!,
    Username: username,
    MessageAction: "SUPPRESS",
    UserAttributes: userAttributes,
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

async function createAuthsignalUser({ username, phoneNumber, email }: CreateUserInput) {
  const userRequest = {
    userId: username,
    attributes: {
      phoneNumber,
      username,
      email,
    },
  };

  await authsignal.updateUser(userRequest);
}

const DUMMY_PHONE_NUMBER = "+15555555555";
