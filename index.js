const express = require("express")
const mqtt = require('mqtt')
const admin = require("firebase-admin");

const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express()
const firestore = admin.firestore()

const client = mqtt.connect("mqtt://202.148.1.57:1883", {
  username: "app-smartlaundrysystem",
  password: "CcxohtT0HSWn6QzEX6YsV48J9KyES7"
})

client.on("connect", () => {
  console.log("Connected to Xirka server!")

  client.subscribe('ESP32ToPublish', (error) => {
    if (!error) {
      console.log("Subscribed to Xirka device")
    } else {
      console.log(error)
    }
  })
})

client.on("message", (topic, message) => {
  console.log(`Received message, topic: ${topic}`, message.toString())
  firestore.collection('laundries').add({
    ...JSON.parse(message.toString()).payload,
    status: "received"
  })
})

app.get("/", (request, response) => {
  response.send(`Laundry Box server is ${client.connected ? "connected" : "not connected"} to Xirka IoT Platform`)
})

app.get("/data", async (request, response) => {
  const results = await firestore.collection('laundries').get();
  const laundries = results.docs.map(result => result.data())
  response.send(laundries)
})

app.post("/confirm", (request, response) => {
  if (client.connected) {
    console.log({ request, response })
    client.publish(
      "ESP32ToSubscribe",
      JSON.stringify({
        payload: {
          status: 1
        }
      })
    )
    console.log("Confirmed")
    response.status(200).send("Confirmed")
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`Laundry Box server listening at http://localhost:${process.env.PORT || 3000}`)
})