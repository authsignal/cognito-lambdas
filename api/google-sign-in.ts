import { APIGatewayProxyEventV2 } from "aws-lambda";
import { OAuth2Client } from "google-auth-library";
import { queryUsersByEmail } from "../authsignal";

const oauth2Client = new OAuth2Client();

export const handler = async (event: APIGatewayProxyEventV2) => {
  const { idToken } = JSON.parse(event.body!);

  const ticket = await oauth2Client.verifyIdToken({ idToken });

  const payload = ticket.getPayload();

  const email = payload?.email && payload.email_verified ? payload.email : undefined;

  if (!email) {
    throw new Error("Email not verified");
  }

  const users = await queryUsersByEmail(email);

  if (users.length === 0) {
    return {
      verifiedPhoneNumber: undefined,
    };
  }

  const { phoneNumber, phoneNumberVerified } = users[0];

  return {
    verifiedPhoneNumber: phoneNumberVerified ? phoneNumber : undefined,
  };
};
