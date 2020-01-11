import PushNotifications from 'node-pushnotifications';
import { promisify } from 'util'
import webPush from 'web-push'

import { COMPANY, WAPID_PUBLIC, WAPID_PRIVATE, WAPID_EMAIL } from '../../config'

const _multiPush = (title, registrationIds, done) => {
  const settings = {
    gcm: {
      id: null,
      phonegap: false
    },
    apn: { 
      token: {
        key: './certs/key.p8',
        keyId: 'ABCD',
        teamId: 'EFGH'
      },
      production: false
    },
    adm: {
      client_id: null,
      client_secret: null
    },
    wns: {
      client_id: null,
      client_secret: null,
      notificationMethod: 'sendTileSquareBlock'
    },
    web: {
      vapidDetails: {
        subject: '< \'mailto\' Address or URL >',
        publicKey: '< URL Safe Base64 Encoded Public Key >',
        privateKey: '< URL Safe Base64 Encoded Private Key >',
      },
      gcmAPIKey: 'gcmkey',
      TTL: 2419200,
      contentEncoding: 'aes128gcm',
      headers: {}
    },
    isAlwaysUseFCM: false
  }

  const push = new PushNotifications(settings)

  const data = {
    title,
    body: `Powered by ${COMPANY}`,
    custom: {
      sender: COMPANY
    },
    expiry: Math.floor(Date.now() / 1000) + 28 * 86400,
    timeToLive: 28 * 86400,
  }

  push.send(registrationIds, data)
    .then((results) => done(null, results))
    .catch((err) => done(err))
}

export const multiPush = promisify(_multiPush)

const _subscribe = (event, done) => {
  webPush.setVapidDetails(`mailto:${WAPID_EMAIL}`, WAPID_PUBLIC, WAPID_PRIVATE)
  const subscription = event.body
  const o = {
    title: event.body.title
  }

  webPush.sendNotification(subscription, JSON.stringify(o)).catch((e) => done(e))
  done()
}

export const subscribe = promisify(_subscribe)
