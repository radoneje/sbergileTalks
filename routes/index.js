var express = require('express');
var router = express.Router();
var moment=require('moment')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: '***' });
});
router.post('/login', function(req, res, next) {
  console.log(req.body)
  if(req.body.login=="editor" && req.body.pass=="dfczgegrby") {
    req.session["admin"]=true;
    return res.redirect("/admin");
  }
  res.render('login', { title: '**' });
});
function checkAdmin(req, res, next){
  if(req.session["admin"])
    next();
  else
    res.redirect("/login");
}
router.get('/admin', checkAdmin, async function(req, res, next) {
  var users=await req.knex.select("*").from("t_users");
  users.forEach(u=>{
    u.dateReg=moment(u.dateReg).add(3, 'hours').format("DD.MM.yyyy HH:mm:ss")
  })
  res.render('admin', { title: '**', users:users, ws:require('../workshops')});
});

module.exports = router;
