import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { authsignal } from "../lib/authsignal";
import { UserActionState } from "@authsignal/node";

interface RequestBody {
  amount?: string;
  token?: string;
}

interface ResponseBody {
  transferCompleted: boolean;
  token?: string;
}

const action = "transferFunds";

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<ResponseBody> => {
  const userId = event.requestContext.authorizer.jwt.claims.username as string;

  const body: RequestBody = JSON.parse(event.body!);

  if (body.token) {
    // If a token is present it means the user has completed a step-up authentication challenge
    const { isValid, idempotencyKey } = await authsignal.validateChallenge({
      userId,
      action,
      token: body.token,
    });

    if (!isValid || !idempotencyKey) {
      throw new Error("Invalid request");
    }

    // Transaction has been signed successfully
    // Lookup the transfer amount from the signed transaction data
    // Then proceed with transferring funds
    const getActionResponse = await authsignal.getAction({ userId, action, idempotencyKey });

    const amount = getActionResponse.output.custom?.amount;

    return await transferFunds(amount);
  }

  if (body.amount) {
    // If no token is present we need check if transaction signing is required
    const { state, token } = await authsignal.track({
      userId,
      action,
      attributes: {
        custom: {
          amount: body.amount,
        },
      },
    });

    if (state === UserActionState.ALLOW) {
      // No transaction signing is required
      // Proceed with transferring funds
      return await transferFunds(body.amount);
    } else {
      // Transaction signing is required
      return {
        transferCompleted: false,
        token,
      };
    }
  }

  throw new Error("Invalid request");
};

async function transferFunds(_amount: string) {
  // Proceed with funds transfer....

  return {
    transferCompleted: true,
  };
}
