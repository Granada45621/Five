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
		this.velocity.y += (20 / 1000) * tick;
		
		if (e.mousepos) {
			if (e.mousepos.x > 40) {
				this.movevelocity.x += (10 / 1000) * tick;
			} else if (e.mousepos.x < -40) {
				this.movevelocity.x += (-10 / 1000) * tick;
			} else {
				this.movevelocity.x = this.movevelocity.x / 10;
			}
		}
		
		if (e.jump) {
			e.jump = false;
			this.movevelocity.y -= 10;
			this.velocity.y = 0;
		}
		
		// Velocity Overflow Check
		if (this.velocity.y >= 16) {
			this.velocity.y = 16;
		} else if (this.velocity.y <= -16) {
			this.velocity.y = -16;
		}
		
		if (this.velocity.x >= 16) {
			this.velocity.x = 16;
		} else if (this.velocity.x <= -16) {
			this.velocity.x = -16;
		}
		
		// Move Velocity Overflow Check
		if (this.movevelocity.y >= 10) {
			this.movevelocity.y = 10;
		} else if (this.movevelocity.y <= -10) {
			this.movevelocity.y = -10;
		}
		
		if (this.movevelocity.x >= 4) {
			this.movevelocity.x = 4;
		} else if (this.movevelocity.x <= -4) {
			this.movevelocity.x = -4;
		}
		
		
		var vel = new Vector(0,0).Set(this.velocity).Add(this.movevelocity);
		// Y Collide
		var collide = false;
		
		if (vel.y > 0) {
			var pos = this.pos.Get_Clone().Add([0,vel.y+10]);	// Down
			var cell_pos = new Vector( parseInt(pos.x/size), parseInt(pos.y/size) );
			
			if (cell_pos.Check_Range(0,_map.size.x,0,_map.size.y)) {
				var going = _map.map[cell_pos.y][cell_pos.x];
				if (going.type == 'wall')
					collide = ['down', cell_pos];
			} else {
				collide = ['down', cell_pos];
			}
		} else if (vel.y < 0) {
			var pos = this.pos.Get_Clone().Add([0,vel.y-10]);	// Up
			var cell_pos = new Vector( parseInt(pos.x/size), parseInt(pos.y/size) );
			
			if (cell_pos.Check_Range(0,_map.size.x,0,_map.size.y)) {
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
			
			if (cell_pos.Check_Range(0,_map.size.x,0,_map.size.y)) {
				var going = _map.map[cell_pos.y][cell_pos.x];
				if (going.type == 'wall')
					collide = ['right', cell_pos];
			} else {
				collide = ['right', cell_pos];
			}
		} else if (vel.x < 0) {
			var pos = this.pos.Get_Clone().Add([vel.x-10,0]);	// Left
			var cell_pos = new Vector( parseInt(pos.x/size), parseInt(pos.y/size) );
			
			if (cell_pos.Check_Range(0,_map.size.x,0,_map.size.y)) {
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
		
		this.pos.y += this.velocity.y + this.movevelocity.y;
		this.pos.x += this.velocity.x + this.movevelocity.x;
	}
}

module.exports = Fairy;