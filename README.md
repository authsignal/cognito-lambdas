# Authsignal + Amazon Cognito lambda examples

This repository contains example lambdas for integrating Authsignal with Amazon Cognito.

It includes the following:

## Cognito trigger lambdas

The following lambdas are used for signing in with an Email OTP or SMS/WhatsApp OTP challenge:

- [Pre sign-up](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/pre-sign-up.ts)
- [Define auth challenge](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/define-auth-challenge.ts)
- [Create auth challenge](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/create-auth-challenge.ts)
- [Verify auth challenge response](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/verify-auth-challenge-response.ts)

## API endpoint lambdas

This lambda is used for enrolling additional authentication methods via the Authsignal Client SDK (e.g. passkey):

- [Add authenticator](https://github.com/authsignal/cognito-lambdas/blob/main/api/add-authenticator.ts)

This lambda is used for setting the `email_verified` attribute in Cognito:

- [Verify email](https://github.com/authsignal/cognito-lambdas/blob/main/api/verify-email.ts)

## Installation

```
yarn install
```

## Configuration

Rename `.env.example` to `.env` and provide the values for your AWS and Authsignal configuration.

```
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
USER_POOL_ID=
USER_POOL_CLIENT_ID=
AUTHSIGNAL_SECRET=
AUTHSIGNAL_URL=
```

## Deployment

This example uses [Serverless Framework](https://www.serverless.com/) to deploy the lambdas.

```
yarn deploy --region=YOUR_AWS_REGION
```

## Documentation

For more detailed information on how to integrate Authsignal with Amazon Cognito refer to our [official documentation](https://docs.authsignal.com/integrations/aws-cognito/overview).
