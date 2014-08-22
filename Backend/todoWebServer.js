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
	database	: 'html5',
	charset		: 'UTF8_GENERAL_CI',
	timezone	: 'local',
	password	: 'sung'
});


//webserver
var app = express();

function setHeader(request,response){
    response.set({
        "Access-Control-Allow-Origin" : "*",
		"Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Credentials" : "true",
        "Content-Type" : "application/json",
        "Access-Control-Allow-Methods" : "GET, PUT, POST, DELETE"
    });
}

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

function errorJson(response) {
	response.json({"error": "error"});
}

app.get('/', function(request, response) {
	setHeader(request, response);

	requestQuery(
		"SELECT * FROM todo",
		null,
		function(err, aResult) {
			console.log(aResult);
			response.json(aResult);
		}
	);
	//response.json({'test':"get"});
});

app.post('/', function(request, response) {
	setHeader(request, response);

	if (!isUndefinedOrNull(request.body) && !isUndefinedOrNull(request.body.todo)) {
		requestQuery(
			"INSERT INTO todo(todo, created_date) values(?, NOW())",
			[request.body.todo],
			function(err, aResult) {
				
				if (err) {
					errorJson(response);
					return;			
				}

				response.json(aResult);
			}
		);	
	} else {
		errorJson(response);
		return;
	}
});

app.put('/', function(request, response) {
	setHeader(request, response);
	
	if (!isUndefinedOrNull(request.body) && !isUndefinedOrNull(request.body.id)) {
		requestQuery(
			"UPDATE todo SET completed = 1 WHERE id = ?",
			[request.body.id],
			function(err, oResult) {
				
				if (err) {
					errorJson(response);
					return;			
				}

				response.json(oResult);
			}
		);	
	} else {
		errorJson(response);
		return;
	}
});

app.delete('/', function(request, response) {
	setHeader(request, response);
	
	if (!isUndefinedOrNull(request.body) && !isUndefinedOrNull(request.body.id)) {
		requestQuery(
			"DELETE FROM todo WHERE id = ?",
			[request.body.id],
			function(err, oResult) {
				
				if (err) {
					errorJson(response);
					return;			
				}

				response.json(oResult);
			}
		);	
	} else {
		errorJson(response);
		return;
	}
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
