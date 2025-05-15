# Authsignal + Amazon Cognito lambda examples

This repository contains example lambdas for integrating Authsignal with Amazon Cognito.

These lambdas are designed to be used together with the [React Native example app](https://github.com/authsignal/aws-cognito-react-native-example).

It includes the following.

## Unauthenticated API endpoint lambda

This lambda is called before initiating sign-in with Cognito.
It will lookup a user by phone number or Google ID token, create them in Cognito if they don't exist, and return their username.

- [Start sign-in](https://github.com/authsignal/cognito-lambdas/blob/main/api/start-sign-in.ts)

## Cognito trigger lambdas

The following lambdas are used for signing in to Cognito with SMS OTP, passkey, or Google sign-in:

- [Define auth challenge](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/define-auth-challenge.ts)
- [Create auth challenge](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/create-auth-challenge.ts)
- [Verify auth challenge response](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/verify-auth-challenge-response.ts)

## Authenticated API endpoint lambdas

This lambda is called to enroll additional authentication methods via the Authsignal React Native SDK (e.g. SMS OTP, email OTP, passkey).
It will return an Authsignal token which is set on the React Native SDK to authorize enrolling a new authenticator.

- [Add authenticator](https://github.com/authsignal/cognito-lambdas/blob/main/api/add-authenticator.ts)

This lambda is called after enrolling a new authenticator via the Authsignal React Native SDK.
It will check if an SMS OTP or email OTP authenticator is enrolled and set the corresponding Cognito user attributes (i.e. email and/or phone number) as verified.

- [Verify authenticator](https://github.com/authsignal/cognito-lambdas/blob/main/api/verify-authenticator.ts)

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

For more detailed information on how to integrate Authsignal with Amazon Cognito refer to our [official documentation](https://docs.authsignal.com/integrations/aws-cognito/getting-started).
