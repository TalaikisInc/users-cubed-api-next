<p align="center">
  <a href="https://talaikis.com/">
    <img alt="Talaikis Ltd." src="https://github.com/TalaikisInc/talaikis.com_react/blob/master/media/logo.png" width="228">
  </a>
</p>

# Users Cubed

This is the 4th generation user management/ CMS system for rapid project starts.

System is easily expandable with `actions` and uses only one route `/`,  making development for both frontend and backend parts fast and easy.

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

User's requests (edit, sign out, profile edit, etc.) should have additional token:

* Authorization `Bearer ...`

The request schemas are in `app/lib/schemas/requests`

All API responses have `Action` header with `messageType` for frontend decoding.

All requests from frontend should have `Action` header for routing.

Dates should be converted with `parseInt(decoded.dateField, 10)`

## Technologies

* AWS Lambda via [serverless framework](https://serverless.com/)
* AWS S3 (as database) via [AWS SDK](https://github.com/aws/aws-sdk-js)
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
# Edit .env.production
# Then:
npm run build:proto
npm run deploy
```

## Test

```bash
# Local tests:
npm run test

# npm run offline 

# Live logs:
serverless invoke -f users-cubed-api-next -l
serverless logs -f users-cubed-api-next -t -s production -e production
```

## Previous versions

* [React starter API](https://github.com/TalaikisInc/react_starter_api)
* [Users Cubed](https://github.com/TalaikisInc/users-cubed)
* [Users Cubed S3](https://github.com/TalaikisInc/users-cubed-s3)

## Frontend

* [Users Cubed Next Frontend](https://github.com/TalaikisInc/users-cubed-next-frontend) - SSR frontend for the API

## Possible improvements / TODO

Primary:

* Finish modules API (1) when creating user -> query for schema (2) finish admin actions
* Test email / password / phone change
* Update existing profile when sign in with social
* Refer. contact, upload, if user[0] is admin tests
* Blog API
* Shop API

Other:

* HTML email templates
* Phone confirm
* Cleanup for old data (not confirmed users) in S3

Nice to have:

* Encryption password for each user (using Vault or KMS)
* Move to JSON repositories with S3 Select for more complex schema and query models
* Move from Auth0 to original clients
* Get users by role

## Licence

GPL v3
