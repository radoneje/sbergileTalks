var express = require('express');
var router = express.Router();
const moment = require('moment')
const { convertArrayToCSV } = require('convert-array-to-csv');
var path = require('path')
var fs = require('fs')
var axios = require('axios')
var nodemailer = require('nodemailer');
var workshops=require('./../workshops')

/* GET users listing. */
router.get('/ping', function(req, res, next) {
  res.send('pong');
});
router.post('/addUser', async (req, res, next) => {

  console.log(Object.keys(req.body))
  var keys = Object.keys(req.body);

  if (keys.length > 0) {
    var user = JSON.parse(keys[0]);
    console.log(user)
    var r = await req.knex("t_users").insert(user, "*")
    var file = path.join(__dirname, '../public/letter.html')

    try {
      var text = "Здравствуйте! \r\n\r\n\
Вы зарегистрировались на конференцию Sbergile Talks, проходящую 8 и 9 декабря. Трансляция докладов начнется 8 декабря в 10:00. Детали по подключению мы направим ближе к дате конференции.\r\n\r\n\
Вступайте в чат конференции в telegram, там будут самые оперативные новости и классный нетворкинг: https://t.me/sbergiletalks  \r\n\r\n";

      workshops.forEach(ws=>{

        if(user[ws.id]){
          text+="Воркшоп \""+ws.title+"\" будет проходить " + ws.descr + ",  доступ по ссылке: "+ ws.url +"\r\n\r\n"
        }
      })
      text+="До встречи 8-9 декабря на Sbergile Talks!";
      var subj = "Регистрация на конференцию Sbergile Talks"

      var content="";
     // if(user.workshops)
        content= fs.readFileSync(path.join(__dirname, '../public/event.ics'))
      //else
       // content= fs.readFileSync(path.join(__dirname, '../public/eventSmall.ics'))
      /*var calendar={
        filename: 'invitation.ics',
        method: 'request',
        content: content
      }*/
      await sendEmail(user.e, text, subj);
    } catch (e) {
      console.log("error mail", e)
    }
    return res.json(r)
  }
  res.json(1)
});


router.post('/resend', async (req, res, next) =>{
  try {
  var r = await req.knex("t_users").select( "*").where({id:req.body.userid})
  if(r.length>0) {
    var user = r[0];

    var text = "Здравствуйте! \r\n\r\n\
Вы зарегистрировались на конференцию Sbergile Talks, проходящую 8 и 9 декабря. Трансляция докладов начнется 8 декабря в 10:00. Детали по подключению мы направим ближе к дате конференции.\r\n\r\n\
Вступайте в чат конференции в telegram, там будут самые оперативные новости и классный нетворкинг: https://t.me/sbergiletalks  \r\n\r\n";

    workshops.forEach(ws => {

      if (user[ws.id]) {
        text += "Воркшоп \"" + ws.title + "\" будет проходить " + ws.descr + ",  доступ по ссылке: " + ws.url + "\r\n\r\n"
      }
    })
    text += "До встречи 8-9 декабря на Sbergile Talks!";
    var subj = "Регистрация на конференцию Sbergile Talks"

    var content = "";
    // if(user.workshops)
    content = fs.readFileSync(path.join(__dirname, '../public/event.ics'))
    //else
    // content= fs.readFileSync(path.join(__dirname, '../public/eventSmall.ics'))
    /*var calendar={
      filename: 'invitation.ics',
      method: 'request',
      content: content
    }*/
    await sendEmail(user.e, text, subj);
    res.json(0)
  }
    } catch (e) {
      console.log("error mail", e)
    res.json(1)
    }


});
router.post('/user', async (req, res, next) =>{
try {
/*  var google = await axios.get("https://www.google.com/recaptcha/api/siteverify?secret=6Ldk8uIZAAAAAAQGcBwNuu66uC8wFhxAZ1AJ-U0b&response=" + req.body.token)
  if (!google.data.success)
    return res.sendStatus("404")*/

  console.log("dd",req.body,req.body );
  var r = await req.knex("t_users").insert(req.body.user, "*")
  var file = path.join(__dirname, '../public/letter.html')
  var text = fs.readFileSync(file);
  try {
    var text="Здравствуйте! \r\n\r\n\
Вы зарегистрировались на конференцию Sbergile Talks. Детали по подключению мы направим ближе к дате конференции.\r\n\r\n\
Вступайте в чат конференции в telegram, там будут самые оперативные новости и классный нетворкинг: https://t.me/sbergiletalks  \r\n\r\n\
До встречи 8-9 декабря на Sbergile Talks!";
    var subj="Регистрация на конференцию Sbergile Talks"



    await sendEmail(req.body.user.e, text, subj);
  }
  catch (e) {
    console.log("error mail",e)
  }
  res.json(r)
  }
  catch (e) {
  console.warn("error",e)
    return res.sendStatus("404")
  }
});

router.get('/usersXLS', async function(req, res, next) {
  var xl = require('excel4node');
  var wb = new xl.Workbook();
  var headStyle = wb.createStyle({
    font: {
      bold: true,
      size: 12
    },
    alignment: {
      horizontal: 'center',
    },
  });
  var style = wb.createStyle({
    font: {
      size: 12
    },
    alignment: {
      wrapText: true,
      vertical: 'top',
    },
  });
  var qColumns=["id", "Имя","Фамилия", "email","компания", " дата регистрации", "должность"]
  var wrs=require('../workshops');
  wrs.forEach(workshop=>{
    qColumns.push(workshop.title)
  })
  var ws = wb.addWorksheet('registration',
  );
  for(var i=1; i<=qColumns.length;i++){
    ws.cell(1, i).string(qColumns[i-1]).style(headStyle);
    ws.column(i).setWidth(30);
  }
  var j=1;
  var users=await req.knex.select("*").from("t_users");

  users.forEach(q=>{
    q.dateReg=moment(q.dateReg).format("DD.MM.yyyy hh:mm:ss")
    j++;
    var keys=Object.keys(q)
    for(var i=1; i<=7/*qColumns.length*/;i++){
      var val=q[keys[i-1]]
      if(val) {
        val=val.toString();
        if (typeof (val) === 'string')
          ws.cell(j, i).string(val).style(style);
        else
          console.log('not string', val)
      }
    }
    //console.log("ws", wrs);

    for(var i=0;i<wrs.length;i++){
      //console.log(i);
      console.log(i, wrs[i].id, q[wrs[i].id]?"ДА":'');
      ws.cell(j, i+7).string(q[wrs[i].id]?"ДА":'').style(style);
     /* var val="";
      var ii=0;
      wrs.forEach(workshop=>{
        if(ii==(i)) {

          val=q[workshop.id]?"ДА":'';
          ii=ii+1;
          console.log("workshop", val, i, ii, wrs.length);
        }
      })
      //console.log("wsid", wsid);
     // var val=q[wsid]?"ДА":'';

      ws.cell(j, i+7).string(val).style(style);*/
    }
  })


  var file=path.join(__dirname, '../public/th/')+'/statistics.xlsx'
  wb.write( file,()=>{
    res.download(file);
  });

});
async function sendEmail(email, text,subj) {
  var transporter = nodemailer.createTransport({
  /*  host: "mail.nic.ru",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "info@sbergile-talks.ru", // generated ethereal user
      pass: "Gbplfgbplf13" // generated ethereal password
    }*/
    host: "mail.nic.ru",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "sbergile-talks@sber.link", // generated ethereal user
      pass: "Dfczgegrby123" // generated ethereal password
    }
  });

  var mailOptions = {
    from: 'sbergile-talks@sber.link',
    to: email,
    subject: subj,
    text: text
  };
/*  if(calendar) {
    console.log("cale", calendar)
    mailOptions.icalEvent=calendar;
  }*/

  try {
    await transporter.sendMail(mailOptions)
    console.log("email send", email)
  }
  catch (e) {
    console.warn(e)
  }
}


module.exports = router;
