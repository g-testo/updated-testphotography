var dotenv = require('dotenv').config();
var express = require('express');
var sass = require('node-sass');
var sassMiddleware = require('node-sass-middleware');
var http = require('http');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

var auth = {
  auth: {
    api_key: process.env.MG_KEY,
    domain: 'mg.testophotography.com'
  }
};

var nodemailerMailgun = nodemailer.createTransport(mg(auth));


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.post('/contact', function(req, res) {
    nodemailerMailgun.sendMail({
      from: 'website@testophotography.com',
      to: 'cryptomonger@hotmail.com', // An array if you have multiple recipients.
    //   cc:'second@domain.com',
    //   bcc:'secretagent@company.gov',
      subject: req.body.subject,
      'h:Reply-To': 'gtesto@testophotography.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: "From: " +  req.body.name + "<br><br>Email: " + req.body.email + "<br><br>Phone: " + req.body.mobile + "<br><br>Message: <br><br>" + req.body.message
      // //You can use "text:" to send plain-text content.
      // text: 
      
    }, function (err, info) {
      if (err) {
        console.log('Error: ' + err);
      }
      else {
        console.log('Response: ' + info);
      }
    });
});

app.use(sassMiddleware({
        src: __dirname + '/public/sass',
        dest: __dirname + '/public/stylesheets',
        debug: true,
        outputStyle: 'compressed',
        prefix:  '/stylesheets'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
      }));

// view engine setup
app.set('./public', path.join(__dirname, './public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static("public"));

app.get('/', (req, res)=>{res.sendFile(process.cwd() + '/public/layout.html')});

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// angular routing refreshing issue fix after removing # 
app.use(function(req, res) {
    res.sendFile(__dirname + '/public/layout.html');
});

// Command to run Server: nodemon ./server.js

http.createServer(app).listen(process.env.PORT, process.env.IP);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;