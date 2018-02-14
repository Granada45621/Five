class Fairy {
	constructor() {
		this.name;
		
		this.pos;
		this.velocity;			// 강제 가속도
		this.movevelocity;		// 조정 가속도
		
		this.ability;
		
		this.focus;		// 정신 집중
		
		this.event;
	}
	
	Set(data) {
		this.name = data.name;
		
		this.pos = data.pos;
		this.velocity = data.velocity;
		this.movevelocity = data.movevelocity;
		
		this.ability = data.ability;
		
		this.focus = data.focus;
		
		this.event = {
			mousepos : false,		// Vector
			jump : false,
		};
	}
	
	Move(tick, _map, Vector) {
		var size = _map.tile.size;
		var e = this.event;
		
		// Gravity
		this.velocity.y += (10) * tick;
		
		if (e.mousepos) {
			if (e.mousepos.x > 40) {
				this.movevelocity.x += (10) * tick;
			} else if (e.mousepos.x < -40) {
				this.movevelocity.x += (-10) * tick;
			} else {
				this.movevelocity.x /= (200) * tick;
			}
		}
		
		if (e.jump) {
			e.jump = false;
			this.movevelocity.y = -(900 * tick);
			this.velocity.y = 0;
		} else {
			this.movevelocity.y += 5 * tick;
		}
		
		// Velocity Overflow Check
		if (this.velocity.y >= 1800 * tick) {
			this.velocity.y = 1800 * tick;
		} else if (this.velocity.y <= -1800 * tick) {
			this.velocity.y = -1800 * tick;
		}
		
		if (this.velocity.x >= 1800 * tick) {
			this.velocity.x = 1800 * tick;
		} else if (this.velocity.x <= -1800 * tick) {
			this.velocity.x = -1800 * tick;
		}
		
		// Move Velocity Overflow Check
		if (this.movevelocity.y >= 0 * tick) {
			this.movevelocity.y = 0 * tick;
		} else if (this.movevelocity.y <= -900 * tick) {
			this.movevelocity.y = -900 * tick;
		}
		
		if (this.movevelocity.x >= 300 * tick) {
			this.movevelocity.x = 300 * tick;
		} else if (this.movevelocity.x <= -300 * tick) {
			this.movevelocity.x = -300 * tick;
		}
		
		
		var vel = new Vector(0,0).Set(this.velocity).Add(this.movevelocity);
		// Y Collide
		var collide = false;
		
		if (vel.y > 0) {
			var pos = this.pos.Get_Clone().Add([0,vel.y+10]);	// Down
			var cell_pos = new Vector( parseInt(pos.x/size), parseInt(pos.y/size) );
			
			if (cell_pos.Check_Range(1,_map.size.x,1,_map.size.y)) {
				var going = _map.map[cell_pos.y][cell_pos.x];
				if (going.type == 'wall')
					collide = ['down', cell_pos];
			} else {
				collide = ['down', cell_pos];
			}
		} else if (vel.y < 0) {
			var pos = this.pos.Get_Clone().Add([0,vel.y-10]);	// Up
			var cell_pos = new Vector( parseInt(pos.x/size), parseInt(pos.y/size) );
			
			if (cell_pos.Check_Range(1,_map.size.x,1,_map.size.y)) {
				var going = _map.map[cell_pos.y][cell_pos.x];
				if (going.type == 'wall')
					collide = ['top', cell_pos];
			} else {
				collide = ['top', cell_pos];
			}
		}
		
		if (collide) {
			this.velocity.y = 0;
			this.movevelocity.y = 0;
			if (collide[0] == 'down') {
				this.pos.y = collide[1].Get_Clone().Mul([size,size]).Sub([0,10]).y;
			}
			if (collide[0] == 'up') {
				this.pos.y = collide[1].Get_Clone().Mul([size,size]).Add([0,size]).Sub([0,10]).y;
			}
		}
		
		// X Collide
		var collide = false;
		
		if (vel.x > 0) {
			var pos = this.pos.Get_Clone().Add([vel.x+10,0]);	// Right
			var cell_pos = new Vector( parseInt(pos.x/size), parseInt(pos.y/size) );
			
			if (cell_pos.Check_Range(1,_map.size.x,1,_map.size.y)) {
				var going = _map.map[cell_pos.y][cell_pos.x];
				if (going.type == 'wall')
					collide = ['right', cell_pos];
			} else {
				collide = ['right', cell_pos];
			}
		} else if (vel.x < 0) {
			var pos = this.pos.Get_Clone().Add([vel.x-10,0]);	// Left
			var cell_pos = new Vector( parseInt(pos.x/size), parseInt(pos.y/size) );
			
			if (cell_pos.Check_Range(1,_map.size.x,1,_map.size.y)) {
				var going = _map.map[cell_pos.y][cell_pos.x];
				if (going.type == 'wall')
					collide = ['left', cell_pos];
			} else {
				collide = ['left', cell_pos];
			}
		}
		
		if (collide) {
			this.velocity.x = 0;
			this.movevelocity.x = 0;
			if (collide[0] == 'right') {
				this.pos.x = collide[1].Get_Clone().Mul([size,size]).Sub([10,0]).x;
			}
			if (collide[0] == 'left') {
				this.pos.x = collide[1].Get_Clone().Mul([size,size]).Add([size,0]).Add([10,0]).x;
			}
		}
		
		//var clone = this.pos.Get_Clone();
		
		this.pos.y += this.velocity.y + this.movevelocity.y;
		this.pos.x += this.velocity.x + this.movevelocity.x;
		
		/*var d = this.pos.Get_Clone().Sub(clone);
		console.log(d, tick);*/
	}
}

module.exports = Fairy;