// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
//const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const session = require('express-session');
const morgan = require('morgan');
// Get our API routes
const api = require('./server/routes/api');
const mongo = require('./server/routes/mongodb')
const accessControl = require('./server/routes/accessControl')
const mail = require('./server/routes/mailAPI');
const cors = require('cors')
const app = express();
var multer = require('multer');
const mysql = require('mysql');
var fs = require("fs");
var schedule = require('node-schedule');
var eventConfirm = require('./server/routes/eventConfirm');
var reminderViaEmail = require('./server/routes/reminderViaEmail');
var reminderViaSMS = require('./server/routes/reminderViaSMS');
const deleteSMSTextFileFromFS = require("./server/routes/helpers/deleteSMSTextFileFromFS");

var connection = mysql.createPool({
    host: '116.203.85.82',
    user: 'appprodu_appproduction',
    password: 'CJr4eUqWg33tT97mxPFx',
    database: 'appprodu_management'
})


//for upload image
app.use(function(req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://app-production.eu:8080");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

const corsOptions = {
   origin: ["http://app-production.eu:8080"],
   credentials: true,
   methods: "POST, PUT, OPTIONS, DELETE, GET",
   allowedHeaders: "X-Requested-With, Content-Type"
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions));

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './server/routes/uploads/'); //./src/assets/uploads
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});

var upload = multer({ //multer settings
                storage: storage
            }).single('file');

            
app.post('/upload', function (req, res) {
  upload(req, res, function (err) {
    connection.getConnection(function (err, conn) {
      if (err) {
        res.json({
          "code": 100,
          "status": "Error in connection database"
        });
        return;
      }

      var test = {};
      var doc = {
        'customer_id': req.body.customer_id,
        'name': req.file.originalname,
        'type': req.file.mimetype,
        'size': req.file.size,
        'date': req.body.date,
        'description': req.body.description,
        'filename': req.file.filename,
        'path': req.file.path
      }

      conn.query("insert into documents SET ?", doc, function (err, rows) {
        conn.release();
        if (!err) {
          if (!err) {
            test.id = rows.insertId;
            test.success = true;
          } else {
            test.success = false;
          }
          res.json(test);
        } else {
          res.json({
            "code": 100,
            "status": "Error in connection database"
          });
          console.log(err);
        }
      });
      conn.on('error', function (err) {
        console.log("[mysql error]", err);
      });
    });
  });
});

// Parsers for POST data
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: "management", resave: false, saveUninitialized: true, cookie: { maxAge: 1000 * 300 * 30 } }));
// loguje svaki zahtev u konzolurs
app.use(morgan('dev'));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'src')));

// Set our api routes
app.use('/api', api);
app.use('/api', mail);
app.use('/api', mongo);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3030';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

var rule = new schedule.RecurrenceRule();
rule.minute = 5;
var j = schedule.scheduleJob('59 23 * * *', function(){
  eventConfirm();
});

var j = schedule.scheduleJob('30 01 * * *', function(){
  reminderViaEmail();
});

var j = schedule.scheduleJob('28 13 * * *', function(){
  reminderViaSMS();
});

var j = schedule.scheduleJob('00 03 * * *', function(){
  deleteSMSTextFileFromFS()
});

 
server.listen(port, () => console.log("Success!"));
server.timeout = 500000;