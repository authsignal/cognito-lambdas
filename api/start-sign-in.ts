import { APIGatewayProxyEventV2 } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { authsignal } from "../lib/authsignal";
import { createCognitoUser } from "../lib/cognito";

interface RequestBody {
  phoneNumber?: string;
  email?: string;
  idToken?: string;
}

interface ResponseBody {
  username: string;
}

const DUMMY_PHONE_NUMBER = "+15555555555";

// Looks up a user by phone number, email address, or Apple/Google ID token
// If the user does not exist, creates a new user in Authsignal & Cognito
// Returns the username to use for Cognito sign-in
export const handler = async (event: APIGatewayProxyEventV2): Promise<ResponseBody> => {
  const { phoneNumber, email, idToken } = JSON.parse(event.body!) as RequestBody;

  if (phoneNumber) {
    return handleSmsAuth(phoneNumber);
  } else if (email) {
    return handleEmailAuth(email);
  } else if (idToken) {
    return handleSocialAuth(idToken);
  }

  throw new Error("Invalid request parameters");
};

async function handleSmsAuth(phoneNumber: string) {
  const { users } = await authsignal.queryUsers({ phoneNumber });

  if (users[0]?.username) {
    return {
      username: users[0].username,
    };
  }

  const username = uuid();
  const attributes = { username, phoneNumber };

  await createCognitoUser(attributes);

  await authsignal.updateUser({ userId: username, attributes });

  return {
    username,
  };
}

async function handleEmailAuth(email: string) {
  const { users } = await authsignal.queryUsers({ email });

  if (users[0]?.username) {
    return {
      username: users[0].username,
    };
  }

  // Create Cognito user with a dummy phone number
  // This is because our user pool requires a phone number
  // Set the email address as unverified
  const username = uuid();
  const attributes = {
    username,
    phoneNumber: DUMMY_PHONE_NUMBER,
    email,
  };

  await createCognitoUser(attributes);

  await authsignal.updateUser({ userId: username, attributes });

  return {
    username,
  };
}

async function handleSocialAuth(idToken: string) {
  const { users, tokenPayload } = await authsignal.queryUsers({ token: idToken });

  if (users[0]?.username) {
    return {
      username: users[0].username,
    };
  }

  // Create Cognito user with a dummy phone number
  // This is because our user pool requires a phone number
  // Email address may already be verified
  const username = uuid();
  const attributes = {
    username,
    phoneNumber: DUMMY_PHONE_NUMBER,
    email: tokenPayload.email,
    emailVerified: tokenPayload.email_verified,
  };

  await createCognitoUser(attributes);

  await authsignal.updateUser({ userId: username, attributes });

  return {
    username,
  };
}
