require("dotenv").config();
var express = require("express");
var nodemailer = require("nodemailer");
var router = express.Router();
var sha1 = require("sha1");
var hogan = require("hogan.js");
var fs = require("fs");
const mysql = require("mysql");
var url = require("url");
const logger = require("./logger");

var link = process.env.link_api;
var linkClient = process.env.link_client;
var loginLink = process.env.link_client_login;

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

//slanje maila pri registraciji

router.post("/send", function (req, res) {
  var confirmTemplate = fs.readFileSync(
    "./server/routes/templates/confirmMail.hjs",
    "utf-8"
  );
  var compiledTemplate = hogan.compile(confirmTemplate);
  var verificationLinkButton =
    link + "korisnik/verifikacija/" + sha1(req.body.email);

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body.language?.subjectConfirmMail,
    html: compiledTemplate.render({
      firstName: req.body.shortname,
      verificationLink: verificationLinkButton,
      initialGreeting: req.body.language?.initialGreeting,
      finalGreeting: req.body.language?.finalGreeting,
      signature: req.body.language?.signature,
      thanksForUsing: req.body.language?.thanksForUsing,
      websiteLink: req.body.language?.websiteLink,
      ifYouHaveQuestion: req.body.language?.ifYouHaveQuestion,
      emailAddress: req.body.language?.emailAddress,
      notReply: req.body.language?.notReply,
      copyRight: req.body.language?.copyRight,
      introductoryMessageForConfirmMail:
        req.body.language?.introductoryMessageForConfirmMail,
      confirmMailButtonText: req.body.language?.confirmMailButtonText,
    }),
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    console.log(response);
    if (error) {
      logger.log(
        "error",
        `Error to sent mail for VERIFICATION MAIL on EMAIL: ${req.body.email}. Error: ${error}`
      );
      res.end("error");
    } else {
      logger.log(
        "info",
        `Sent mail for VERIFICATION MAIL for USER: ${req.body.shortname} on EMAIL: ${req.body.email}`
      );
      res.end("sent");
    }
  });
});

router.post("/sendCustomerVerificationMail", function (req, res) {
  var confirmTemplate = fs.readFileSync(
    "./server/routes/templates/confirmMail.hjs",
    "utf-8"
  );
  var compiledTemplate = hogan.compile(confirmTemplate);
  var verificationLinkButton =
    link + "customerVerificationMail/" + sha1(req.body.email);

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body.language?.subjectConfirmMail,
    html: compiledTemplate.render({
      firstName: req.body.shortname,
      verificationLink: verificationLinkButton,
      initialGreeting: req.body.language?.initialGreeting,
      finalGreeting: req.body.language?.finalGreeting,
      signature: req.body.language?.signature,
      thanksForUsing: req.body.language?.thanksForUsing,
      websiteLink: req.body.language?.websiteLink,
      ifYouHaveQuestion: req.body.language?.ifYouHaveQuestion,
      emailAddress: req.body.language?.emailAddress,
      notReply: req.body.language?.notReply,
      copyRight: req.body.language?.copyRight,
      introductoryMessageForConfirmMail:
        req.body.language?.introductoryMessageForConfirmMail,
      confirmMailButtonText: req.body.language?.confirmMailButtonText,
    }),
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    console.log(response);
    if (error) {
      logger.log(
        "error",
        `Error to sent mail for VERIFICATION MAIL on EMAIL: ${req.body.email}. Error: ${error}`
      );
      res.end("error");
    } else {
      logger.log(
        "info",
        `Sent mail for VERIFICATION MAIL for USER: ${req.body.shortname} on EMAIL: ${req.body.email}`
      );
      res.end("sent");
    }
  });
});

router.post("/send1", function (req, res) {
  console.log(req.body.email);
  let broj = sha1(req.body.email);
  let mail =
    "Thank you for registering. We require that you validate your registration to ensure that the email address you entered was correct. This protects against unwanted spam and malicious abuse. Your username is: " +
    req.body.shortname;
  mail += ".\nTo activate your account, simply click on the following link:\n";
  //mail+="http://147.91.204.116:2030/api/korisnik/verifikacija/" + broj + "\n";
  // mail += "http://app-production.eu:8080/api/korisnik/verifikacija/" + broj + "\n";
  mail += "http://localhost:3000/api/korisnik/verifikacija/" + broj + "\n";
  mail += "Best regards,\nTuina Praxis!";

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: "Confirm registration",
    text: mail,
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    console.log(response);
    if (error) {
      console.log(error);
      res.end("error");
    } else {
      console.log("Message sent: " + response.message);
      res.end("sent");
    }
  });
});

//slanje mail-a kada korisnik zaboravi lozinku

router.post("/forgotmail", function (req, res) {
  var confirmTemplate = fs.readFileSync(
    "./server/routes/templates/forgotMail.hjs",
    "utf-8"
  );
  var compiledTemplate = hogan.compile(confirmTemplate);
  var verificationLinkButton =
    loginLink + "/changePassword/" + sha1(req.body.email);

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body.language?.subjectForgotMail,
    html: compiledTemplate.render({
      firstName: req.body.shortname,
      verificationLink: verificationLinkButton,
      initialGreeting: req.body.language?.initialGreeting,
      finalGreeting: req.body.language?.finalGreeting,
      signature: req.body.language?.signature,
      thanksForUsing: req.body.language?.thanksForUsing,
      websiteLink: req.body.language?.websiteLink,
      ifYouHaveQuestion: req.body.language?.ifYouHaveQuestion,
      emailAddress: req.body.language?.emailAddress,
      notReply: req.body.language?.notReply,
      copyRight: req.body.language?.copyRight,
      introductoryMessageForForgotMail:
        req.body.language?.introductoryMessageForForgotMail,
      forgotMailButtonText: req.body.language?.forgotMailButtonText,
    }),
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      logger.log(
        "error",
        `Error to sent mail for FORGOT PASSWORD on EMAIL: ${req.body.email}. Error: ${error}`
      );
      res.end(error);
    } else {
      logger.log(
        "info",
        `Sent mail for FORGOT PASSWORD for USER: ${req.body.shortname} on EMAIL: ${req.body.email}`
      );
      res.end("sent");
    }
  });
});

router.post("/askQuestion", function (req, res) {
  let ime = req.body.ime;
  let naslov = req.body.naslov;
  let email = req.body.email;
  let poruka = req.body.poruka;
  let mail = "Posiljalac: \n" + ime + "\n" + email + "\n\n" + poruka;

  console.log(mail);
  var mailOptions = {
    to: "support@app-production.eu",
    subject: naslov,
    text: mail,
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
      res.send({ message: "error" });
    } else {
      console.log("Message sent: " + response.message);
      res.send({ message: "sent" });
    }
  });
});

router.post("/sendConfirmArrivalAgain", function (req, res) {
  connection.getConnection(function (err, conn) {
    var confirmTemplate = fs.readFileSync(
      "./server/routes/templates/confirmArrival.hjs",
      "utf-8"
    );
    var compiledTemplate = hogan.compile(confirmTemplate);
    if (err) {
      res.json({
        code: 100,
        status: "Error in connection database",
      });
      return;
    }

    conn.query(
      "SELECT c.shortname, c.email as customer_email, s.*, t.start, t.end, u.lastname, u.firstname, th.therapies_title, c.storeId from customers c join tasks t on c.id = t.customer_id join therapy th on t.therapy_id = th.id join store s on t.storeId = s.id  join users u on t.creator_id = u.id join event_category e on t.colorTask = e.id where c.id = ? and t.id = ? and e.allowSendInformation = 1",
      [req.body.customer_id, req.body.id],
      function (err, rows, fields) {
        if (err) {
          console.error("SQL error:", err);
        }

        rows.forEach(function (to, i, array) {
          console.log(to);
          conn.query(
            "select * from mail_confirm_arrival where superadmin = ?",
            [to.storeId],
            function (err, mailMessage, fields) {
              if (err) {
                console.error("SQL error:", err);
              }
              var mail = {};
              var signatureAvailable = false;
              if (mailMessage.length > 0) {
                mail = mailMessage[0];
                if (mail.signatureAvailable) {
                  signatureAvailable = true;
                }
              }
              console.log(mail);
              var verificationLinkButton =
                link + "task/confirmationArrival/" + req.body.id;
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
              console.log(day);
              var month = monthNames[convertToDateStart.getMonth()];
              var day = convertToDateStart.getDate();
              var start =
                (startHours < 10 ? "0" + startHours : startHours) +
                ":" +
                (startMinutes < 10 ? "0" + startMinutes : startMinutes);
              var end =
                (endHours < 10 ? "0" + endHours : endHours) +
                ":" +
                (endMinutes < 10 ? "0" + endMinutes : endMinutes);
              console.log(mail);
              console.log(to);
              var mailOptions = {
                from: '"ClinicNode" support@app-production.eu',
                subject: mail.mailSubject
                  ? mail.mailSubject
                  : req.body.language?.subjectConfirmArrival,
                html: compiledTemplate.render({
                  firstName: to.shortname,
                  verificationLink: verificationLinkButton,
                  date: mail.mailDate ? date : "",
                  start: mail.mailTime ? start + " - " : "",
                  end: mail.mailTime ? end : "",
                  therapy: to.therapies_title,
                  storename: mail.mailClinic ? to.storename : "",
                  doctor: to.lastname + " " + to.firstname,
                  month: month,
                  day: day,
                  initialGreeting: mail.mailInitialGreeting
                    ? mail.mailInitialGreeting
                    : req.body.language?.initialGreeting,
                  finalGreeting: mail.mailFinalGreeting
                    ? mail.mailFinalGreeting
                    : req.body.language?.finalGreeting,
                  signature:
                    signatureAvailable && mail.mailSignature
                      ? mail.mailSignature
                      : "",
                  thanksForUsing: mail.mailThanksForUsing
                    ? mail.mailThanksForUsing
                    : req.body.language?.thanksForUsing,
                  websiteLink: req.body.language?.websiteLink,
                  ifYouHaveQuestion: mail.mailIfYouHaveQuestion
                    ? mail.mailIfYouHaveQuestion
                    : req.body.language?.ifYouHaveQuestion,
                  emailAddress: req.body.language?.emailAddress,
                  notReply: mail.mailNotReply
                    ? mail.mailNotReply
                    : req.body.language?.notReply,
                  copyRight: mail.mailCopyRight
                    ? mail.mailCopyRight
                    : req.body.language?.copyRight,
                  introductoryMessageForConfirmArrival:
                    req.body.language?.introductoryMessageForConfirmArrival,
                  dateMessage: mail.mailDate ? mail.mailDate + " " : "",
                  timeMessage: mail.mailTime ? mail.mailTime + " " : "",
                  storeLocation: mail.mailClinic ? mail.mailClinic + " " : "",
                  therapyMessage: req.body.language?.therapyMessage,
                  doctorMessage: req.body.language?.doctorMessage,
                  finalMessageForConfirmArrival: mail.mailMessage
                    ? mail.mailMessage
                    : req.body.language?.finalMessageForConfirmArrival,
                  confirmArrivalButtonText:
                    req.body.language?.confirmArrivalButtonText,
                  signatureAddress:
                    signatureAvailable &&
                    mail.signatureAddress &&
                    (to.street || to.zipcode || to.place)
                      ? mail.signatureAddress +
                        "\n" +
                        to.street +
                        "\n" +
                        to.zipcode +
                        " " +
                        to.place
                      : "",
                  signatureTelephone:
                    signatureAvailable &&
                    mail.signatureTelephone &&
                    to.telephone
                      ? mail.signatureTelephone + " " + to.telephone
                      : "",
                  signatureMobile:
                    signatureAvailable && mail.signatureMobile && to.mobile
                      ? mail.signatureMobile + " " + to.mobile
                      : "",
                  signatureEmail:
                    signatureAvailable && mail.signatureEmail && to.email
                      ? mail.signatureEmail + " " + to.email
                      : "",
                }),
              };
              mailOptions.to = to.customer_email;
              smtpTransport.sendMail(mailOptions, function (error, response) {
                console.log(response);
                if (error) {
                  logger.log(
                    "error",
                    `Error to sent mail for CONFIRM ARRIVAL for USER: ${to.shortname} on EMAIL: ${to.email}. Error: ${error}`
                  );
                  res.send(error);
                } else {
                  logger.log(
                    "info",
                    `Sent mail for CONFIRM ARRIVAL for USER: ${to.shortname} on EMAIL: ${to.email}`
                  );
                  res.send(true);
                }
              });
            }
          );
        });
      }
    );
    conn.on("error", function (err) {
      console.log("[mysql error]", err);
    });
  });
});

router.post("/sendPatientFormRegistration", function (req, res) {
  var patientRegistrationFormTemplate = fs.readFileSync(
    "./server/routes/templates/patientRegistrationForm.hjs",
    "utf-8"
  );
  var patientRegistrationForm = hogan.compile(patientRegistrationFormTemplate);
  connection.getConnection(function (err, conn) {
    conn.query(
      "select mr.* from customers c join mail_patient_form_registration mr on c.storeId = mr.superadmin where c.email = ?",
      [req.body.email],
      function (err, mailMessage, fields) {
        if (err) {
          res.json(false);
        }
        var mail = {};
        var signatureAvailable = false;
        if (mailMessage.length > 0) {
          mail = mailMessage[0];
          if (mail.signatureAvailable) {
            signatureAvailable = true;
          }
        }
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: req.body.email,
          subject: mail.mailSubject
            ? mail.mailSubject
            : req.body.langauge?.subjectFormRegistration,
          html: patientRegistrationForm.render({
            link: req.body.link,
            initialGreeting: mail.mailInitialGreeting
              ? mail.mailInitialGreeting
              : req.body.language?.initialGreeting,
            finalGreeting: mail.mailFinalGreeting
              ? mail.mailFinalGreeting
              : req.body.language?.finalGreeting,
            signature: !signatureAvailable
              ? mail.mailSignature
                ? mail.mailSignature
                : req.body.language?.signature
              : "",
            thanksForUsing: mail.mailThanksForUsing
              ? mail.mailThanksForUsing
              : req.body.language?.thanksForUsing,
            websiteLink: req.body.language?.websiteLink,
            ifYouHaveQuestion: mail.mailIfYouHaveQuestion
              ? mail.mailIfYouHaveQuestion
              : req.body.language?.ifYouHaveQuestion,
            emailAddress: req.body.language?.emailAddress,
            notReply: mail.mailNotReply
              ? mail.mailNotReply
              : req.body.language?.notReply,
            copyRight: mail.mailCopyRight
              ? mail.mailCopyRight
              : req.body.language?.copyRight,
            introductoryMessageForPatientRegistrationForm: mail.mailMessage
              ? mail.mailMessage
              : req.body.language
                  ?.introductoryMessageForPatientRegistrationForm,
            openForm: req.body.language?.openForm,
            signatureStreet:
              signatureAvailable && mail.signatureStreet
                ? mail.signatureStreet
                : "",
            signatureZipCode:
              signatureAvailable && mail.signatureZipCode
                ? mail.signatureZipCode
                : "",
            signaturePhone:
              signatureAvailable && mail.signaturePhone
                ? mail.signaturePhone
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail
                ? mail.signatureEmail
                : "",
          }),
        };

        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            logger.log(
              "error",
              `Error to sent mail for PATIENT FORM REGISTRATION on EMAIL: ${req.body.email}`
            );
            res.send(false);
          } else {
            logger.log(
              "info",
              `Sent mail for PATIENT FORM REGISTRATION on EMAIL: ${req.body.email}`
            );
            res.send(true);
          }
        });
      }
    );
  });
});

router.post("/sendInfoToPatientForCreatedAccount", function (req, res) {
  console.log(req.body);
  var infoCreatedTemplate = fs.readFileSync(
    "./server/routes/templates/infoForCreatedPatientAccount.hjs",
    "utf-8"
  );
  var infoForCreatedAccount = hogan.compile(infoCreatedTemplate);
  connection.getConnection(function (err, conn) {
    conn.query(
      "select mr.* from customers c join mail_patient_created_account mr on c.storeId = mr.superadmin where c.id = ?",
      [req.body.id],
      function (err, mailMessage, fields) {
        if (err) {
          res.json(false);
        }
        var mail = {};
        var signatureAvailable = false;
        if (mailMessage.length > 0) {
          mail = mailMessage[0];
          if (mail.signatureAvailable) {
            signatureAvailable = true;
          }
        }
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: req.body.email,
          subject: mail.mailSubject
            ? mail.mailSubject
            : req.body.language?.subjectCreatedPatientForm,
          html: infoForCreatedAccount.render({
            firstname: req.body.firstname,
            email: req.body.email,
            password: req.body.password,
            loginLink: loginLink,
            initialGreeting: mail.mailInitialGreeting
              ? mail.mailInitialGreeting
              : req.body.language?.initialGreeting,
            finalGreeting: mail.mailFinalGreeting
              ? mail.mailFinalGreeting
              : req.body.language?.finalGreeting,
            signature: !signatureAvailable
              ? mail.mailSignature
                ? mail.mailSignature
                : req.body.language?.signature
              : "",
            thanksForUsing: mail.mailThanksForUsing
              ? mail.mailThanksForUsing
              : req.body.language?.thanksForUsing,
            websiteLink: req.body.language?.websiteLink,
            ifYouHaveQuestion: mail.mailIfYouHaveQuestion
              ? mail.mailIfYouHaveQuestion
              : req.body.language?.ifYouHaveQuestion,
            emailAddress: req.body.language?.emailAddress,
            notReply: mail.mailNotReply
              ? mail.mailNotReply
              : req.body.language?.notReply,
            copyRight: mail.mailCopyRight
              ? mail.mailCopyRight
              : req.body.language?.copyRight,
            introductoryMessageForCreatedPatientAccount: mail.mailMessage
              ? mail.mailMessage
              : req.body.language?.introductoryMessageForCreatedPatientAccount,
            linkForLogin: req.body.language?.linkForLogin,
            emailForLogin: req.body.language?.emailForLogin,
            passwordForLogin: req.body.language?.passwordForLogin,
            signatureStreet:
              signatureAvailable && mail.signatureStreet
                ? mail.signatureStreet
                : "",
            signatureZipCode:
              signatureAvailable && mail.signatureZipCode
                ? mail.signatureZipCode
                : "",
            signaturePhone:
              signatureAvailable && mail.signaturePhone
                ? mail.signaturePhone
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail
                ? mail.signatureEmail
                : "",
          }),
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            logger.log(
              "info",
              `Error to sent info for patient created account on EMAIL: ${req.body.email}. Error: ${error}`
            );

            res.send(false);
          } else {
            logger.log(
              "info",
              `Sent info for patient created account on EMAIL: ${req.body.email}`
            );
            res.send(true);
          }
        });
      }
    );
  });
});

router.post("/sendInfoForApproveReservation", function (req, res) {
  console.log(req.body);
  var infoForApproveReservationTemplate = fs.readFileSync(
    "./server/routes/templates/infoForApproveReservation.hjs",
    "utf-8"
  );
  var infoForApproveReservation = hogan.compile(
    infoForApproveReservationTemplate
  );
  connection.getConnection(function (err, conn) {
    conn.query(
      "select mr.* from customers c join mail_approve_reservation mr on c.storeId = mr.superadmin where c.id = ?",
      [req.body.id],
      function (err, mailMessage, fields) {
        if (err) {
          res.json(false);
        }
        var mail = {};
        var signatureAvailable = false;
        if (mailMessage.length > 0) {
          mail = mailMessage[0];
          if (mail.signatureAvailable) {
            signatureAvailable = true;
          }
        }
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: req.body.email,
          subject: mail.mailSubject
            ? mail.mailSubject
            : req.body.language?.subjectApproveReservation,
          html: infoForApproveReservation.render({
            firstname: req.body.firstname,
            email: req.body.email,
            password: req.body.password,
            loginLink: loginLink,
            initialGreeting: mail.mailInitialGreeting
              ? mail.mailInitialGreeting
              : req.body.language?.initialGreeting,
            finalGreeting: mail.mailFinalGreeting
              ? mail.mailFinalGreeting
              : req.body.language?.finalGreeting,
            signature: !signatureAvailable
              ? mail.mailSignature
                ? mail.mailSignature
                : req.body.language?.signature
              : "",
            thanksForUsing: mail.mailThanksForUsing
              ? mail.mailThanksForUsing
              : req.body.language?.thanksForUsing,
            websiteLink: req.body.language?.websiteLink,
            ifYouHaveQuestion: mail.mailIfYouHaveQuestion
              ? mail.mailIfYouHaveQuestion
              : req.body.language?.ifYouHaveQuestion,
            emailAddress: req.body.language?.emailAddress,
            notReply: mail.mailNotReply
              ? mail.mailNotReply
              : req.body.language?.notReply,
            copyRight: mail.mailCopyRight
              ? mail.mailCopyRight
              : req.body.language?.copyRight,
            introductoryMessageForApproveReservation: mail.mailMessage
              ? mail.mailMessage
              : req.body.language?.introductoryMessageForApproveReservation,
            signatureStreet:
              signatureAvailable && mail.signatureStreet
                ? mail.signatureStreet
                : "",
            signatureZipCode:
              signatureAvailable && mail.signatureZipCode
                ? mail.signatureZipCode
                : "",
            signaturePhone:
              signatureAvailable && mail.signaturePhone
                ? mail.signaturePhone
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail
                ? mail.signatureEmail
                : "",
          }),
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            logger.log(
              "error",
              `Error to sent mail for APPROVE RESERVATION on EMAIL: ${req.body.email}`
            );
            res.send(false);
          } else {
            logger.log(
              "info",
              `Sent mail for APPROVE RESERVATION on EMAIL: ${req.body.email}`
            );
            res.send(true);
          }
        });
      }
    );
  });
});

router.post("/sendInfoForDenyReservation", function (req, res) {
  var infoForDenyReservationTemplate = fs.readFileSync(
    "./server/routes/templates/infoForDenyReservation.hjs",
    "utf-8"
  );
  var infoForDenyReservation = hogan.compile(infoForDenyReservationTemplate);
  connection.getConnection(function (err, conn) {
    conn.query(
      "select mr.* from customers c join mail_deny_reservation mr on c.storeId = mr.superadmin where c.id = ?",
      [req.body.id],
      function (err, mailMessage, fields) {
        if (err) {
          res.json(false);
        }
        var mail = {};
        var signatureAvailable = false;
        if (mailMessage.length > 0) {
          mail = mailMessage[0];
          if (mail.signatureAvailable) {
            signatureAvailable = true;
          }
        }
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: req.body.email,
          subject: mail.mailSubject
            ? mail.mailSubject
            : req.body.language?.subjectDenyReservation,
          html: infoForDenyReservation.render({
            firstname: req.body.firstname,
            email: req.body.email,
            password: req.body.password,
            loginLink: loginLink,
            initialGreeting: mail.mailInitialGreeting
              ? mail.mailInitialGreeting
              : req.body.language?.initialGreeting,
            finalGreeting: mail.mailFinalGreeting
              ? mail.mailFinalGreeting
              : req.body.language?.finalGreeting,
            signature: !signatureAvailable
              ? mail.mailSignature
                ? mail.mailSignature
                : req.body.language?.signature
              : "",
            thanksForUsing: mail.mailThanksForUsing
              ? mail.mailThanksForUsing
              : req.body.language?.thanksForUsing,
            websiteLink: req.body.language?.websiteLink,
            ifYouHaveQuestion: mail.mailIfYouHaveQuestion
              ? mail.mailIfYouHaveQuestion
              : req.body.language?.ifYouHaveQuestion,
            emailAddress: req.body.language?.emailAddress,
            notReply: mail.mailNotReply
              ? mail.mailNotReply
              : req.body.language?.notReply,
            copyRight: mail.mailCopyRight
              ? mail.mailCopyRight
              : req.body.language?.copyRight,
            introductoryMessageForDenyReservation: mail.mailMessage
              ? mail.mailMessage
              : req.body.language?.introductoryMessageForDenyReservation,
            signatureStreet:
              signatureAvailable && mail.signatureStreet
                ? mail.signatureStreet
                : "",
            signatureZipCode:
              signatureAvailable && mail.signatureZipCode
                ? mail.signatureZipCode
                : "",
            signaturePhone:
              signatureAvailable && mail.signaturePhone
                ? mail.signaturePhone
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail
                ? mail.signatureEmail
                : "",
          }),
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            logger.log(
              "error",
              `Error to sent mail for DENY RESERVATION on EMAIL: ${req.body.email}`
            );
            res.send(false);
          } else {
            logger.log(
              "info",
              `Sent mail for DENY RESERVATION on EMAIL: ${req.body.email}`
            );
            res.send(true);
          }
        });
      }
    );
  });
});

router.post("/sendEmailToPatient", function (req, res) {
  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: req.body?.subject,
    text: req.body?.content,
  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      logger.log(
        "error",
        `Error to sent personal mail to patient on EMAIL: ${req.body.email}. Error: ${error}`
      );
      res.send(false);
    } else {
      logger.log(
        "info",
        `Sent personal mail to patient on EMAIL: ${req.body.email}`
      );
      res.send(true);
    }
  });
});

router.post("/sendReminderViaEmailManual", function (req, res) {
  var reminderTemplate = fs.readFileSync(
    "./server/routes/templates/reminderForReservation.hjs",
    "utf-8"
  );
  var compiledTemplate = hogan.compile(reminderTemplate);

  var convertToDateStart = new Date(req.body.start);
  var convertToDateEnd = new Date(req.body.end);
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

  connection.getConnection(function (err, conn) {
    conn.query(
      "select mr.*, s.*, s.place as store_place from customers c join mail_reminder_message mr on c.storeId = mr.superadmin join store s on c.storeId = s.superadmin join tasks t on s.id = t.storeId join event_category e on t.colorTask = e.id where c.id = ? and s.id = ? and t.id = ? and e.allowSendInformation = 1",
      [req.body.id, req.body.storeId, req.body.taskId],
      function (err, mailMessage, fields) {
        if (err) {
          res.json(false);
        }
        var mail = {};
        var signatureAvailable = false;
        if (mailMessage.length > 0) {
          mail = mailMessage[0];
          if (mail.signatureAvailable) {
            signatureAvailable = true;
          }
        }
        var mailOptions = {
          from: '"ClinicNode" support@app-production.eu',
          to: req.body.email,
          subject: mail.mailSubject,
          html: compiledTemplate.render({
            initialGreeting: mail?.mailInitialGreeting
              ? mail?.mailInitialGreeting
              : req.body.language?.initialGreeting,
            introductoryMessageForReminderReservation: mail?.mailMessage
              ? mail?.mailMessage
              : req.body.language?.introductoryMessageForReminderReservation,
            dateMessage: mail.mailDate ? mail.mailDate + " " : "",
            timeMessage: mail.mailTime ? mail.mailTime + " " : "",
            storeLocation: mail.mailClinic ? mail.mailClinic + " " : "",
            therapyMessage: mail?.mailTherapy
              ? mail?.mailTherapy
              : req.body.language?.therapyMessage,
            doctorMessage: mail?.mailDoctor
              ? mail?.mailDoctor
              : req.body.language?.doctorMessage,
            finalGreeting: mail?.mailFinalGreeting
              ? mail?.mailFinalGreeting
              : req.body.language?.finalGreeting,
            signature:
              signatureAvailable && mail.mailSignature
                ? mail.mailSignature
                : "",
            thanksForUsing: mail?.mailThanksForUsing
              ? mail?.mailThanksForUsing
              : req.body.language?.thanksForUsing,
            ifYouHaveQuestion: mail?.mailIfYouHaveQuestion
              ? mail?.mailIfYouHaveQuestion
              : req.body.language?.ifYouHaveQuestion,
            notReply: mail?.mailNotReply
              ? mail?.mailNotReply
              : req.body.language?.notReply,
            copyRight: mail?.mailCopyRight
              ? mail?.mailCopyRight
              : req.body.language?.copyRight,
            firstName: req.body.shortname,
            date: mail.mailDate ? date : "",
            start: mail.mailTime ? start + " - " : "",
            end: mail.mailTime ? end : "",
            storename: mail.mailClinic ? req.body.storename : "",
            month: month,
            day: day,
            signatureAddress:
              signatureAvailable &&
              mail.signatureAddress &&
              (mail.street || mail.zipcode || mail.store_place)
                ? mail.signatureAddress +
                  "\n" +
                  mail.street +
                  "\n" +
                  mail.zipcode +
                  " " +
                  mail.store_place
                : "",
            signatureTelephone:
              signatureAvailable && mail.signatureTelephone && mail.telephone
                ? mail.signatureTelephone + " " + mail.telephone
                : "",
            signatureMobile:
              signatureAvailable && mail.signatureMobile && mail.mobile
                ? mail.signatureMobile + " " + mail.mobile
                : "",
            signatureEmail:
              signatureAvailable && mail.signatureEmail && mail.email
                ? mail.signatureEmail + " " + mail.email
                : "",
          }),
        };

        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            logger.log(
              "info",
              `Error to sent reminder via email on EMAIL: ${req.body.email}. Error: ${error}`
            );
            res.send(false);
          } else {
            logger.log(
              "info",
              `Sent reminder via email on EMAIL: ${req.body.email}`
            );
            res.send(true);
          }
        });
      }
    );
  });
});

router.post("/confirmUserViaMacAddress", function (req, res) {
  var template = fs.readFileSync(
    "./server/routes/templates/approveUserAccess.hjs",
    "utf-8"
  );
  var compiledTemplate = hogan.compile(template);

  var convertToDate = new Date(req.body.date);
  var hours = convertToDate.getHours();
  var minutes = convertToDate.getMinutes();
  var date =
    convertToDate.getDate() +
    "." +
    (convertToDate.getMonth() + 1) +
    "." +
    convertToDate.getFullYear();
  var day = convertToDate.getDate();
  var month = monthNames[convertToDate.getMonth()];
  var year = convertToDate.getFullYear();
  var start =
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (hours < 10 ? "0" + hours : hours);

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject: "Neue Geräte bestätigen",
    html: compiledTemplate.render({
      initialGreeting: "Hallo",
      introductoryMessage:
        "Wir möchten Sie darüber informieren, dass wir versuchen, uns mit den untenstehenden Informationen anzumelden. Bitte greifen Sie auf das Dashboard zu und gewähren Sie Zugriff!",
      nameMessage: "Name",
      macAddressMessage: "MAC-Adresse",
      datumMessage: "Registrierungsdatum",
      name: req.body.firstname + " " + req.body.lastname,
      macAddress: req.body.mac_address,
      date: day + "." + month + "." + year + " - " + hours + ":" + minutes,
      month: month,
      day: day,
    }),
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      logger.log(
        "info",
        `Error to sent reminder via email on EMAIL: ${req.body.email}. Error: ${error}`
      );
      res.send(false);
    } else {
      logger.log("info", `Sent reminder via email on EMAIL: ${req.body.email}`);
      res.send(true);
    }
  });
});

router.post("/sendMassiveEMail", function (req, res) {
  var infoForDenyReservationTemplate = fs.readFileSync(
    "./server/routes/templates/sendMassiveMails.hjs",
    "utf-8"
  );
  var infoForDenyReservation = hogan.compile(infoForDenyReservationTemplate);
  var question = "";
  if (question) {
    question += " and ";
  }
  if (req.body.place) {
    question = "c.city = '" + req.body.place + "'";
  }
  if (req.body.male && req.body.female) {
    var male = "'male'";
    var female = "'female'";
    if (question) {
      question += " and c.gender = " + male;
      question += " or c.gender = " + female;
    } else {
      question += "c.gender = " + male;
      question += " or c.gender = " + female;
    }
  } else {
    if (req.body.male) {
      question = "c.gender = 'male'";
    } else if (req.body.female) {
      question = "c.gender = 'female'";
    }
  }

  if (req.body.birthdayFrom) {
    question += "c.birthday <= '" + req.body.birthdayFrom + "'";
  }
  if (req.body.birthdayTo) {
    question += "c.birthday >= '" + req.body.birthdayTo + "'";
  }
  if (req.body.message != "") {
    connection.getConnection(function (err, conn) {
      conn.query(
        "select c.email, mm.* from customers c join mail_massive_message mm on c.storeId = mm.superadmin where (c.email != '' and c.email != null) and c.storeId = " +
          Number(req.body.superadmin) +
          " and " +
          question,
        function (err, rows) {
          if (err) {
            res.json(false);
          }
          console.log(rows);
          rows.forEach(function (to, i, array) {
            var mail = {};
            var signatureAvailable = false;
            mail = to;
            if (mail.signatureAvailable) {
              signatureAvailable = true;
            }
            console.log();
            var mailOptions = {
              from: '"ClinicNode" support@app-production.eu',
              to: to.email,
              subject: req.body.subject,
              html: infoForDenyReservation.render({
                message: req.body.message,
                initialGreeting: mail.mailInitialGreeting
                  ? mail.mailInitialGreeting
                  : req.body.language?.initialGreeting,
                finalGreeting: mail.mailFinalGreeting
                  ? mail.mailFinalGreeting
                  : req.body.language?.finalGreeting,
                signature: !signatureAvailable
                  ? mail.mailSignature
                  : req.body.language?.signature,
                thanksForUsing: mail.mailThanksForUsing
                  ? mail.mailThanksForUsing
                  : req.body.language?.thanksForUsing,
                websiteLink: req.body.language?.websiteLink,
                ifYouHaveQuestion: mail.mailIfYouHaveQuestion
                  ? mail.mailIfYouHaveQuestion
                  : req.body.language?.ifYouHaveQuestion,
                emailAddress: req.body.language?.emailAddress,
                notReply: mail.mailNotReply
                  ? mail.mailNotReply
                  : req.body.language?.notReply,
                copyRight: mail.mailCopyRight
                  ? mail.mailCopyRight
                  : req.body.language?.copyRight,
                introductoryMessageForDenyReservation: mail.mailMessage
                  ? mail.mailMessage
                  : req.body.language?.introductoryMessageForDenyReservation,
                signatureAddress:
                  signatureAvailable && mail.signatureStreet
                    ? mail.signatureStreet
                    : "",
                signatureTelephone:
                  signatureAvailable && mail.signatureTelephone
                    ? mail.signatureZipCode
                    : "",
                signatureMobile:
                  signatureAvailable && mail.signatureTelephone
                    ? mail.signaturePhone
                    : "",
                signatureEmail:
                  signatureAvailable && mail.signatureEmail
                    ? mail.signatureEmail
                    : "",
              }),
            };
            smtpTransport.sendMail(mailOptions, function (error, response) {
              if (error) {
                logger.log(
                  "error",
                  `Error to sent mail for marketing promotion on EMAIL: ${req.body.email}`
                );
                res.send(false);
              } else {
                logger.log(
                  "info",
                  `Sent mail for marketing promotion on EMAIL: ${req.body.email}`
                );
                res.send(true);
              }
            });
          });
        }
      );
    });
  } else {
    logger.log(
      "error",
      `Client don't input message for send massive mails: ${req.body.email}`
    );
    res.send(false);
  }
});

router.post("/infoAboutConfirmDenyAccessDevice", function (req, res) {
  var template = fs.readFileSync(
    "./server/routes/templates/infoAboutUserAccess.hjs",
    "utf-8"
  );
  var compiledTemplate = hogan.compile(template);
  console.log(req.body);
  var convertToDate = new Date(req.body.date);
  var hours = convertToDate.getHours();
  var minutes = convertToDate.getMinutes();
  var date =
    convertToDate.getDate() +
    "." +
    (convertToDate.getMonth() + 1) +
    "." +
    convertToDate.getFullYear();
  var day = convertToDate.getDate();
  var month = monthNames[convertToDate.getMonth()];
  var year = convertToDate.getFullYear();
  var start =
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (hours < 10 ? "0" + hours : hours);

  var mailOptions = {
    from: '"ClinicNode" support@app-production.eu',
    to: req.body.email,
    subject:
      (req.body.access ? "Aktiviert" : "Erloschen") + " ist dein Profil!",
    html: compiledTemplate.render({
      initialGreeting: "Hallo",
      introductoryMessage:
        "Wir informieren Sie, dass Ihr Profil " +
        (req.body.access ? "Aktiviert" : "Erloschen"),
      nameMessage: "Name",
      macAddressMessage: "MAC-Adresse",
      datumMessage: "Registrierungsdatum",
      name: req.body.firstname + " " + req.body.lastname,
      macAddress: req.body.mac_address,
      date: day + "." + month + "." + year + " - " + hours + ":" + minutes,
      month: month,
      day: day,
    }),
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      logger.log(
        "info",
        `Error to sent reminder via email on EMAIL: ${req.body.email}. Error: ${error}`
      );
      res.send(false);
    } else {
      logger.log("info", `Sent reminder via email on EMAIL: ${req.body.email}`);
      res.send(true);
    }
  });
});

module.exports = router;
