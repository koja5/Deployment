require("dotenv").config();
const express = require("express");
const router = express.Router();
const mongo = require("mongodb").MongoClient;
// var assert = require('assert');
const Schema = mongo.Schema;
// const url = 'mongodb://localhost:27017/management_mongodb';
// const url = 'mongodb://appprodu_appproduction_prod:CJr4eUqWg33tT97mxPFx@vps.app-production.eu:42526/management_mongodb'
// const url = "mongodb://116.203.85.82:27017/management_mongo?gssapiServiceName=mongodb";
// const url = "mongodb://admin:1234@localhost:27017/business_circle_mongodb?authSource=admin";
const url = process.env.mongo_url
const database_name = process.env.mongo_db;
var ObjectId = require("mongodb").ObjectID;
const mysql = require("mysql");
var sha1 = require("sha1");

router.get("/", (req, res) => {
  res.send("Initialize mongodb!");
});

router.post("/insertConfiguration", function (req, res, next) {
  var item = {
    user_id: req.body.user_id,
    defaultLanguage: req.body.defaultLanguage,
    theme: req.body.theme,
    events: req.body.events,
    store_users: req.body.store_users,
  };

  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    dbo
      .collection("user_configuration")
      .insertOne(item, function (err, result) {
        console.log("Item inserted!" + result);
      });
  });
});

router.post("/updateLanguage", function (req, res, next) {
  mongo.connect(url, function (err, db, res) {
    if (err) throw err;
    var dbo = db.db(database_name);
    console.log(req.body.language);
    dbo
      .collection("user_configuration")
      .updateOne(
        { user_id: req.body.user_id },
        { $set: { language: req.body.language } },
        function (err, res) {
          if (err) throw err;
        }
      );
  });
  res.json({ code: 201 });
});

router.post("/updateTheme", function (req, res, next) {
  var item = {
    user_id: req.body.user_id,
    theme: req.body.theme,
  };

  mongo.connect(url, function (err, db, res) {
    if (err) throw err;
    var dbo = db.db(database_name);
    dbo
      .collection("user_configuration")
      .updateOne(
        { user_id: item.user_id },
        { $set: { theme: req.body.theme } },
        function (err, res) {
          if (err) throw err;
        }
      );
  });
  res.json({ code: 201 });
});

router.post("/setSelectedStore", function (req, res, next) {
  var item = {
    user_id: req.body.user_id,
    selectedStore: req.body.selectedStore,
  };

  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    dbo
      .collection("user_configuration")
      .findOne({ user_id: Number(req.body.user_id) }, function (err, rows) {
        if (err) throw err;
        console.log(rows);
        if (rows === null || rows.length === 0) {
          dbo
            .collection("user_configuration")
            .updateOne(
              { user_id: item.user_id },
              { $push: { selectedStore: req.body.selectedStore } },
              function (err, res) {
                if (err) throw err;
              }
            );
        } else {
          dbo
            .collection("user_configuration")
            .updateOne(
              { user_id: req.body.user_id },
              { $set: { "selectedStore.0": req.body.selectedStore } },
              function (err, res) {
                if (err) throw err;
              }
            );
        }
      });
  });
  res.json({ code: 201 });
});

router.post("/setSettingsForStore", function (req, res, next) {
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    dbo.collection("user_configuration").findOne(
      {
        user_id: Number(req.body.user_id),
        storeSettings: { $elemMatch: { id: req.body.storeSettings.id } },
      },
      function (err, rows) {
        if (err) throw err;
        if (rows === null || rows.length === 0) {
          dbo
            .collection("user_configuration")
            .updateOne(
              { user_id: req.body.user_id },
              { $push: { storeSettings: req.body.storeSettings } },
              function (err, res) {
                if (err) throw err;
              }
            );
        } else {
          dbo.collection("user_configuration").updateOne(
            {
              user_id: req.body.user_id,
              storeSettings: {
                $elemMatch: { id: req.body.storeSettings.id },
              },
            },
            { $set: { "storeSettings.$": req.body.storeSettings } },
            function (err, res) {
              if (err) throw err;
            }
          );
        }
      }
    );
  });
  res.json(true);
});

router.post("/setUsersFor", function (req, res, next) {
  var item = {
    key: req.body.key,
    value: req.body.value,
  };
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    dbo
      .collection("user_configuration")
      .findOne(
        { usersFor: { $elemMatch: { key: item.key } } },
        function (err, rows) {
          console.log(rows);
          if (err) throw err;
          if (rows === null || rows.length === 0) {
            dbo
              .collection("user_configuration")
              .updateOne(
                { user_id: Number(req.body.user_id) },
                { $push: { usersFor: item } },
                function (err, res) {
                  if (err) throw err;
                }
              );
          } else {
            dbo
              .collection("user_configuration")
              .updateOne(
                { usersFor: { $elemMatch: { key: item.key } } },
                { $set: { "usersFor.$": item } },
                function (err, res) {
                  if (err) throw err;
                }
              );
          }
          res.json(201);
        }
      );
  });
});

router.get("/getConfiguration/:id", function (req, res, next) {
  const id = req.params.id;

  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    dbo
      .collection("user_configuration")
      .findOne({ user_id: Number(id) }, function (err, rows) {
        if (err) throw err;
        res.json(rows);
      });
  });
});

router.post("/createTranslation", function (req, res, next) {
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    dbo.collection("translation").insertOne(req.body, function (err, result) {
      console.log("Item inserted!" + result);
      if (err) {
        throw err;
      } else {
        res.send(true);
      }
    });
  });
});

router.get(
  "/getAllTranslationsByDemoAccount/:demoAccount",
  function (req, res, next) {
    mongo.connect(url, function (err, db) {
      if (err) throw err;
      console.log(req.params.demoAccount);

      var dbo = db.db(database_name);
      dbo
        .collection("translation")
        .find({
          demoAccount:
            req.params.demoAccount !== "null" ? req.params.demoAccount : null,
        })
        .toArray(function (err, rows) {
          if (err) throw err;
          res.json(rows);
        });
    });
  }
);

router.get("/getTranslation", function (req, res, next) {
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    dbo
      .collection("translation")
      .find()
      .toArray(function (err, rows) {
        if (err) throw err;
        console.log(rows);
        res.json(rows);
      });
  });
});

router.get("/getTranslationWithoutConfig", function (req, res, next) {
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    dbo
      .collection("translation")
      .find(
        { active: true },
        { _id: 0, config: 0, active: 0, countryCode: 1, language: 1 }
      )
      .toArray(function (err, rows) {
        if (err) throw err;
        console.log(rows);
        res.json(rows);
      });
  });
});

router.get("/getTranslationWithId/:id", function (req, res, next) {
  const id = req.params.id;
  console.log(id);
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    console.log(db);
    dbo
      .collection("translation")
      .findOne({ _id: ObjectId(id) }, function (err, rows) {
        if (err) throw err;
        console.log(rows);
        res.json(rows);
      });
  });
});

router.get("/getTranslationByCountryCode/:code", function (req, res, next) {
  const code = req.params.code;
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    console.log(dbo);
    dbo
      .collection("translation")
      .findOne({ countryCode: code, active: true }, function (err, rows) {
        if (err) throw err;
        console.log(rows);
        res.json(rows);
      });
  });
});

router.get("/getTranslationByLanguage/:language", function (req, res, next) {
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    console.log(dbo);
    dbo
      .collection("translation")
      .findOne({ language: req.params.language, active: true }, function (err, rows) {
        if (err) throw err;
        console.log(rows);
        res.json(rows);
      });
  });
});

router.get("/getAllTranslationByCountryCode/:code", function (req, res, next) {
  const code = req.params.code;
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    console.log(dbo);
    dbo
      .collection("translation")
      .find({ countryCode: code, active: true })
      .toArray(function (err, rows) {
        if (err) throw err;
        console.log(rows);
        res.json(rows);
      });
  });
});

router.get(
  "/getTranslationByDemoAccount/:demoAccount",
  function (req, res, next) {
    const demoAccount = req.params.demoAccount;
    mongo.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db(database_name);
      console.log(dbo);
      dbo
        .collection("translation")
        .findOne(
          { demoAccount: demoAccount, active: true },
          function (err, rows) {
            if (err) throw err;
            res.json(rows);
          }
        );
    });
  }
);

router.get(
  "/getAllTranslationForDemoAccount/:demoAccount",
  function (req, res, next) {
    console.log(req.params.demoAccount);
    mongo.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db(database_name);
      console.log(dbo);
      dbo
        .collection("translation")
        .find({ demoAccount: req.params.demoAccount, active: true })
        .toArray(function (err, rows) {
          if (err) throw err;
          console.log(rows);
          res.json(rows);
        });
    });
  }
);

router.get("/deleteTranslation/:id", function (req, res, next) {
  const id = req.params.id;
  console.log(id);
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    dbo.collection("translation").deleteOne(
      {
        _id: ObjectId(id),
      },
      function (err, rows) {
        if (err) throw err;
        console.log(rows);
        res.json(true);
      }
    );
  });
});

router.post("/updateTranslation", function (req, res, next) {
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    console.log(req.body);
    dbo.collection("translation").updateOne(
      { _id: ObjectId(req.body._id) },
      {
        $set: {
          language: req.body.language,
          countryCode: req.body.countryCode,
          active: req.body.active,
          config: req.body.config,
          demoAccount: req.body.demoAccount,
          demoCode: req.body.demoCode,
        },
      },
      { upsert: true },
      function (err, rows) {
        if (err) throw err;

        res.json(true);
      }
    );
  });
  // res.json({ code: 201 });
});

router.get("/getPermissionPatientMenu/:clinic", function (req, res, next) {
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    console.log(dbo);
    dbo
      .collection("permission-patient-menu")
      .findOne({ clinic: req.params.clinic }, function (err, rows) {
        if (err) throw err;
        console.log(rows);
        res.json(rows);
      });
  });
});

router.post("/createOrUpdatePermissionPatientMenu", function (req, res, next) {
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    dbo
      .collection("permission-patient-menu")
      .findOne({ clinic: req.body.clinic }, function (err, rows) {
        if (err) throw err;
        console.log(rows);
        if (rows) {
          dbo.collection("permission-patient-menu").updateOne(
            { clinic: req.body.clinic },
            {
              $set: {
                myCalendar: req.body.myCalendar,
                myComplaint: req.body.myComplaint,
                myTherapy: req.body.myTherapy,
                myDocument: req.body.myDocument,
              },
            },
            function (err, rows) {
              if (err) throw err;
              res.send(true);
            }
          );
        } else {
          dbo
            .collection("permission-patient-menu")
            .insertOne(req.body, function (err, rows) {
              if (err) {
                throw err;
              } else {
                res.send(true);
              }
            });
        }
      });
  });
});

router.post("/setLanguageForUser", function (req, res, next) {
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(database_name);
    console.log(req.body);
    dbo.collection("user_configuration").updateOne(
      { user_id: Number(req.body.user_id) },
      {
        $set: {
          language: req.body.countryCode,
        },
      },
      { upsert: true },
      function (err, rows) {
        if (err) throw err;

        res.json(true);
      }
    );
  });
  // res.json({ code: 201 });
});

module.exports = router;
