console.log('\u001b[1m');
console.log('\u001b[32m', '=============Start=============');
console.log('\u001b[1m');


var fs = require('fs');
var http = require('http');
var express = require('express');
var mysql = require('mysql');

//Use Connection Pool
var pool = mysql.createPool({
	host		: '54.178.137.153',
	user		: 'yoon',
	database	: 'todo',
	charset		: 'UTF8_GENERAL_CI',
	timezone	: 'local',
	password	: 'sung'
});


//webserver
var app = express();

function isUndefinedOrNull(data) {
	return (data === undefined || data === null)
}

//for parsing request data
app.use(express.bodyParser());

function error404(response) {
	response.writeHead(404, {
		"Content-Type": "text/plain",
		'Location': 'error/404/notExists'
	});
	response.end();
}

app.get('/', function(request, response) {
	response.json("get");
});

app.post('/', function(request, response) {
	response.json("post");
});

app.put('/', function(request, response) {
	response.json("put");
});

app.delete('/', function(request, response) {
	response.json("delete");
});

//Execute Query
function requestQuery(sql, aInsertValues, callbackFunction) {
	
	//sql QueryGenerator. 
	//Like Java PreparedStatement Class
	var sql = mysql.format(sql, aInsertValues);	
	
	var resultData = pool.getConnection(function(err, connection) {
		
		//when error occur
		if (err) {
			console.log("error occur : ",err);
		} else {
			//connection request
			connection.query(sql, function(err, queryResult) {
				console.log("queryResult : ",queryResult);
				console.log("callbackFunction : ",callbackFunction);
				callbackFunction(err, queryResult);
			})
			
			connection.release();
		}
		
	});
};

//server
http.createServer(app).listen(8080, function() {
	console.log('Server running');
});

console.log('\u001b[1m');
