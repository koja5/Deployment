var express = require('express');
var router = express.Router();

/*
router.get('/main', function (req, res, next) {
  if (!req.session.user)
    res.redirect('login');
  else {
    res.redirect('vreme');
  }
});
*/

router.get('/logout', function (req, res, next) {
  req.session.user = null;
  req.session.auth = false;

  res.redirect('login');
});


router.get('/islogged', function (req, res, next) {
  obj = {
    logged: "true"
  }
  if (!req.session.user) {
    obj.logged = "false";
  }
  
  console.log(obj);
  res.json(obj);
});

router.post('/userLogged',function(req,res,next){
  res.send(req.session.user);
});

router.get('/userLogged',function(req,res,next){
  res.send(req.session.user);
});

module.exports = router;
