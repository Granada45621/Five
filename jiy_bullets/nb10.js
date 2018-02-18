class Bullet_NB10 {
	constructor() {
		this.name = 'NB10';
		this.shoter;
		
		this.direction;
		this.pos;
		
		this.spec = {
			damage : 10,
			speed : 1400,	// per second pixel
			
			range : 800,	// pixel
			
			size : 5,
		};
		
		this.state;
		
		this.data;
	}
	
	Shot(data) {
		this.shoter = {
			name : data.name,
		};
		
		this.direction = data.direction;
		
		this.pos = data.pos;
		
		this.state = 'alive';
		
		this.data = {
			distance : 0,
			collidePoints : [],
		};
	}
	
	Collide(_map, _shortCut, Vector) {
		// Wall Collide
		var pos = new Vector(0,0).Set(this.pos);
		
		pos.x = parseInt( pos.x / _map.tile.size );
		pos.y = parseInt( pos.y / _map.tile.size );
		
		if (pos.Check_Range(0, _map.size.x, 0, _map.size.y)) {
			if (_map.map[pos.y][pos.x].type != '') {
				this.state = 'dead';
			}
		}
		
		// Fairy Collide
		var cpoints = this.data.collidePoints;
		for (var cp = 0, len = cpoints.length; cp < len; cp++){
			var pos = new Vector(0,0).Set(cpoints[cp]);
			var cell = pos.Get_Clone();
			
			cell.x = parseInt( pos.x / 50 );
			cell.y = parseInt( pos.y / 50 );
			
			var string = cell.Get_String();
			
			if (string in _shortCut.fairys) {
				var fairys = _shortCut.fairys[string];
				
				for (var f = 0, len = fairys.length; f < len; f++) {
					var fairy = fairys[f];
					
					// Collide Check
					if (fairy.name != this.shoter.name) {
						var rect1 = {
							x : fairy.pos.x-10,
							y : fairy.pos.y-10,
							width : 20,
							height : 20,
						};
						
						var rect2 = {
							x : pos.x-(this.spec.size/2),
							y : pos.y-(this.spec.size/2),
							width : this.spec.size,
							height : this.spec.size,
						};
						
						if (rect1.x < rect2.x + rect2.width &&
							rect1.x + rect1.width > rect2.x &&
							rect1.y < rect2.y + rect2.height &&
							rect1.height + rect1.y > rect2.y) {
							this.state = 'dead';
						}
					}
				}
			}
		}
		
		this.data.collidePoints = [];
	}
	
	Main(tick, Vector) {
		var speed = (this.spec.speed/1000) * tick;
		var pos = new Vector(0,0).Set(this.pos);
		var target = pos.Get_Clone().Set_Move(speed, this.direction);
		
		do {
			pos.Set_Move(1, this.direction);
			
			//this.data.distance += pos.Get_Distance(this.pos);
			
			if (this.data.distance >= this.spec.range) {
				this.state = 'dead';
				break;
			} else {
				this.data.collidePoints.push(pos);
			}
			
			this.pos = pos;
		} while (pos.Get_Distance(target) <= 2);
		
		pos.Set_Move(speed, this.direction);
		
		this.data.distance += pos.Get_Distance(this.pos);
		
		if (this.data.distance >= this.spec.range) {
			this.state = 'dead';
		}
		
		this.pos = pos;
	}
}

module.exports = Bullet_NB10;