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

* API key protected
* One route (Redux like actions)
* Protocol buffers for requests and responses
* Ability to easily change database type
* Encrypted data

## API Clients

All requests should have following headers:

* X-API-Key
* Accept application/x-protobuf

## Technologies

* AWS Lambda via [serverless framework](https://serverless.com/)
* AWS S3 (as database) via [Amplify](https://github.com/aws-amplify/amplify-js)
* [Protocol Buffers](https://developers.google.com/protocol-buffers) (backend - frontend communication)
* [Node.js](https://github.com/nodejs/node)
* Social signup/ signin via [Auth0](https://auth0.com/)

## Requirements

```bash
npm install -g serverless
```

## Previous versions

* [React starter API](https://github.com/TalaikisInc/react_starter_api)
* [Users Cubed](https://github.com/TalaikisInc/users-cubed)
* [Users Cubed S3](https://github.com/TalaikisInc/users-cubed-s3)

## Frontend

...

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
serverless logs -f users-cubed-api-next -t
```

## Possible improvements

* Encryption password for each user (using Vault or KMS)
* JSON SQL (lib/json-sql)
* Throthling eror 429 status code (client side reporting)

## Licence

GPL v3
