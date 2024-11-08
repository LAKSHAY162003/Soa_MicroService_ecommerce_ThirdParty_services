
require('dotenv').config();
const mongoose=require("mongoose");
const express = require('express');
const { ethers } = require("ethers");
const cors = require("cors")

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
    cors({
      origin: "*",
      credentials: true, //access-control-allow-credentials:true
      optionSuccessStatus: 200,
    })
  )

const User = require("./modal/User");
const Payment = require('./modal/Payment');
// unique id of user , text , rating 
app.post("/payment", async (req, res) => {
    try {
        const { amount,userId } = req.body;
        console.log(amount+" "+userId);
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create a new feedback document
        const payment = new Payment({
            amount,
            User: userId
        });

        // Save the feedback to the database
        await payment.save();
        console.log("Payment made successfully !! ");
        
        // now send the notification to the user for making the payment !! 
        const notificationResponse = await fetch("http://localhost:3002/notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text:"Payment Made successfully !!",
                userId// replace with a valid user ID
            })
        });

        if (!notificationResponse.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await notificationResponse.json();
        console.log("Notification Send !!", data);

        res.status(201).json({ message: "Payment made successfully as well as Notification Send Successfully !!", payment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error making Payment or while sending notification !!", error });
    }
});


const PORT=3003;
app.set("port", process.env.port || 3003)
app.listen(app.get("port"), async() => {
  try{     
    console.log(`Payment service running on port ${PORT}`)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDbConnected`);
    }
    catch(error){
        console.log("Unsucess :"+error);
    }
});