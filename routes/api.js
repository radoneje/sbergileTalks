var express = require('express');
var router = express.Router();
const moment = require('moment')
const { convertArrayToCSV } = require('convert-array-to-csv');
var path = require('path')
var fs = require('fs')
var axios = require('axios')
var nodemailer = require('nodemailer');

/* GET users listing. */
router.get('/ping', function(req, res, next) {
  res.send('pong');
});

router.post('/user', async (req, res, next) =>{


try {
  var google = await axios.get("https://www.google.com/recaptcha/api/siteverify?secret=6Ldk8uIZAAAAAAQGcBwNuu66uC8wFhxAZ1AJ-U0b&response=" + req.body.token)
  if (!google.data.success)
    return res.sendStatus("404")

  var r = await req.knex("t_users").insert(req.body.user, "*")
  res.json(r);
  var file = path.join(__dirname, '../public/letter.html')
  var text = fs.readFileSync(file);
  await sendEmail(req.body.user.e, text);
  }
  catch (e) {
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
  var ws = wb.addWorksheet('гыукы',
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
    for(var i=1; i<=qColumns.length;i++){
      var val=q[keys[i-1]]
      if(val) {
        val=val.toString();
        if (typeof (val) === 'string')
          ws.cell(j, i).string(val).style(style);
        else
          console.log('not string', val)
      }
    }
  })


  var file=path.join(__dirname, '../public/th/')+'/statistics.xlsx'
  wb.write( file,()=>{
    res.download(file);
  });

});
async function sendEmail(email, text) {
  var transporter = nodemailer.createTransport({
  /*  host: "mail.nic.ru",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "info@sbergile-talks.ru", // generated ethereal user
      pass: "Gbplfgbplf13" // generated ethereal password
    }*/
    host: "smtp.yandex.ru",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "info@sbergile-talks.ru", // generated ethereal user
      pass: "Gbplfgbplf13" // generated ethereal password
    }
  });

  var mailOptions = {
    from: 'info@sbergile-talks.ru',
    to: email,
    subject: 'Confirmation',
    html: text
  };
  try {
    await transporter.sendMail(mailOptions)
    console.log("email send", email)
  }
  catch (e) {
    console.warn(e)
  }
}


module.exports = router;
