var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var connection = require('express-myconnection');
var mysql = require('mysql');

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// development only
// if ('development' == app.get('env')) {
//     app.use(express.errorHandler());
// }

app.use(
    connection(mysql, {
        host: 'localhost',
        user: 'root',
        password: 'Thao0983312123',
        port: 3306, //port mysql
        database: 'demodata'
    }, 'pool') //or single
);

// go to home page
app.get('/', function(req, res) {
    res.render('index', { title: 'Hello World' });
});

// go to list page
app.get('/customers', function(req, res) {
    req.getConnection(function(err, connection) {
        var query = connection.query('SELECT * FROM customer', function(err, rows) {
            if (err)
                console.log("Error Selecting : %s ", err);
            res.render('list_customers', { page_title: "Customers - Node.js", data: rows });
        });
    });
});

// handle search
app.get('/customers/search', function(req, res) {
    var nameCustomer = req.query.nameSearch;
    console.log(nameCustomer);
    req.getConnection(function(err, connection) {
        var query = connection.query("SELECT * FROM customer WHERE name LIKE ?", nameCustomer, function(err, rows) {
            if (err)
                console.log("Error Selecting : %s ", err);
            res.render('list_customers', { page_title: "Customers - Node.js", data: rows });
        });
    });
});

// go to add page
app.get('/customers/add', function(req, res) {
    res.render('add_customer', { page_title: "Add Customers - Node.js" });
});

// handle add
app.post('/customers/add', function(req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    req.getConnection(function(err, connection) {
        var data = {
            name: input.name,
            address: input.address,
            email: input.email,
            phone: input.phone
        };
        var query = connection.query("INSERT INTO customer set ? ", data, function(err, rows) {
            if (err)
                console.log("Error inserting : %s ", err);
            res.redirect('/customers');
        });
    });
});

// handle delete
app.get('/customers/delete/:id', function(req, res) {
    var id = req.params.id;
    req.getConnection(function(err, connection) {
        connection.query("DELETE FROM customer  WHERE id = ? ", [id], function(err, rows) {
            if (err)
                console.log("Error deleting : %s ", err);
            res.redirect('/customers');
        });
    });
});

// go to edit page
app.get('/customers/edit/:id', function(req, res) {
    var id = req.params.id;
    req.getConnection(function(err, connection) {
        var query = connection.query('SELECT * FROM customer WHERE id = ?', [id], function(err, rows) {
            if (err)
                console.log("Error Selecting : %s ", err);
            res.render('edit_customer', { page_title: "Edit Customers - Node.js", data: rows });
        });
    });
});

// handle edit
app.post('/customers/edit/:id', function(req, res) {
    var input = JSON.parse(JSON.stringify(req.body));
    var id = req.params.id;
    req.getConnection(function(err, connection) {
        var data = {
            name: input.name,
            address: input.address,
            email: input.email,
            phone: input.phone
        };
        connection.query("UPDATE customer set ? WHERE id = ? ", [data, id], function(err, rows) {
            if (err)
                console.log("Error Updating : %s ", err);
            res.redirect('/customers');
        });
    });
});


app.use(app.router);

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});