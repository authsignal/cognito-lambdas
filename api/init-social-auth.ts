import { APIGatewayProxyEventV2 } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { authsignal } from "../lib/authsignal";
import { createCognitoUser } from "../lib/cognito";

interface RequestBody {
  idToken: string;
}

interface ResponseBody {
  username: string;
}

// Looks up a user by phone number, email address, or Apple/Google ID token
// If the user does not exist, creates a new user in Authsignal & Cognito
// Returns the username to use for Cognito sign-in
export const handler = async (event: APIGatewayProxyEventV2): Promise<ResponseBody> => {
  const { idToken } = JSON.parse(event.body!) as RequestBody;

  const { users, tokenPayload } = await authsignal.queryUsers({ token: idToken });

  if (users[0]?.userId) {
    return {
      username: users[0].userId,
    };
  }

  // Create Cognito user with a dummy phone number
  // This is because our user pool requires a phone number
  // Email address may already be verified
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
};
