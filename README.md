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

/// Throthling eror 429 status code

## Technologies

* AWS Lambda via [serverless framework](https://serverless.com/)
* AWS S3 (as database) via [Amplify](https://github.com/aws-amplify/amplify-js)
* [Protocol Buffers](https://developers.google.com/protocol-buffers) (backend - frontend communication)
* [Node.js](https://github.com/nodejs/node)
* Social signup/ signin via [Auth0](https://auth0.com/)

## Requirements

* AWS Lambda running Node
* AWS API Gateway using Proxy Integration

```bash
npm install -g serverless @aws-amplify/cli
```

## Previous versions

* [React starter API](https://github.com/TalaikisInc/react_starter_api)
* [Users Cubed](https://github.com/TalaikisInc/users-cubed)
* [Users Cubed S3](https://github.com/TalaikisInc/users-cubed-s3)

## Frontend

## Deploy

```bash
sls deploy
# test:
sls deploy --env test
```

## Test

## Possible improvements

* S3 Select for more complex data
* S3 partitioning
* DynamoDb as a database option
* Json-SQL for nested data, joins
* Implement multiple access rules for other than owner users
* Encryption password for each user (using Vault or KMS)
* JSON SQL (lib/json-sql)

## Licence

GPL v3
