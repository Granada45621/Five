// Server Connect Variables
var app;
var http;
var io;

// JIY Modules
var Vector;
var Noise;
var Gun;

// JIY Class
var Map;
var MapCell;
var Fairy;

// Game Variables
var _map;		// Map
var _fairys;	// Players

var _shortArea;

var _time;

var _gravity;

var _bullets;

var _bullet;

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
	Gun = require('./jiy_class/gun.js');
	
	// Define Game Variables
	_map = new Map();
	_map.Set({
		map : [],
		size : new Vector(80,80),
		tile : {
			size : 100,
		},
		seed : 562039723546,
	});
	_map.Create_Map(Noise, MapCell, Vector);
	
	_fairys = {};
	
	_shortArea = {};		// 구역별 요정 모음
	
	_time = Date.now();
	
	_gravity = 10;
	
	_bullets = [];
	
	_bullet = {
		nb10 : require('./jiy_bullets/nb10.js'),
	};
}

function Join_Game(data, socket) {
	var fairy = new Fairy();
	var indata = {
		name : data.name,
		
		pos : false,
		velocity : new Vector(0,0),
		movevelocity : new Vector(0,0),
		
		focus : 10,
		
		gun : new Gun(),
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
	
	console.log(`\nName : ${indata.name}\n`);
	
	fairy.Set(indata);
	_fairys[fairy.name] = fairy;
	
	fairy.gun.Set({bullet : 'nb10'});
	
	return fairy;
}

function Main_Loop() {
	var now = Date.now();
	var tick = (now - _time) / 1000;
	
	var keys = Object.keys(_fairys);
	for (var f = 0, len = keys.length; f < len; f++) {
		var fairy = _fairys[keys[f]];
		var shot = fairy.Shot(tick, Vector);
		
		fairy.Move(tick, _map, _gravity, Vector);
		
		if (shot == 'shot') {
			var bul = new _bullet[fairy.gun.bullet]();
			var data = {
				name : fairy.name,
				direction : fairy.event.direction,
				pos : fairy.pos,
			};
			
			bul.Shot(data);
			
			_bullets.push( bul );
		}
	}
	
	var alivebullet = [];
	for (var b = 0, len = _bullets.length; b < len; b++) {
		var bullet = _bullets[b];
		
		if (bullet.state == 'alive') {
			alivebullet.push(bullet);
			
			bullet.Main(Date.now()-_time, Vector);
		}
	}
	
	_bullets = alivebullet;
	
	io.emit('data', {type : 'fairys', data : _fairys});
	io.emit('data', {type : 'bullets', data : _bullets});
	
	_time = now;
}

// Execute Init
Init();

setInterval(Main_Loop, 1000/120);

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
	
	socket.on('joinGame', function(data) {
		if (data.name in _fairys) {
			socket.emit('joinGame', {check : false});
		} else {
			player = Join_Game(data, socket);
			socket.emit('joinGame', {check : true});
		}
	});
	
	// Event
	socket.on('event', function(data) {
		if (player){
			switch(data.type) {
				case 'mousemove':
					player.event.mousepos = data.pos;
					player.event.direction = data.direction;
					break;
				case 'keydown':
					if (data.keyCode == 87) {
						if (!(player.event.jump)) {
							player.event.jump = 'jump';
						}
					}
					if (data.keyCode == 68) {
						player.event.move = 'right';
					}
					if (data.keyCode == 65) {
						player.event.move = 'left';
					}
					break;
				case 'keyup':
					if (data.keyCode == 87) {
						player.event.jump = false;
					}
					if (data.keyCode == 68 || data.keyCode == 65) {
						player.event.move = false;
					}
					break;
				case 'mousedown':
					if (data.button == 0) {
						player.event.shot = true;
					}
					break;
				case 'mouseup':
					if (data.button == 0) {
						player.event.shot = false;
					}
					break;
			}
		}
	});
	
	// Data
	socket.on('data', function(name) {
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
			case 'bullets':
				type = 'bullets';
				data = _bullets;
		}
		socket.emit('data', {type : type, data : data});
	});
	
	socket.on('disconnect', function() {
		if (player) {
			delete _fairys[player.name];
		}
		console.log('a user disconnected');
	});
});

// Http Waiting
http.listen( process.env.PORT || 3000 );