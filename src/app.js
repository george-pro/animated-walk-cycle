class AnimatedSprite {
	constructor(width, height) {
		var texture_x = 0;
		var texture_y = 0;
		this.rectangle = new PIXI.Rectangle(texture_x, texture_y, width, height);
	}

	setAnimationSequence(column_start, row, reverse_row, number_of_frames) {
		this.first_frame = column_start * this.rectangle.width;
		this.last_frame = ((number_of_frames - 1) + column_start) * this.rectangle.width;
		this.reverse_row = reverse_row;

		this.rectangle.x = this.first_frame;
		this.rectangle.y = row * this.rectangle.height;
	}

	initSprite(spritesheet, stage) {
		var texture = PIXI.loader.resources[spritesheet].texture;
		texture.frame = this.rectangle;

		this.sprite = new PIXI.Sprite(texture);
		stage.addChild(this.sprite); // Place sprite on the stage
	}

	centerOnCanvas(renderer) {
		var width_of_canvas = renderer.width;
		var width_of_sprite = this.rectangle.width * this.sprite.scale.x;
		var height_of_canvas = renderer.height;
		var height_of_sprite = this.rectangle.height * this.sprite.scale.y;

		this.sprite.x = (width_of_canvas / 2) - (width_of_sprite / 2);
		this.sprite.y = (height_of_canvas / 2) - (height_of_sprite / 2);
	}

	nextTile() {
		this.rectangle.x += this.rectangle.width;
		if (this.rectangle.x > this.last_frame) {
			this.rectangle.x = this.first_frame;
		}

		this.sprite.texture.frame = this.rectangle;
	}
}

class WalkingSprite extends AnimatedSprite {
	constructor(width, height, velocity) {
		super(width, height);

		this.velocity = velocity; // in pixels per frame
	}

	walk(renderer) {
		// if sprite is offscreen, reverse direction
		var width_of_sprite = this.rectangle.width * this.sprite.scale.x;
		if (this.sprite.x > renderer.width || this.sprite.x < (-1 * width_of_sprite)) {
			this.velocity *= -1; // reverse direction
			var temp = this.rectangle.y / this.rectangle.height;
			this.rectangle.y = this.reverse_row * this.rectangle.height;
			this.reverse_row = temp;
		}
		this.sprite.x += this.velocity;
	}
}

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // fix blur

const renderer = PIXI.autoDetectRenderer(512, 512, {transparent: true, resolution: 1});
document.getElementById('display').appendChild(renderer.view); // renderer.view is a canvas

const stage = new PIXI.Container(); // a 'stage' is a level or page of content
var randi;

function loopCycle() {
	requestAnimationFrame(loopCycle); // wibbly wobbly timey wimey... stuff
	randi.walk(renderer);
	renderer.render(stage);
}

function onLoad() {
	// Initialize Randi
	randi = new WalkingSprite(32, 32, 2); // width, height, velocity (in pixels per frame)
	randi.initSprite('img/randi-spritesheet.png', stage); // spritesheet & stage
	// Set the correct animation sequence from the spritesheet, scale the image, and
	// center the image on the canvas
	randi.sprite.scale.set(4.0); // 4x the original size
	randi.centerOnCanvas(renderer);

	var column_start = 1;
	var row = 1;
	var reverse_row = 3;
	var number_of_frames = 6;
	randi.setAnimationSequence(column_start, row, reverse_row, number_of_frames);

	setInterval(
		function() {
			randi.nextTile();
		}, 125
	);
	loopCycle();
}

PIXI.loader
	.add('img/randi-spritesheet.png')
	.load(onLoad);

console.log('update ' + 6);