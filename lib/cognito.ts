import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AttributeType,
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
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
}

export async function createCognitoUser(input: CognitoUserAttributesInput) {
  const { username, email, emailVerified, phoneNumber } = input;

  // Phone number is a required attribute in our user pool
  if (!phoneNumber) {
    throw new Error("Phone number is required");
  }

  const userAttributes = [{ Name: "phone_number", Value: phoneNumber }];

  if (email) {
    userAttributes.push({ Name: "email", Value: email });
  }

  // A user may be created with a verified email address
  // For example is created via Google sign-in
  if (emailVerified) {
    userAttributes.push({ Name: "email_verified", Value: "true" });
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

export async function updateCognitoUserAttributes(input: CognitoUserAttributesInput) {
  const { username, email, emailVerified, phoneNumber, phoneNumberVerified } = input;

  const userAttributes: AttributeType[] = [];

  if (email) {
    userAttributes.push({ Name: "email", Value: email });
  }

  if (emailVerified) {
    userAttributes.push({ Name: "email_verified", Value: "true" });
  }

  if (phoneNumber) {
    userAttributes.push({ Name: "phone_number", Value: phoneNumber });
  }

  if (phoneNumberVerified) {
    userAttributes.push({ Name: "phone_number_verified", Value: "true" });
  }

  if (userAttributes.length === 0) {
    return;
  }

  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: process.env.USER_POOL_ID!,
    Username: username,
    UserAttributes: userAttributes,
  });

  await cognitoIdentityProviderClient.send(command);
}
