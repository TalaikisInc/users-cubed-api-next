import AWS from 'aws-sdk'
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

export const enQueue = (accountId, queueName, msg, done) => {
  const params = {
    MessageBody: JSON.stringify(JSON.stringify(msg)),
    QueueUrl: `https://sqs.us-east-1.amazonaws.com/${accountId}/${queueName}`
  }

  sqs.sendMessage(params, (err, data) => {
    if (err) {
      done(err)
    } else {
      done(null, data)
    }
  })
}

export const queueWorker = (accountId, queueName, done) => {
  const queueUrl = `https://sqs.us-east-1.amazonaws.com/${accountId}/${queueName}`
  const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
    VisibilityTimeout: 0,
    WaitTimeSeconds: 0
  }

  sqs.receiveMessage(params, (err, data) => {
    if (err) {
      done(err)    
    } else {
      if (!data.Message) { 
        done('Nothing to process')
      }

      const body = JSON.parse(data.Messages[0].Body)
      const deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      }

      sqs.deleteMessage(deleteParams, (err, data) => {
        if (err) {
          done(err)
        } else {
          done(null, body)
        }
      })
    }
  })
}
