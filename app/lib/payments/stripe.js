import { STRIPE_TEST_SECRET, STRIPE_LIVE_SECRET, STRIPE_ACCOUNT, STRIPE_WEBHOOK_SECRET } from '../../config'
const SECRET = process.env.STRIPE_ENV === 'production' ? STRIPE_LIVE_SECRET : STRIPE_TEST_SECRET
const stripe = require('stripe')(SECRET, {
  maxNetworkRetries: 2
})

export const createCustomer = async (email) => {
  return await stripe.customers.create({
    email
  })
}

export const createSource = async (customer) => {
  return await stripe.customers.createSource(customer.id, {
    source: 'tok_visa'
  })
}

export const createCharge = async (email, amount, currency) => {
  const customer = await createCustomer(email)
  const source = await createSource(customer)
  return await stripe.charges.create({
    amount,
    currency,
    customer: source.customer
  })
}

export const getBalance = async () => {
  return await stripe.balance
    .retrieve({
      stripeAccount: STRIPE_ACCOUNT
    })
}

export const getCustomers = async () => {
  return await stripe.customers.list()
}

export const webhook = async (req, done) => {
  const sig = req.headers['stripe-signature']
  try {
    const event = await stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET)
    done(event)
  } catch (err) {
    done(err)
  }
}

export const getEvent = (body, done) => {
  try {
    stripe.events.retrieve(body.id, (err, event) => {
      if (!err && event) {
        done(null, event.type ? event.type : '')
      } else {
        done(err.message)
      }
    })
  } catch (err) {
    done(err.message)
  }
}
