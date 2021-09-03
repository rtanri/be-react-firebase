require('dotenv').config()
const express = require('express')
var firebaseAdmin = require('firebase-admin');
const stripeSDK = require('stripe')

const app = express()
const port = 4000


app.use(express.urlencoded({ extended: true }))

// init firebase admin
firebaseAdmin.initializeApp({
      credential: admin.credential.applicationDefault(),
});

// init stripe sdk
const stripe = stripeSDK(process.env.STRIPE_SECRET_KEY)
let stripeConnectionToken = stripe.terminal.connectionTokens.create();


app.post('/payment', (req, res) => {

})

app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
})