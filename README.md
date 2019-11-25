# Users Cubed

This is the 4th generation user management/ CMS system for rapid project starts.

System is easily expandable with `actions` and uses only one route `/`,  making development for both frontend and backend parts fast and easy.

## STATUS

This repo is in development.

## Technologies

* AWS Lambda
* AWS S3 (as database)
* [Node.js](https://github.com/nodejs/node)

## Requirements

* AWS Lambda running Node 8.10+
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

## Licence
