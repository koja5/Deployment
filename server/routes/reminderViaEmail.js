require("dotenv").config();
const express = require("express");
const router = express.Router();
var sha1 = require("sha1");
const axios = require("axios");
const API = "https://jsonplaceholder.typicode.com";
const mysql = require("mysql");
var fs = require("fs");
const path = require("path");
var nodemailer = require("nodemailer");
var hogan = require("hogan.js");
var request = require("request");
const logger = require("./logger");

var link = process.env.link_api;
var reminderTemplate = fs.readFileSync(
  "./server/routes/templates/reminderForReservation.hjs",
  "utf-8"
);
var compiledTemplate = hogan.compile(reminderTemplate);
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

var connection = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

var smtpTransport = nodemailer.createTransport({
  host: process.env.smtp_host,
  port: process.env.smtp_port,
  secure: process.env.smtp_secure,
  tls: {
    rejectUnauthorized: process.env.smtp_rejectUnauthorized,
  },
  auth: {
    user: process.env.smtp_user,
    pass: process.env.smtp_pass,
  },
});

function reminderViaEmail() {
  connection.getConnection(function (err, conn, res) {
    if (err) {
      res.json({
        code: 100,
        status: "Error in connection database",
      });
      return;
    }
    request(
      link + "/getTranslationByCountryCode/AT",
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          conn.query(
            "SELECT c.email, c.shortname, s.storename, t.start, t.end, us.firstname, us.lastname, th.therapies_title, mr.*, e.allowSendInformation FROM reminder r join tasks t on r.superadmin = t.superadmin join customers c on t.customer_id = c.id join store s on t.storeId = s.id join users us on t.creator_id = us.id join therapy th on t.therapy_id = th.id join mail_reminder_message mr on r.superadmin = mr.superadmin join event_category e on t.colorTask = e.id where c.reminderViaEmail = 1 and r.email = 1 and CAST(t.start AS DATE) = CAST((NOW() + interval 2 DAY) as DATE) and e.allowSendInformation = 1",
            function (err, rows, fields) {
              if (err) {
                logger.log("error", err);
              }
              console.log(rows);
              rows.forEach(function (to, i, array) {
                if (to.email !== null) {
                  var convertToDateStart = new Date(to.start);
                  var convertToDateEnd = new Date(to.end);
                  var startHours = convertToDateStart.getHours();
                  var startMinutes = convertToDateStart.getMinutes();
                  var endHours = convertToDateEnd.getHours();
                  var endMinutes = convertToDateEnd.getMinutes();
                  var date =
                    convertToDateStart.getDate() +
                    "." +
                    (convertToDateStart.getMonth() + 1) +
                    "." +
                    convertToDateStart.getFullYear();
                  var day = convertToDateStart.getDate();
                  var month = monthNames[convertToDateStart.getMonth()];
                  var start =
                    (startHours < 10 ? "0" + startHours : startHours) +
                    ":" +
                    (startMinutes < 10 ? "0" + startMinutes : startMinutes);
                  var end =
                    (endHours < 10 ? "0" + endHours : endHours) +
                    ":" +
                    (endMinutes < 10 ? "0" + endMinutes : endMinutes);
                  var language = JSON.parse(body)["config"];
                  var signatureAvailable = false;
                  if (to.signatureAvailable) {
                    signatureAvailable = true;
                  }
                  var mailOptions = {
                    from: '"ClinicNode" info@app-production.eu',
                    subject: to.mailSubject
                      ? to.mailSubject
                      : language.subjectForReminderReservation,
                    html: compiledTemplate.render({
                      initialGreeting: to.initialGreeting
                        ? to.initialGreeting
                        : language.initialGreeting,
                      introductoryMessageForReminderReservation: to.mailMessage
                        ? to.mailMessage
                        : language.introductoryMessageForReminderReservation,
                      dateMessage: to.mailDate
                        ? to.mailDate
                        : language.dateMessage,
                      timeMessage: to.mailTime
                        ? to.mailTime
                        : language.timeMessage,
                      therapyMessage: to.mailTherapy
                        ? to.mailTherapy
                        : language.therapyMessage,
                      doctorMessage: to.mailDoctor
                        ? to.mailDoctor
                        : language.doctorMessage,
                      storeLocation: to.mailClinic
                        ? to.mailClinic
                        : language.storeLocation,
                      finalGreeting: to.mailFinalGreeting
                        ? to.mailFinalGreeting
                        : language.finalGreeting,
                      signature: !signatureAvailable
                        ? to.mailSignature
                          ? to.mailSignature
                          : language.signature
                        : "",
                      thanksForUsing: to.mailThanksForUsing
                        ? to.mailThanksForUsing
                        : language.thanksForUsing,
                      ifYouHaveQuestion: to.mailIfYouHaveQuestion
                        ? to.mailIfYouHaveQuestion
                        : language.ifYouHaveQuestion,
                      notReply: to.mailNotReply
                        ? to.mailNotReply
                        : language.notReply,
                      copyRight: to.mailCopyRight
                        ? to.mailCopyRight
                        : language.copyRight,
                      firstName: to.shortname,
                      date: date,
                      start: start,
                      end: end,
                      storename: to.storename,
                      therapy: to.therapies_title,
                      doctor: to.lastname + " " + to.firstname,
                      month: month,
                      day: day,
                      signatureStreet:
                        signatureAvailable && to.signatureStreet
                          ? to.signatureStreet
                          : "",
                      signatureZipCode:
                        signatureAvailable && to.signatureZipCode
                          ? to.signatureZipCode
                          : "",
                      signaturePhone:
                        signatureAvailable && to.signaturePhone
                          ? to.signaturePhone
                          : "",
                      signatureEmail:
                        signatureAvailable && to.signatureEmail
                          ? to.signatureEmail
                          : "",
                    }),
                  };

                  mailOptions.to = to.email;
                  smtpTransport.sendMail(
                    mailOptions,
                    function (error, response) {
                      console.log(response);
                      if (error) {
                        logger.log(
                          "error",
                          `Error to sent automate EMAIL REMINDER to EMAIL: ${to.email}. Error: ${error}`
                        );
                      } else {
                        logger.log(
                          "info",
                          `Success sent automate EMAIL REMINDER to EMAIL: ${to.email}.`
                        );
                      }
                    }
                  );
                }
              });
            }
          );
        }
      }
    );
  });
}

module.exports = reminderViaEmail;
