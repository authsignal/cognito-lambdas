import { APIGatewayProxyEventV2 } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { authsignal } from "../lib/authsignal";
import { authenticateCognitoUser, createCognitoUser } from "../lib/cognito";

interface RequestBody {
  smsChallengeId: string;
  emailChallengeId: string;
  emailVerificationCode: string;
}

interface ResponseBody {
  isVerified: boolean;
  accessToken?: string;
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<ResponseBody> => {
  const { smsChallengeId, emailChallengeId, emailVerificationCode } = JSON.parse(event.body!) as RequestBody;

  // First verify the email verification code and retrieve the email
  const { isVerified, email } = await authsignal.verify({
    challengeId: emailChallengeId,
    verificationCode: emailVerificationCode,
  });

  if (!isVerified || !email) {
    return {
      isVerified: false,
    };
  }

  // Email is verified, now lookup the SMS challenge to get the phone number
  const smsChallengeResponse = await authsignal.getChallenge({ challengeId: smsChallengeId });

  if (!smsChallengeResponse.phoneNumber || smsChallengeResponse.verificationMethod !== "SMS") {
    // SMS challenge is either invalid, expired, or incomplete
    // The verificationMethod field is only present if the challenge has been completed
    return {
      isVerified: false,
    };
  }

  // Extract the phone number from the SMS challenge
  const { phoneNumber } = smsChallengeResponse;

  // Now create a new user in Cognito and claim both challenges
  // The Cognito user will be created with a verified phone number and email
  const userId = uuid();

  // Claim SMS challenge and obtain the token
  // We only need one Authsignal token to authenticate with Cognito
  const { token } = await authsignal.claimChallenge({ challengeId: smsChallengeId, userId });

  // Claim Email OTP challenge
  await authsignal.claimChallenge({ challengeId: emailChallengeId, userId });

  // Create the Cognito user
  await createCognitoUser({ username: userId, phoneNumber, email });

  // Authenticate the Cognito user and obtain an access token
  const { accessToken } = await authenticateCognitoUser({ username: userId, answer: token });

  return {
    isVerified: true,
    accessToken,
  };
};
