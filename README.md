# Authsignal + Amazon Cognito lambda examples

This repository contains example lambdas for integrating Authsignal with Amazon Cognito.

It includes the following lambdas for signing in with an Email OTP or SMS/WhatsApp OTP challenge:

- [Pre sign-up](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/pre-sign-up.ts)
- [Define auth challenge](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/define-auth-challenge.ts)
- [Create auth challenge](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/create-auth-challenge.ts)
- [Verify auth challenge response](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/verify-auth-challenge-response.ts)

As well as an API endpoint for creating a passkey after signing in:

- [Add authenticator](https://github.com/authsignal/cognito-lambdas/blob/main/api/add-authenticator.ts)

## Installation

```
yarn install
```

## Configuration

Rename `.env.example` to `.env` and provide the values for your Cognito user pool and Authsignal tenant.

```
AUTHSIGNAL_SECRET=
AUTHSIGNAL_URL=
JWT_AUTHORIZER_ISSUER_URL=
JWT_AUTHORIZER_AUDIENCE=
```

## Deployment

This example uses [Serverless Framework](https://www.serverless.com/) to deploy the lambdas.

```
yarn deploy --region=YOUR_AWS_REGION
```

## Documentation

For more detailed information on how to integrate Authsignal with Amazon Cognito refer to our [official documentation](https://docs.authsignal.com/integrations/aws-cognito/overview).
