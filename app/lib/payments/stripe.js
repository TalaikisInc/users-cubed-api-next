export const stripe = (event, context, done) => {
  const stage = event.requestContext ? event.requestContext.stage : 'test'
  const stripeApiKey = stage === 'test' ? process.env.STRIPE_TEST_SECRET : process.env.STRIPE_LIVE_SECRET
  const stripe = require('stripe')(stripeApiKey)
  try {
    const jsonData = JSON.parse(event.body)

    // Verify the event by fetching it from Stripe
    console.log("Stripe Event: %j", jsonData); // eslint-disable-line
    stripe.events.retrieve(jsonData.id, (err, stripeEvent) => {
      const eventType = stripeEvent.type ? stripeEvent.type : '';
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Stripe webhook incoming!',
          stage: requestContextStage,
        }),
      };
      console.log("Event Type: %j", eventType); // eslint-disable-line

      // Branch by event type
      switch (eventType) {
        case 'invoice.created':
          // invoice.created event
          break;
        default:
          break;
      }
      callback(null, response);
    });
  } catch (err) {
    callback(null, {
      statusCode: err.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Internal server error',
    });
  }
}

/*
stripe.createToken({
    card: {
      "number": '4242424242424242',
      "exp_month": 12,
      "exp_year": 2018,
      "cvc": '123'
    }
  });

  import React from 'react';
var stripe = require('stripe-client')('YOUR_PUBLISHABLE_STRIPE_API_KEY');
 
var information = {
  card: {
    number: '4242424242424242',
    exp_month: '02',
    exp_year: '21',
    cvc: '999',
    name: 'Billy Joe'
  }
}
 
export class App extends React.Component {
  async onPayment() {
    var card = await stripe.createToken(information);
    var token = card.id;
    // send token to backend for processing
  }
 
  render() {
    ...
  }
}

import React from 'react';
var stripe = require('stripe-client')('YOUR_PUBLISHABLE_STRIPE_API_KEY');
 
var information = {
  bank_account: {
    country: 'US',
    currency: 'usd',
    account_holder_name: 'Noah Martinez',
    account_holder_type: 'individual',
    routing_number: '110000000',
    account_number: '000123456789'
  }
}
 
export class App extends React.Component {
  async onPayment() {
    var bank = await stripe.createToken(information);
    var token = bank.id;
    // send token to backend for processing
  }
 
  render() {
    ...
  }
}


var stripe = require('stripe-client')('YOUR_PUBLISHABLE_STRIPE_API_KEY');
 
var information = {
  pii: {
    personal_id_number: '000000000'
  }
}
 
export class App extends React.Component {
  async onPayment() {
    var pii = await stripe.createToken(information);
    var token = pii.id;
    // send token to backend for processing
  }
 
  render() {
    ...
  }
}
*/
