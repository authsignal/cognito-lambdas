# Authsignal + Amazon Cognito lambda examples

This repository contains example lambdas for integrating Authsignal with Amazon Cognito.

## Example app

These lambdas are designed to be used together with our [React Native example app](https://github.com/authsignal/aws-cognito-react-native-example).

<img src="sign-in.png" alt="sign-in" width="300"/>

## Start sign-in endpoint

This lambda is called before initiating sign-in with Cognito.
It will lookup a user by phone number, email, or Apple/Google ID token, create them in Cognito if they don't exist, and return their username.

- [Start sign-in](https://github.com/authsignal/cognito-lambdas/blob/main/api/start-sign-in.ts)

## Cognito triggers

The following lambdas are used for signing in to Cognito with SMS OTP, email OTP, passkey, or Apple or Google sign-in:

- [Define auth challenge](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/define-auth-challenge.ts)
- [Create auth challenge](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/create-auth-challenge.ts)
- [Verify auth challenge response](https://github.com/authsignal/cognito-lambdas/blob/main/triggers/verify-auth-challenge-response.ts)

## Add & verify authenticator endpoints

This lambda is called to authorize enrolling additional authentication methods (e.g. email OTP, SMS OTP, passkey) via a Authsignal Client SDK once the user is signed in.

- [Add authenticator](https://github.com/authsignal/cognito-lambdas/blob/main/api/add-authenticator.ts)

This lambda is called to set the email and phone number attributes as verified in Cognito after enrolling a new email OTP or SMS OTP authenticator.

- [Verify authenticator](https://github.com/authsignal/cognito-lambdas/blob/main/api/verify-authenticator.ts)

## Installation

```
yarn install
```

## Configuration

Rename `.env.example` to `.env` and provide the values for your AWS and Authsignal configuration.

```
ACCESS_KEY_ID=
SECRET_ACCESS_KEY=
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
