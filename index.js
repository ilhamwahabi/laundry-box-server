const express = require("express")
const mqtt = require('mqtt')
const axios = require('axios')

const app = express()

const client = mqtt.connect("mqtt://202.148.1.57:1883", {
  username: "app-smartlaundrysystem",
  password: "CcxohtT0HSWn6QzEX6YsV48J9KyES7"
})

client.on("connect", () => {
  console.log("Connected to Xirka server!")

  client.subscribe('ESP32ToSubscribe', (error) => {
    console.log("Subscribed to Xirka device")
  })
})

client.on("message", (topic, message) => {
  console.log("Received message", { topic, message })
})

app.get("/", (request, response) => {
  response.send(`Laundry Box server is ${client.connected ? "connected" : "not connected"} to Xirka IoT Platform`)
})

app.post("/confirm", (request, response) => {
  if (client.connected) {
    client.publish("ESP32ToPublish", {
      payload: {
        status: 1
      }
    })
  }
})

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:${3000}`)
})