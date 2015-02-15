var express = require('express');
var app = express();
var session = require('express-session');
var pg = require('pg');
var uuid = require('uuid');
var bodyParser = require("body-parser");

// app.set('trust proxy', 1)
app.set('port', (process.env.PORT || 5000));
app.set('views', './views');
app.set('view engine', 'jade')
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  genid: function(req) {
    return uuid.v4(); // use UUIDs for session IDs
  },
  secret: 'fqew;aojbvajsd bjsosgosdjfgka 54TWBFSTRH %$@W eslkdfbmldfmb',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 360000000 }
  //,cookie: { secure: true }
}))

app.get('/', function(req, res) {
  var sess = req.session;
  if (!sess.a){
    sess.a = uuid.v4();
  }
  res.render("index");
});

app.get('/q',function (req, res) {
  getAllQ(req, res);
});

app.get('/qc',function (req, res) {
  getqc(req, res);
});

app.post('/q', function (req, res) {
  var q = req.body.q;
  var a = req.session.a;
  console.log("save - " + a + " : " + q);
  saveQ(a,q);
  res.send("1");
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

var client = new pg.Client(process.env.DATABASE_URL);
client.connect();

var getAllQ = function (req, res) {
  var rows = [];
  var a = req.session.a;
  client.query({
    text: 'SELECT q FROM qq WHERE a = $1',
    values: [a]
  }).on('row', function(row) {
    console.log(row);
    rows.push(row);
  }).on('end', function(result) {
    console.log(result.rowCount + ' rows were received');
    console.log(rows);
    res.send(rows);
  })
}

var getqc = function (req, res) {
  client.query('SELECT COUNT(q) FROM qq', function(err, result) {
    if(err) console.log(err);
    res.send(result.rows[0].count)
  });
}

var saveQ = function (a, q) {
  client.query('INSERT INTO qq(a, q) VALUES($1, $2)', [a,q], function(err, result) {
    if(err) console.log(err);
  });
}
