const express = require("express")
const mqtt = require('mqtt')

const app = express()

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
  console.log(`Received message, topic: ${topic}`)
})

app.get("/", (request, response) => {
  response.send(`Laundry Box server is ${client.connected ? "connected" : "not connected"} to Xirka IoT Platform`)
})

app.post("/confirm", (request, response) => {
  if (client.connected) {
    client.publish("ESP32ToSubscribe", {
      payload: {
        status: 1
      }
    })
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`Laundry Box server listening at http://localhost:${process.env.PORT || 3000}`)
})