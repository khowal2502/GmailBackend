var express    = require('express');        
var app        = express();                 
var bodyParser = require('body-parser');
var mysql      = require('mysql');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;
var router = express.Router();


router.get('/login', function(req, res) {
    res.json({ message: 'Login Successful!' });   
});

//First it will always be created as Drafts
router.post('/compose', function(req, res){
    var owner_id = req.body.user_id;
    var subject = req.body.subject;
    var body = req.body.body;

    var email_id = req.body.id;

    var sql = "";
    if(email_id===undefined){
        sql = "INSERT INTO Emails(owner_id, subject, body, type) VALUES \
        (" + owner_id + ", '" + subject + "', '" + body + "', 'draft')";
    }else{
        sql = "UPDATE Emails SET owner_id = " + owner_id + ", subject = '" + subject + "', body = '" + body + "' WHERE \
                id = " + email_id;
    }

    console.log(sql);
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Email saved as draft!");
        res.json({"message": "Done!"});
    });
});


//Assuming send to only one email id 
router.post('/send', function(req, res){
    var email_id = req.body.email_id;
    var to = req.body.to;

    var sql = "INSERT INTO Actions(email_id, user_id, state, folder) VALUES \
        (" + email_id + ", " + to + ", 'unread', 'inbox')";
    console.log(sql);
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        sql = "UPDATE Emails SET type='sent' WHERE \
                id = " + email_id;
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Email sent!");
            sql = "UPDATE Emails SET type='sent' WHERE \
                    id = " + email_id;
            res.json({"message": "Done!"});
        });        
    });
});


router.post('/read', function(req, res){
    var email_id = req.body.email_id;
    var user_id = req.body.user_id;

    var sql = "UPDATE Actions SET state='read' WHERE email_id="+email_id+" AND user_id="+user_id;
    console.log(sql);
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Email Reads!");
        res.json({"message": "Done!"});
    });
});


router.post('/trash', function(req, res){
    var email_id = req.body.email_id;
    var user_id = req.body.user_id;

    var sql = "UPDATE Actions SET folder='trash' WHERE email_id="+email_id+" AND user_id="+user_id;
    console.log(sql);
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Email Trashed!");
        res.json({"message": "Done!"});
    });
});


router.get('/inbox/:user_id', function(req,res){
    var user_id = req.params.user_id;

    var sql = "SELECT * FROM Actions a JOIN Emails e ON a.email_id = e.id WHERE a.user_id = "+user_id+" AND a.folder = 'inbox'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    });
});

router.get('/sent/:user_id', function(req,res){
    var user_id = req.params.user_id;

    var sql = "SELECT * FROM Emails e WHERE owner_id = "+user_id+" AND type = 'sent'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    });
});


router.get('/draft/:user_id', function(req,res){
    var user_id = req.params.user_id;

    var sql = "SELECT * FROM Emails e WHERE owner_id = "+user_id+" AND type = 'draft'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    });
});

router.get('/trash/:user_id', function(req,res){
    var user_id = req.params.user_id;

    var sql = "SELECT * FROM Actions a JOIN Emails e ON a.email_id = e.id WHERE a.user_id = "+user_id+" AND a.folder = 'trash'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    });
});

router.get('/inbox/read/:user_id', function(req,res){
    var user_id = req.params.user_id;

    var sql = "SELECT * FROM Actions a JOIN Emails e ON a.email_id = e.id \
            WHERE a.user_id = "+user_id+" AND a.folder = 'inbox' AND a.state='read'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    });
});

router.get('/inbox/unread/:user_id', function(req,res){
    var user_id = req.params.user_id;

    var sql = "SELECT * FROM Actions a JOIN Emails e ON a.email_id = e.id \
            WHERE a.user_id = "+user_id+" AND a.folder = 'inbox' AND a.state='unread'";
    console.log(sql);
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    });
});


app.use('/', router);


var con = mysql.createConnection({
    host: "localhost",
    user: "krishna",
    password: "krishna1234",
    database: "gmail",
    insecureAuth: true
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to Database!");
    app.listen(port);
    console.log('Mail Server up on port ' + port);
});