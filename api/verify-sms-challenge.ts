import { APIGatewayProxyEventV2 } from "aws-lambda";
import { authsignal } from "../lib/authsignal";
import { authenticateCognitoUser, createCognitoUser } from "../lib/cognito";

interface RequestBody {
  challengeId: string;
  verificationCode: string;
}

interface ResponseBody {
  isVerified: boolean;
  accessToken?: string;
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<ResponseBody> => {
  const { challengeId, verificationCode } = JSON.parse(event.body!) as RequestBody;

  const { isVerified, phoneNumber } = await authsignal.verify({
    challengeId,
    verificationCode,
  });

  if (!isVerified || !phoneNumber) {
    return {
      isVerified: false,
    };
  }

  const { users } = await authsignal.queryUsers({ phoneNumber });

  const existingUser = users.length > 0 ? users[0] : undefined;

  // User's phone number is verified but email may not be verified yet
  // Proceed with login only if email is verified
  if (!existingUser || !existingUser.emailVerified) {
    return {
      isVerified: true,
    };
  }

  // Email is already verified, proceed to authenticate with Cognito
  const { userId } = existingUser;

  const { token } = await authsignal.claimChallenge({ challengeId, userId });

  const username = existingUser.userId;
  const answer = token;

  const { accessToken } = await authenticateCognitoUser({ username, answer });

  return {
    isVerified,
    accessToken,
  };
};
