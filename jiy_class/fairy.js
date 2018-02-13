class Fairy {
	constructor() {
		this.name;
		
		this.pos;
		this.velocity;
		
		this.ability;
		
		this.focus;		// 정신 집중
	}
	
	Set(data) {
		this.name = data.name;
		
		this.pos = data.pos;
		this.velocity = data.velocity;
		
		this.ability = data.ability;
		
		this.focus = data.focus;
	}
	
	Move(tick, _map, Vector) {
		var size = _map.tile.size;
		
		// Gravity
		this.velocity.y += (10 / 1000) * tick;

		if (this.velocity.y >= 20) {
			this.velocity.y = 20;
		} else if (this.velocity.y <= -20) {
			this.velocity.y = -20;
		}

		if (this.velocity.x >= 6) {
			this.velocity.x = 6;
		} else if (this.velocity.x <= -6) {
			this.velocity.x = -6;
		}

		// Y Collide
		var collide = false;

		if (this.velocity.y > 0) {
			var pos = this.pos.Get_Clone().Add([0,this.velocity.y+10]);	// Down
			var cell_pos = new Vector( parseInt(pos.x/size), parseInt(pos.y/size) );

			if (cell_pos.Check_Range(0,_map.size.x,0,_map.size.y)) {
				var going = _map.map[cell_pos.y][cell_pos.x];
				if (going.type == 'wall')
					collide = ['down', cell_pos];
			} else
				collide = ['down', cell_pos];

		} else if (this.velocity.y < 0) {
			var pos = this.pos.Get_Clone().Add([0,this.velocity.y-10]);	// Up
			var cell_pos = new Vector( parseInt(pos.x/size), parseInt(pos.y/size) );

			if (cell_pos.Check_Range(0,_map.size.x,0,_map.size.y)) {
				var going = _map.map[cell_pos.y][cell_pos.x];
				if (going.type == 'wall')
					collide = ['top', cell_pos];
			} else
				collide = ['top', cell_pos];
		}

		if (collide) {
			this.velocity.y = 0;
			if (collide[0] == 'down') {
				this.pos.y = collide[1].Get_Clone().Mul([size,size]).Sub([0,10]).y;
			}
			if (collide[0] == 'up') {
				this.pos.y = collide[1].Get_Clone().Mul([size,size]).Add([0,size]).Sub([0,10]).y;
			}
		}

		// X Collide
		var collide = false;

		if (this.velocity.x > 0) {
			var pos = this.pos.Get_Clone().Add([this.velocity.x+10,0]);	// Right
			var cell_pos = new Vector( parseInt(pos.x/size), parseInt(pos.y/size) );

			if (cell_pos.Check_Range(0,_map.size.x,0,_map.size.y)) {
				var going = _map.map[cell_pos.y][cell_pos.x];
				if (going.type == 'wall')
					collide = ['right', cell_pos];
			} else
				collide = ['right', cell_pos];

		} else if (this.velocity.x < 0) {
			var pos = this.pos.Get_Clone().Add([this.velocity.x-10,0]);	// Left
			var cell_pos = new Vector( parseInt(pos.x/size), parseInt(pos.y/size) );

			if (cell_pos.Check_Range(0,_map.size.x,0,_map.size.y)) {
				var going = _map.map[cell_pos.y][cell_pos.x];
				if (going.type == 'wall')
					collide = ['left', cell_pos];
			} else
				collide = ['left', cell_pos];
		}

		if (collide) {
			this.velocity.x = 0;
			if (collide[0] == 'right') {
				this.pos.x = collide[1].Get_Clone().Mul([size,size]).Sub([10,0]).x;
			}
			if (collide[0] == 'left') {
				this.pos.x = collide[1].Get_Clone().Mul([size,size]).Add([size,0]).Add([10,0]).x;
			}
		}
		
		this.pos.y += this.velocity.y;
		this.pos.x += this.velocity.x;
	}
}

module.exports = Fairy;