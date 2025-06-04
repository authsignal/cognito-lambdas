import { VerificationMethod } from "@authsignal/node";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { authsignal } from "../lib/authsignal";

interface RequestBody {
  phoneNumber: string;
}

interface ResponseBody {
  challengeId: string;
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<ResponseBody> => {
  const { phoneNumber } = JSON.parse(event.body!) as RequestBody;

  const { challengeId } = await authsignal.challenge({
    verificationMethod: "SMS",
    phoneNumber,
    action: "cognitoAuth",
  });

  return {
    challengeId,
  };
};
