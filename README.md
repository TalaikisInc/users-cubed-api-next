<p align="center">
  <a href="https://talaikis.com/">
    <img alt="Talaikis Ltd." src="https://github.com/TalaikisInc/talaikis.com_react/blob/master/media/logo.png" width="228">
  </a>
</p>

# Users Cubed

This is the 4th generation user management/ CMS system for rapid project starts.

System is easily expandable with `actions` and uses only one route `/`,  making development for both frontend and backend parts fast and easy.

## STATUS

This repo is in development.

## Features

* User signin/ signout/ signup/ reset password/ confirm, delete account
* Minimal role system
* Minimal referral system
* E-commerce (in progress)
* Blog (in progress)
* Contact us service
* Upload service

Tech features:

* API key protected
* One route (with O(1) routing)
* Protocol buffers for requests and responses
* Schema validation
* Ability to easily change database type
* Fully internationalized (just add translations  to `app/lib/translations/locales`)

## API Clients

All requests should have following headers:

* X-API-Key
* Accept `application/x-protobuf`

User's request should have additional token:

* Authorization `Bearer ...`

The request schemas are in `app/lib/schemas/requests`

All API responses have `Action` header with `messageType` for frontend decoding.

All request from frontend should have `Action` header for routing.

## Technologies

* AWS Lambda via [serverless framework](https://serverless.com/)
* AWS S3 (as database) via [Amplify](https://github.com/aws-amplify/amplify-js)
* [Protocol Buffers](https://developers.google.com/protocol-buffers) (backend - frontend communication)
* [Node.js](https://github.com/nodejs/node)
* Social signup/ signin via [Auth0](https://auth0.com/)
* [Yup](https://github.com/jquense/yup) for schema validation

## Install

```bash
npm install -g serverless
npm i
```

## Deploy

```bash
# Create S3 bucket:
node init/
npm run deploy
```

## Test

```bash
# Local tests:
npm run offline
npm run test

# Live logs:
serverless invoke -f users-cubed-api-next -l
serverless logs -f users-cubed-api-next -t -s production -e production
```

## Previous versions

* [React starter API](https://github.com/TalaikisInc/react_starter_api)
* [Users Cubed](https://github.com/TalaikisInc/users-cubed)
* [Users Cubed S3](https://github.com/TalaikisInc/users-cubed-s3)

## Frontend

...

## Possible improvements

* Encryption password for each user (using Vault or KMS)
* Move to JSON repositories with S3 Select for more complex schema and query models
* Throthling eror 429 status code (client side reporting)

## Licence

GPL v3
