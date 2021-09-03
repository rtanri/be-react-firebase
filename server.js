require('dotenv').config()
const express = require('express')
var firebaseAdmin = require('firebase-admin');
const stripeSDK = require('stripe')

const app = express()
const port = 4000


app.use(express.urlencoded({ extended: true }))

// init firebase admin
// firebaseAdmin.initializeApp({
//       credential: firebaseAdmin.credential.applicationDefault(),
// });
var serviceAccount = require("./gallery-exhibitor-app-f2004-firebase-adminsdk-ft4n5-bdce6d439a.json");

firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount),
      databaseURL: "https://gallery-exhibitor-app-f2004-default-rtdb.asia-southeast1.firebasedatabase.app"
});


// init stripe sdk
const stripe = stripeSDK(process.env.STRIPE_SECRET_KEY)
let stripeConnectionToken = stripe.terminal.connectionTokens.create();


app.post('/payment', async (req, res) => {

      // verify the payment method from stripe
      const paymentMethodID = req.body.payment_method_id
      if (!paymentMethodID) {
            res.statusCode = 400
            return res.json()
      }

      // verify if user is login or not
      const authToken = req.body.auth_token
      if (!authToken) {
            res.statusCode = 401
            return res.json()
      }

      const checkedToken = await firebaseAdmin.auth().verifyIdToken(authToken, true)

      // try find customer in firestore, create stripe customer if not found
      let user = await firebaseAdmin.firestore().collection('users').doc(checkedToken.user_id).get()

      if (!user) {
            // create new customer in stripe retrieve the custmoer
            const customer = await stripe.customers.create({
                  description: 'My First Test Customer (created for API docs)',
            });
            // create new user in firestore
            user = {
                  user_id: checkedToken.user_id,
                  stripe_id: customer.id
            }
            user = await firebaseAdmin.firestore().collection('users').doc(checkedToken.user_id).set(user)
      }


      // return res.json(checkedToken) // -> will return checked token

      // // accepting payment intent
      // const intent = await stripe.paymentIntents.create({
      //       amount: 1000, //cent
      //       currency: 'sgd',
      //       payment_method: paymentMethodID
      // });

      // // process payment intent
      // const processedIntent = await stripe.terminal.processPayment(paymentIntent)

      return res.json(checkedToken)
})

app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
})