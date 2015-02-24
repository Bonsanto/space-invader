var input, field, frames, spFrame, lvFrame,
	alienSprite, tankSprite, citySprite,
	aliens, direction, tank, bullets, cities;

var main = function () {
	field = new Screen(504, 600);
	input = new InputHandler();

	var picture = new Image();

	picture.onload = function () {
		alienSprite = [
			[new Sprite(this, 0, 0, 22, 16), new Sprite(this, 0, 16, 22, 16)],
			[new Sprite(this, 22, 0, 16, 16), new Sprite(this, 22, 16, 16, 16)],
			[new Sprite(this, 38, 0, 24, 16), new Sprite(this, 38, 16, 24, 16)]
		];
		tankSprite = new Sprite(this, 62, 0, 22, 16);
		citySprite = new Sprite(this, 84, 8, 36, 24);

		init();
		run();
	};

	picture.src = "pics/sprites.png";
};

var init = function () {
	var rows = [1, 0, 0, 2, 2];
	aliens = [];
	bullets = [];
	direction = 1;
	spFrame = 0;
	lvFrame = 30;
	frames = 0;
	tank = {
		sprite: tankSprite,
		x: (field.w - tankSprite.w) / 2,
		y: field.h - (30 + tankSprite.h),
		speed: 6
	};
	cities = {
		canvas: {},
		ctx: {},
		y: tank.y - (30 + citySprite.h),
		h: citySprite.h,
		init: function () {
			this.canvas = document.createElement("canvas");
			this.canvas.width = field.w;
			this.canvas.height = this.h;
			this.ctx = this.canvas.getContext("2d");

			for (var i = 0; i < 4; i++)
				this.ctx.drawImage(citySprite.img, citySprite.x, citySprite.y, citySprite.w,
					citySprite.h, 68 + 111 * i, 0, citySprite.w, citySprite.h);
		},
		generateDamage: function (x, y) {
			x = Math.floor(x / 2) * 2;
			y = Math.floor(y / 2) * 2;

			this.ctx.clearRect(x - 2, y - 2, 4, 4);
			this.ctx.clearRect(x + 2, y - 4, 2, 4);
			this.ctx.clearRect(x + 4, y, 2, 2);
			this.ctx.clearRect(x + 2, y + 2, 2, 2);
			this.ctx.clearRect(x - 4, y + 2, 2, 2);
			this.ctx.clearRect(x - 6, y, 2, 2);
			this.ctx.clearRect(x - 4, y - 4, 2, 2);
			this.ctx.clearRect(x - 2, y - 6, 2, 2);
		},
		hits: function (x, y) {
			y -= this.y;
			var data = this.ctx.getImageData(x, y, 1, 1);
			if (data["data"][3] !== 0) {
				this.generateDamage(x, y);
				return true;
			}
			return false;
		}
	};

	cities.init();

	rows.forEach(function (element, index) {
		for (var i = 0; i < 10; i++) {
			aliens.push(new Alien(alienSprite[element],
				30 + i * 30 + [0, 4, 0][element], 30 + index * 30, //[0,4,0] for adding a gap between the aliens
				alienSprite[element][0].w, alienSprite[element][0].h));
		}
	});
};

var run = function () {
	var loop = function () {
		update();
		render();

		window.requestAnimationFrame(loop, field.canvas);
	};
	window.requestAnimationFrame(loop, field.canvas);
};

var update = function () {
	if (input.isDown(37) || input.isDown(65)) tank.x -= tank.speed; // left
	if (input.isDown(39) || input.isDown(68)) tank.x += tank.speed; // right
	//todo: solve small problem with the difference between the middle and real bullet position.
	if (input.isPressed(32)) bullets.push(new Bullet(tank.x + tankSprite.w / 2, tank.y, 0, -8, 3, 9, "steelblue", 0));

	//limitations for the tank position
	bullets.forEach(function (bullet, bulletIndex) {
		bullet.update();

		//If the bullet is outside of the map
		if (bullet.y + bullet.h < 0 || bullet.y > field.h ||
			bullet.x < 0 || bullet.x + bullet.h > field.x) {
			bullets.splice(bulletIndex, 1);
		}

		//If the bullet hits a cities
		if (cities.y < bullet.y + bullet.h / 2 && bullet.y + bullet.h / 2 < cities.y + cities.h) {
			if (cities.hits(bullet.x, bullet.y + bullet.h / 2)) {
				bullets.splice(bulletIndex, 1);
			}
		}

		//If the bullet hits the tank
		if (tank.y < bullet.y + bullet.h / 2 && bullet.y + bullet.h / 2 < tank.y + tank.h) {
			bullets.splice(bulletIndex, 1);
		}

		aliens.forEach(function (alien, alienIndex) {
			if (alienBulletCollision(bullet, alien)) {
				aliens.splice(alienIndex, 1);
				bullets.splice(bulletIndex, 1);

				switch (aliens.length) {
					case 30:
						lvFrame = 40;
						break;
					case 10:
						lvFrame = 20;
						break;
					case 5:
						lvFrame = 15;
						break;
					case 1:
						lvFrame = 6;
						break;
				}
			}
		});
	});

	if (Math.random() < 0.03 && !aliens.isEmpty()) {
		var randomAlien = aliens[Math.round(Math.random() * (aliens.length - 1))];

		aliens.forEach(function (alien) {
			if (aliensCollision(randomAlien, alien)) {
				randomAlien = alien;
			}
		});
		bullets.push(new Bullet(randomAlien.x + randomAlien.w / 2, randomAlien.y + randomAlien.h, 0, 4, 2, 4, "pink", 0));
	}

	tank.x = Math.max(Math.min(tank.x, field.w - (30 + tankSprite.w)), 30);
	frames++;

	if (frames % lvFrame === 0) {
		//changes between one and two
		var min = field.w,
			max = 0;
		spFrame = (spFrame + 1) % 2;

		aliens.forEach(function (element) {
			element.x += 30 * direction;
			max = Math.max(max, element.x + element.w);
			min = Math.min(min, element.x);
		});

		if (max > field.w - 30 || min < 30) {
			direction *= -1;
			aliens.forEach(function (element) {
				element.x += 30 * direction;
				element.y += 30;
			});
		}
	}
};

var render = function () {
	field.clear();

	aliens.forEach(function (element, index) {
		//spFrame makes the sprite to change.
		field.drawSprite(element.sprite[spFrame], element.x, element.y);
	});

	field.ctx.save();

	bullets.forEach(function (bullet) {
		field.drawBullet(bullet);
	});

	field.ctx.restore();
	field.ctx.drawImage(cities.canvas, 0, cities.y);
	field.drawSprite(tankSprite, tank.x, tank.y)
};
