import AWS from 'aws-sdk'

const sns = new AWS.SNS()

export const createTopic = (name, done) => {
  const params = { Name: name }
  return sns.createTopic(params).promise()
}

export const createPushApp = (name, platform) => {
  const params = {
    Attributes: { /* required */
          '<String>': 'STRING_VALUE',
          /* '<String>': ... */
    },
    Name: name,
    Platform: platform || 'FCM'
  }

  return sns.createPlatformApplication(params).promise()
}

const createPushEndpoint = (appArn, deviceToken, done) => {
  const params = {
    PlatformApplicationArn: appArn,
    Token: deviceToken
  }

  return sns.createPlatformEndpoint(params).promise()
}

const subscribeToPushTopic = (endpointArn, topicArn) => {
  const params = {
    Protocol: 'application',
    TopicArn: topicArn,
    Endpoint: endpointArn
  }

  return sns.subscribe(params).promise()
}

export const subscribe = (appArn, deviceToken) => {
  return createPushEndpoint(appArn, deviceToken).then((result) => {
    return subscribeToPushTopic(result.EndpointArn)
  })
}
