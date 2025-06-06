import { VerificationMethod } from "@authsignal/node";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

interface RequestBody {
  email: string;
}

interface ResponseBody {
  challengeId: string;
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<ResponseBody> => {
  const { email } = JSON.parse(event.body!) as RequestBody;

  const { challengeId } = await authsignal.challenge({
    verificationMethod: "EMAIL_OTP",
    email,
    action: "cognitoAuth",
  });

  return {
    challengeId,
  };
};
