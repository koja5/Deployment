const express = require("express");
const router = express.Router();

// Load and initialize MesageBird SDK
// var messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);
const messagebird = require("messagebird")("NOJQkUMZM9ssIaEZNSBxxEA4F", null, [
  "ENABLE_CONVERSATIONSAPI_WHATSAPP_SANDBOX",
]);

// Set up and configure the Express framework

router.get("/", (req, res) => {
  res.send("Initialize mongodb!");
});

router.post("/sendSMS", function (req, res) {
  console.log("Test");
  // Check if phone number is valid
  messagebird.lookup.read(
    req.body.number,
    process.env.COUNTRY_CODE,
    function (err, response) {
      console.log(err);
      console.log(response);

      if (err && err.errors[0].code == 21) {
        // This error code indicates that the phone number has an unknown format
        res.send("You need to enter a valid phone number!");
      } else if (err) {
        // Some other error occurred
        res.send("Something went wrong while checking your phone number!");
      } else if (response.type != "mobile") {
        // The number lookup was successful but it is not a mobile number
        res.send(
          "You have entered a valid phone number, but it's not a mobile number! Provide a mobile number so we can contact you via SMS."
        );
      } else {
        // Everything OK

        // Schedule reminder 3 hours prior to the treatment
        var reminderDT = appointmentDT.clone().subtract({ hours: 3 });

        // Send scheduled message with MessageBird API
        messagebird.messages.create(
          {
            originator: "ClinicNode",
            recipients: [response.number], // normalized phone number from lookup request
            body: req.body.message,
          },
          function (err, response) {
            if (err) {
              // Request has failed
              res.send("Error occured while sending message!");
            } else {
              /*// Request was successful
              console.log(response);

              // Create and persist appointment object
              var appointment = {
                number: req.body.number,
                body: req.body.message
              };
              AppointmentDatabase.push(appointment);

              // Render confirmation page
              res.render("confirm", appointment);*/
              res.send(true);
            }
          }
        );
      }
    }
  );
});

module.exports = router;
