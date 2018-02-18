class Gun {
	constructor() {
		this.spec = {
			cooltime : 0.1,
		};
		
		this.state = {
			cooltime : 0,
		};
		
		this.bullet;
	}
	
	Set(data) {
		this.bullet = data.bullet;		// Text
	}
	
	Shot() {
		this.state.cooltime = this.spec.cooltime;
	}
	
	Main(tick) {
		this.state.cooltime -= tick;
	}
}

module.exports = Gun;