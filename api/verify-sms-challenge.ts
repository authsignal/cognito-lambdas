import { APIGatewayProxyEventV2 } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { authsignal } from "../lib/authsignal";
import { createCognitoUser } from "../lib/cognito";

interface RequestBody {
  challengeId: string;
  verificationCode: string;
  phoneNumber: string;
}

interface ResponseBody {
  isVerified: boolean;
  userId?: string;
  token?: string;
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<ResponseBody> => {
  const { challengeId, verificationCode, phoneNumber } = JSON.parse(event.body!) as RequestBody;

  const { isVerified } = await authsignal.verify({
    challengeId,
    verificationCode,
  });

  if (!isVerified) {
    return {
      isVerified: false,
    };
  }

  // Now we know the user's phone number has been verified.
  // Lookup user by their phone number - create a new user if they don't exist
  const { userId } = await getOrCreateUser(phoneNumber);

  // Now claim the SMS challenge on behalf of the user
  const { token } = await authsignal.claimChallenge({ challengeId, userId });

  return {
    isVerified,
    userId,
    token,
  };
};

async function getOrCreateUser(phoneNumber: string) {
  const { users } = await authsignal.queryUsers({ phoneNumber });

  if (users[0]?.userId) {
    return {
      userId: users[0].userId,
    };
  }

  // Create user in Cognito
  const userId = uuid();

  await createCognitoUser({
    username: userId,
    phoneNumber,
    phoneNumberVerified: true,
  });

  await authsignal.updateUser({
    userId,
    attributes: {
      phoneNumber,
    },
  });

  return {
    userId,
  };
}
