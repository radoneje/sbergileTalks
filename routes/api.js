var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/ping', function(req, res, next) {
  res.send('pong');
});

router.post('/user', async (req, res, next) =>{
  var r=await req.knex("t_users").insert(req.body,"*")
  res.json(r);
});

module.exports = router;
