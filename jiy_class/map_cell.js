class MapCell {
	constructor() {
		this.pos;
		this.type;
	}
	
	Set(data) {
		this.pos = data.pos;
		this.type = data.type;
	}
}

module.exports = MapCell;