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

var _shortArea;

var _time;

var _gravity;

var _bullets;

var _bullet;

var _effects;

var _guns;

var _objects;

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
		size : new Vector(80,80),
		tile : {
			size : 100,
		},
		seed : 562039723546,
	});
	_map.Create_Map(Noise, MapCell, Vector);
	
	_fairys = {};
	
	_shortCut = {
		size : 40,
		fairys : {},		// 구역별 요정 모음
		guns : {},			// 총 떨어진 위치
	};
	
	_time = Date.now();
	
	_gravity = 10;
	
	_bullets = [];
	
	_bullet = {
		nb10 : require('./jiy_bullets/nb10.js'),
	};
	
	_effects = {
		num : []
	};
	
	_guns = {
		gun : require('./jiy_guns/gun.js'),
	};
	
	_objects = {
		guns : []
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
		
		gun : false,
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
	
	//fairy.gun.Set({bullet : 'nb10'});
	
	return fairy;
}

function Main_Loop() {
	var now = Date.now();
	var tick = (now - _time) / 1000;
	
	_shortCut.fairys = {};
	
	// Fairy
	var keys = Object.keys(_fairys);
	for (var f = 0, len = keys.length; f < len; f++) {
		var fairy = _fairys[keys[f]];
		var shot = fairy.Shot(tick, Vector);
		
		// Fairy Move
		fairy.Move(tick, _map, _gravity, Vector);
		
		// Add Bullet
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
		
		// Insert Fairy Pos ShortCut
		var pos = new Vector(0,0).Set(fairy.pos);
		
		pos.x = parseInt( pos.x / _shortCut.size );
		pos.y = parseInt( pos.y / _shortCut.size );
		
		var string = pos.Get_String();
		if (string in _shortCut.fairys) {
			_shortCut.fairys[string].push(fairy);
		} else {
			_shortCut.fairys[string] = [fairy];
		}
	}
	
	// Bullet
	var alivebullet = [];
	for (var b = 0, len = _bullets.length; b < len; b++) {
		var bullet = _bullets[b];
		
		if (bullet.state == 'alive') {
			alivebullet.push(bullet);
			
			bullet.Main(Date.now()-_time, Vector);
			var effect = Bullet_Collide(bullet);
			
			if (effect) {
				_effects.num.push(effect);
			}
		}
	}
	
	_bullets = alivebullet;
	
	// Num Effect
	var aliveeffect = [];
	for (var ne = 0, len = _effects.num.length; ne < len; ne++) {
		var effect = _effects.num[ne];
		
		effect.pos.y -= (50) * tick;
		effect.time -= tick;
		
		if (effect.time <= 0) {
			effect.state = 'dead';
		}
		
		if (effect.state == 'alive') {
			aliveeffect.push(effect);
		}
	}
	
	_effects.num = aliveeffect;
	
	Send_Data();
	
	_time = now;
}

function Send_Data() {
	io.emit('data', {type : 'fairys', data : _fairys});
	io.emit('data', {type : 'bullets', data : _bullets});
	io.emit('data', {type : 'effects', data : _effects});
	io.emit('data', {type : 'objects', data : _objects});
}

function Bullet_Collide(bullet) {
	// Wall Collide
	var re = false;
	var pos = new Vector(0,0).Set(bullet.pos);
	
	pos.x = parseInt( pos.x / _map.tile.size );
	pos.y = parseInt( pos.y / _map.tile.size );
	
	if (pos.Check_Range(0, _map.size.x, 0, _map.size.y)) {
		if (_map.map[pos.y][pos.x].type != '') {
			bullet.state = 'dead';
		}
	}
	
	// Fairy Collide
	var cpoints = bullet.data.collidePoints;
	
	for (var cp = 0, len = cpoints.length; cp < len; cp++){
		var pos = new Vector(0,0).Set(cpoints[cp]);
		var cell = pos.Get_Clone();
		
		cell.x = parseInt( pos.x / _shortCut.size );
		cell.y = parseInt( pos.y / _shortCut.size );
		
		var string = cell.Get_String();
		
		if (string in _shortCut.fairys) {
			var fairys = _shortCut.fairys[string];
			
			for (var f = 0, leng = fairys.length; f < leng; f++) {
				var fairy = fairys[f];
				
				// Collide Check
				if (fairy.name != bullet.shoter.name) {
					var rect1 = {
						x : fairy.pos.x-10,
						y : fairy.pos.y-10,
						width : 20,
						height : 20,
					};
					
					var rect2 = {
						x : pos.x-(bullet.spec.size/2),
						y : pos.y-(bullet.spec.size/2),
						width : bullet.spec.size,
						height : bullet.spec.size,
					};
					
					if (rect1.x < rect2.x + rect2.width &&
						rect1.x + rect1.width > rect2.x &&
						rect1.y < rect2.y + rect2.height &&
						rect1.height + rect1.y > rect2.y) {
						bullet.state = 'dead';
						
						// Num Effect Constructor
						re = {
							num : `-${bullet.spec.damage}`,
							pos : pos.Get_Clone(),
							time : 0.8,
							state : 'alive',
						};
					}
				}
			}
		}
	}
	
	return re;
	
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
				break;
			case 'effects':
				type = 'effects';
				data = _effects;
				break;
			case 'objects':
				type = 'objects';
				data = _objects;
				break;
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