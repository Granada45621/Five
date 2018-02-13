// Server Connect Variables
var app;
var http;
var io;

// JIY Modules
var Vector;
var Noise;

// JIY Class
var Map;
var MapCell;
var Fairy;

// Game Variables
var _map;		// Map
var _fairys;	// Players

var _ability;	// Ability List

var _shortArea;

// Function
// Function Init(Setting Variables)
function Init() {
	// Define Connect Variables
	app = require('express')();
	http = require('http').Server(app);
	io = require('socket.io')(http);
	
	// Define JIY Modules
	Vector = require('./jiy_modules/vector.js');
	Noise = require('./jiy_modules/perlin.js').noise;
	
	// Define JIY Class
	Map = require('./jiy_class/map.js');
	MapCell = require('./jiy_class/map_cell.js');
	Fairy = require('./jiy_class/fairy.js');
	
	// Define Game Variables
	_map = new Map();
	_map.Set({
		map : [],
		size : new Vector(130,130),
		tile : {
			size : 100
		},
		seed : 562039723546
	});
	_map.Create_Map(Noise, MapCell, Vector);
	
	_fairys = {};
	
	_abilitys = ['dagger', 'telekinesis'];
	
	_shortArea = {};		// 구역별 요정 모음
}

function Join_Game(data, socket) {
	var fairy = new Fairy();
	var indata = {
		name : data.name,
		ability : data.ability,
		
		pos : false,
		velocity : new Vector(0,0),
		
		focus : 10
	};
	
	var size = _map.tile.size;
	do {
		var po = new Vector(0,0).Set_Random(110, _map.size.x*size, 110, 200);
		var tile = new Vector(0,0);
		tile.x = parseInt(po.x / size);
		tile.y = parseInt(po.y / size);
		
		if (_map.map[tile.y][tile.x].type == '') {
			indata.pos = po.Get_Clone();
		}
	} while (indata.pos == false);
	
	console.log(`\nName : ${indata.name}\nAbility : ${indata.ability}\n`);
	
	fairy.Set(indata);
	_fairys[fairy.name] = fairy;
	
	return fairy;
}

function Main_Loop() {
	var keys = Object.keys(_fairys);
	for (var f = 0, len = keys.length; f < len; f++) {
		var fairy = _fairys[keys[f]];
		fairy.Move(10, _map, Vector);
	}
	
	io.emit('data', {type : 'fairys', data : _fairys});
}

// Execute Init
Init();

setInterval(Main_Loop, 10);

// Send Client File
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client.html');
});
app.get('/jiy_modules/vector.js', function(req, res) {
	res.sendFile(__dirname + '/jiy_modules/vector.js');
});

// Socket Connect With Client
io.on('connection', function(socket) {
	var player;
	
	socket.emit('data', {type : 'ability_list', data : _abilitys});
	
	socket.on('joinGame', function(data) {
		if (data.name in _fairys) {
			socket.emit('joinGame', {check : false});
		} else {
			player = Join_Game(data, socket);
			socket.emit('joinGame', {check : true});
		}
	});
	
	// Data
	socket.on('data', function(name){
		var type;
		var data;
		
		switch(name) {
			case 'map':
				type = 'map';
				data = _map;
				break;
			case 'fairys':
				type = 'fairys';
				data = _fairys;
				break;
		}
		socket.emit('data', {type : type, data : data});
	});
	
	socket.on('disconnect', function() {
		if (player.name) {
			delete _fairys[player.name];
		}
		console.log('a user disconnected');
	});
});

// Http Waiting
http.listen( process.env.PORT || 3000 );