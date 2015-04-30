var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var mongoose= require('mongoose');
var routes = require('./routes');
var users = require('./routes/users');
var http = require('http');
var path = require('path');
var mysql = require('mysql');
routes.index=require('./routes/index')
var app = express();

//var transactionApiPath

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var connection = mysql.createConnection({
    host     : 'awsmysql.crotyk30ckwb.us-west-2.rds.amazonaws.com',
    user     : 'root',
    password : 'password123',
    database : 'cmpe281',
    multipleStatements: true
});

connection.connect(function(err){
    if(!err) {
        console.log("Database is connected ... \n\n");
    } else {
        console.log("Error connecting database ... \n\n");
    }
});

// Mongo Database interactions
mongoose.connect('mongodb://root:root@ds053607.mongolab.com:53607/cmpe281');

var Schema = mongoose.Schema;
var FieldSchema = new Schema({ fieldId: Number, fieldName: String, module: String, type: String,value: String});
var Tenant = new Schema({
    tenantid: { type: Number, required: true },
    description: { type: String, required: true },
    fields: [FieldSchema],
    created: { type: Date, default: Date.now }
},{ collection: 'Tenant_Fields' });

var TenantModel=mongoose.model('Tenant',Tenant);
//Reads the tenant fields
app.get('/api/tenant/:id', function (req, res){
    console.log("got hit for retrieval");
    return TenantModel.find({'tenantid':req.params.id},function (err, tenant) {
        if (!err) {
           // console.log(tenant)
            return res.json(tenant);
        } else {
            return console.log(err);
        }
    });
});
//END OF MONGO CODE


//SQL CODE STARTS

//CREATE USER
app.post("/api/:tenantid/createUser", function(req, res){

   console.log("create user got hit");
    console.log(req.body);
    var queryString = "INSERT INTO ??(??,??,??) VALUES (?,?,?)";
    var table = ["users","user_name","email","password",req.body.user_name, req.body.email, req.body.password];
    queryString = mysql.format(queryString,table);

    connection.query(queryString, function (error,results){
        if(error){
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {
            res.json({"Error" : false, "Message" : "{'user_id' : " +results.insertId+"}"});
        }
    });

});

//LOGIN
app.post("/api/:tenantid/login", function(req, res){
//SELECT * FROM ?? WHERE ??=? and ??=?
    var queryString = "SELECT * FROM ?? WHERE ??=? LIMIT 1";
    var table = ["users","email", req.body.email];
    //var table = ["users","email",  req.body.email];
    queryString = mysql.format(queryString,table);
    connection.query(queryString,function(err,results){
        if(err) {
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {
            res.json({"Error" : false, "Message" : "Success", "Users" : results});
        }
    });
});

//WATERFALL
//CREATE PROJECT
          app.post("/api/:tenantid/:user_id/create-project", function(req, res){
              var queryToExecute="";
              for (var i in req.body)
              {
                  if(null!=req.body[i].value && req.body[i].value!='') {
                      var queryString = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)";
                      var table = ["user_data_table", "user_id", "tenant_id", "field_id", "field_value", req.params.user_id, 1, req.body[i].fieldId, req.body[i].value];
                      queryString = mysql.format(queryString, table);
                      queryToExecute += queryString + ";"
                  }

              }
                 //console.log(queryToExecute);
                 connection.query(queryToExecute, function (error,results){
                    if(error){
                        res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                    } else {
                        res.json({"Error" : false, "Message" : "{'project_id' : " +results.insertId+"}"});
                    }
                });

});

//CREATE TASK
app.post("/api/:tenantid/:user_id/createtask", function(req, res){
    var queryToExecute="";
    for (var i in req.body)
    {
        if(null!=req.body[i].value && req.body[i].value!='') {
            var queryString = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)";
            var table = ["user_data_table", "user_id", "tenant_id","parent_field_id", "field_id", "field_value", req.params.user_id, 1,1, req.body[i].fieldId, req.body[i].value];
            queryString = mysql.format(queryString, table);
            queryToExecute += queryString + ";"
        }

    }
    console.log(queryToExecute);
    connection.query(queryToExecute, function (error,results){
        if(error){
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {
            res.json({"Error" : false, "Message" : "{'project_id' : " +results.insertId+"}"});
        }
    });

});


//CREATE RESOURCE
app.post("/api/:tenantid/:user_id/createResource", function(req, res){
    var queryToExecute="";
    console.log("hit create resource")
    console.log(req.body);
    for (var i in req.body)
    {
        if(null!=req.body[i].value && req.body[i].value!='') {
            var queryString = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)";
            var table = ["user_data_table", "user_id", "tenant_id","parent_field_id", "field_id", "field_value", req.params.user_id, 1,1, req.body[i].fieldId, req.body[i].value];
            queryString = mysql.format(queryString, table);
            queryToExecute += queryString + ";"
        }

    }
    console.log(queryToExecute);
    connection.query(queryToExecute, function (error,results){
        if(error){
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {
            res.json({"Error" : false, "Message" : "{'project_id' : " +results.insertId+"}"});
        }
    });

});
//Get All fields
app.post("/api/:tenantid/view", function(req, res){

    var queryString = "SELECT * from ?? WHERE ??=? and ??=?";

    //field_id = field of the percentage_complete
    var table = ["user_data_table", "user_id", req.body.user_id, "tenant_id", tenantid];
    queryString = mysql.format(queryString, table);
    console.log(queryString);

    connection.query(queryString, function (error,results){
        if(error){
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {
            res.json({"Error" : false, "Message" : results});
        }
    });

});


//Get hierarchy fields
//view progress
app.post("/api/:tenantid/view-progress", function(req, res){

    var queryString = "SELECT * from ?? WHERE ??=? and ??=? and ??=?";

    //field_id = field of the percentage_complete
    var table = ["user_data_table", "user_id", req.body.user_id, "field_id", req.body.field_id, "tenant_id", tenantid];
    queryString = mysql.format(queryString, table);
    console.log(queryString);

    connection.query(queryString, function (error,results){
        if(error){
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {
            res.json({"Error" : false, "Message" : results});
        }
    });

});

//Update the task details
app.put("/api/:tenantid/edit-task", function(req, res){
    //update the task name
    var queryString1 = "UPDATE ?? SET ??=? WHERE ??=? and ??=? and ??=?";
    var table = ["user_data_table", "field_value", req.body.task_name, "user_id", req.body.user_id, "field_id", req.body.field_id, "tenant_id", req.body.tenant_id];
    queryString1 = mysql.format(queryString1, table);

    //update the start_date
    var queryString2 = "UPDATE ?? SET ??=? WHERE ??=? and ??=? and ??=?";
    var table = ["user_data_table", "field_value", req.body.start_date, "user_id", req.body.user_id, "field_id", req.body.field_id, "tenant_id", req.body.tenant_id];
    queryString2 = mysql.format(queryString2, table);

    //update the end_date
    var queryString3 = "UPDATE ?? SET ??=? WHERE ??=? and ??=? and ??=?";
    var table = ["user_data_table", "field_value", req.body.end_date, "user_id", req.body.user_id, "field_id", req.body.field_id, "tenant_id", req.body.tenant_id];
    queryString3 = mysql.format(queryString3, table);

    //update the percentage_complete
    var queryString4 = "UPDATE ?? SET ??=? WHERE ??=? and ??=? and ??=?";
    var table = ["user_data_table", "field_value", req.body.percentage_complete, "user_id", req.body.user_id, "field_id", req.body.field_id, "tenant_id", req.body.tenant_id];
    queryString4 = mysql.format(queryString4, table);

    var queryString = queryString1 + "; " + queryString2 + "; " + queryString3 + "; " + queryString4 + ";";
    console.log("query String : ", queryString);

    connection.query(queryString, function (error,results){
        if(error){
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {
            res.json({"Error" : false, "Message" : "DONE"});
        }
    });
});



//view progress
app.post("/api/:tenantid/view-progress", function(req, res){

    var queryString = "SELECT * from ?? WHERE ??=? and ??=? and ??=?";

    //field_id = field of the percentage_complete
    var table = ["user_data_table", "user_id", req.body.user_id, "field_id", req.body.field_id, "tenant_id", tenantid];
    queryString = mysql.format(queryString, table);
    console.log(queryString);

    connection.query(queryString, function (error,results){
        if(error){
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {
            res.json({"Error" : false, "Message" : results});
        }
    });

});

//END OF SQL CODE



//ROUTING STARTS
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));



// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use(express.static(path.join(__dirname, 'views')));

app.use('/', routes);
app.use('/users', users);
//app.use('/public/partialviews', express.static(__dirname + '/public/partialviews'));
app.use(express.static(path.join(__dirname, 'public/angularHTMLPartials')));
app.use(express.static(path.join(__dirname, 'public/stylesheets')));
app.use(express.static(path.join(__dirname, 'public/stylesheets/font-awesome')));
app.use(express.static(path.join(__dirname, 'public/stylesheets/font-awesome/css')));
app.use(express.static(path.join(__dirname, 'public/stylesheets/font-awesome/font')));

/****newly added */
// Main App Page
//app.get('/', routes.index);

// MongoDB API Routes
app.get('/index', routes.index);
app.get('/polls', function(req,res)
{
 res.render('partials/list')
});


app.get('/models/model/:name', function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
});

// Handle /Models
app.get('/models/:name', function (req, res) {
    var name = req.params.name;
    res.render(name);
});


app.get('/ang/:partial', function (req, res){
    var partial = req.params.partial+".html"
    console.log("hit the route");
    res.sendFile(path.join(__dirname, '/public/angularHTMLPartials/'+partial));

});

app.get('/public/data/:partial', function (req, res){
    var partial = req.params.partial+".tsv"
    console.log("hit the route");
    res.sendFile(path.join(__dirname, '/public/images/'+partial));

});
/****newly added */


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


app.get('*', routes.index);
module.exports = app;
