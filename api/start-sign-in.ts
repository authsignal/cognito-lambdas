import { APIGatewayProxyEventV2 } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { authsignal } from "../lib/authsignal";
import { createCognitoUser } from "../lib/cognito";

interface RequestBody {
  phoneNumber?: string;
  googleIdToken?: string;
}

interface ResponseBody {
  username: string;
}

// Looks up a user by phone number or Google ID token
// If the user does not exist, creates a new user in Authsignal & Cognito
// Returns the username to use for Cognito sign-in
export const handler = async (event: APIGatewayProxyEventV2): Promise<ResponseBody> => {
  const { phoneNumber, googleIdToken } = JSON.parse(event.body!) as RequestBody;

  if (phoneNumber) {
    return handleSmsAuth(phoneNumber);
  } else if (googleIdToken) {
    return handleGoogleAuth(googleIdToken);
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
  const attributes = {
    username,
    phoneNumber,
  };

  await createCognitoUser(attributes);

  await authsignal.updateUser({ userId: username, attributes });

  return {
    username,
  };
}

async function handleGoogleAuth(idToken: string) {
  const { users, tokenPayload } = await authsignal.queryUsers({ token: idToken });

  if (users[0]?.username) {
    return {
      username: users[0].username,
    };
  }

  // We have a new user who has not verified their phone number
  // Create a new user in Cognito with a dummy phone number value
  // This is because our user pool requires a phone number
  // We will update the phone number later and mark it as verified
  const username = uuid();
  const attributes = {
    username,
    phoneNumber: "+15555555555",
    email: tokenPayload.email,
    emailVerified: tokenPayload.email_verified,
  };

  await createCognitoUser(attributes);

  await authsignal.updateUser({ userId: username, attributes });

  return {
    username,
  };
}
