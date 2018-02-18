class Map {
	constructor() {
		this.seed;
		
		this.map;
		this.size;
		
		this.tile;
	}
	
	Set(data) {
		this.seed = data.seed;
		
		this.map = data.map;
		this.size = data.size;
		
		this.tile = data.tile;
	}
	
	Create_Map(Noise, MapCell, Vector) {
		Noise.seed(this.seed);
		
		for (var y = 0; y < this.size.y; y++) {
			// Push "[]{array}" In "this.map{array}"
			this.map.push([]);
			
			for (var x = 0; x < this.size.x; x++) {
				// Create "Cell{class}" Input Data
				var data = {
					pos : new Vector(x,y),
					type : ''
				};
				
				// Define Wall
				var value = 0;
				
				if ((y % 4) == 0) {
					value += 0.8;
				}
				
				if ((x % 8) == 0) {
					value += 0.3;
				}
				
				value += Noise.perlin2(x / 4, y / 4);
				if (value >= 0.6){
					data.type = 'wall';
				}
				
				// Create "tile{var class}" Use "Cell{class}"
				var tile = new MapCell();
				tile.Set(data);
				
				// Push "tile{var class}" In "this.map[y]{array}"
				this.map[y].push(tile);
			}
		}
	}
}

module.exports = Map;