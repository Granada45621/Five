class Bullet_NB10 {
	constructor() {
		this.name = 'NB10';
		this.shoter;
		
		this.direction;
		this.pos;
		
		this.spec = {
			damage : 10,
			speed : 1200,	// per second pixel
			
			range : 800,	// pixel
			
			size : 4,
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
		};
	}
	
	Main(tick, Vector) {
		var speed = (this.spec.speed/1000) * tick;
		var pos = new Vector(0,0).Set(this.pos);
		//var target = pos.Get_Clone().Set_Move(speed, this.direction);
		
		/*do {
			pos.Set_Move(speed, this.direction);
			
			this.data.distance += pos.Get_Distance(this.pos);
			
			if (this.data.distance >= this.spec.range) {
				this.state = 'dead';
				break;
			}
			
			this.pos = pos;
		} while (pos.Get_Distance(target) <= 4);*/
		
		pos.Set_Move(speed, this.direction);
		
		this.data.distance += pos.Get_Distance(this.pos);
		
		if (this.data.distance >= this.spec.range) {
			this.state = 'dead';
		}
		
		this.pos = pos;
	}
}

module.exports = Bullet_NB10;