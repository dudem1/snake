$(function(){
	// listeners
	document.addEventListener('keydown', keyPush);
	document.addEventListener('touchstart', handleTouchStart);
	document.addEventListener('touchmove', handleTouchMove);

	// canvas
	const container=document.querySelector('#snake-game');
	const canvas=document.querySelector('#snake-game canvas');
	const footer_score=document.querySelector('#snake-game footer span');
	const ctx=canvas.getContext("2d");

	// game
	const tile_size=25;
	const tile_count_x=canvas.width/tile_size;
	const tile_count_y=canvas.height/tile_size;
	let fps;
	let game_is_running;
	let can_control;
	let score;
	let fps_interval;
	let start_time;
	let now;
	let then;
	let elapsed;

	// player
	let snake_speed=5;
	let snake_pos_x;
	let snake_pos_y;
	let velocity_x;
	let velocity_y;
	let new_velocity_x;
	let new_velocity_y;
	let tail=[];
	let snake_length;
	let eye_size=tile_size/5;

	// food
	let food_pos_x;
	let food_pos_y;

	function startGameLoop(){
		then=Date.now();

		start_time=then;

		gameLoop();
	}

	function gameLoop(){
		requestAnimationFrame(gameLoop);

		fps_interval=1000/fps;
		now=Date.now();
		elapsed=now-then;

		if(elapsed>fps_interval){
				then=now-(elapsed%fps_interval);

			if(game_is_running){
				drawGame();

				moveStuff();

				can_control=true;
			}
		}
	}

	function startGame(){
		openFullscreen();

		$('.start-game, .game-over').fadeOut(200);

		fps=30;
		game_is_running=true;
		snake_pos_x=0;
		snake_pos_y=canvas.height/2;
		velocity_x=1;
		velocity_y=0;
		new_velocity_x=1;
		new_velocity_y=0;
		snake_length=30;
		score=0;
		tail=[];

		footer_score.textContent=0;

		resetFood();
		startGameLoop();
	}

	$(document).ready(function(){
		$('.start-game').fadeIn(200);
	});

	function moveStuff(){
		if(snake_pos_x%tile_size==0) velocity_x=new_velocity_x;
		if(snake_pos_y%tile_size==0) velocity_y=new_velocity_y;

		snake_pos_x+=snake_speed*velocity_x;
		snake_pos_y+=snake_speed*velocity_y;

		// wall colission
		if(
			snake_pos_x>canvas.width-tile_size ||
			snake_pos_x<0 ||
			snake_pos_y>canvas.height-tile_size ||
			snake_pos_y<0
		) gameOver();


		// game over
		tail.forEach(snake_part=>{
			if(
				snake_pos_x===snake_part.x &&
				snake_pos_y===snake_part.y
			) gameOver();
		})

		// tail
		tail.push({
			x: snake_pos_x,
			y: snake_pos_y
		});
		tail=tail.slice(-1*snake_length);

		// food colission
		if(
			snake_pos_x>=food_pos_x-tile_size/2 &&
			snake_pos_x<food_pos_x+tile_size/2 &&
			snake_pos_y>=food_pos_y-tile_size/2 &&
			snake_pos_y<food_pos_y+tile_size/2
		){
			footer_score.textContent=++score;
			if(fps!=60) fps++;
			snake_length=snake_length+5;
			resetFood();
		}
	}

	function drawGame(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// food
		drawRect(
			"#b3c9a2",
			food_pos_x,
			food_pos_y,
			tile_size,
			tile_size
		);

		// snake tail
		tail.forEach((snake_part, index)=>{
			let tail_thiner=index<tile_size-1?tile_size-index-1:0;

			drawRect(
				"#7db268",
				snake_part.x+tail_thiner/2,
				snake_part.y+tail_thiner/2,
				tile_size-tail_thiner,
				tile_size-tail_thiner
			)
		})

		// snake head
		drawRect(
			"#1d6012",
			snake_pos_x,
			snake_pos_y,
			tile_size,
			tile_size
		);
		// left eye
		drawRect(
			"#e7ded0",
			snake_pos_x+10+(velocity_x*5)+(velocity_y*5),
			snake_pos_y+10-(velocity_x*5)+(velocity_y*5),
			eye_size,
			eye_size
		);
		// right eye
		drawRect(
			"#e7ded0",
			snake_pos_x+10+(velocity_x*5)-(velocity_y*5),
			snake_pos_y+10+(velocity_x*5)+(velocity_y*5),
			eye_size,
			eye_size
		);
	}

	function drawRect(
		color,
		x,
		y,
		width,
		height
	){
		ctx.fillStyle=color;
		ctx.fillRect(x, y, width, height);
	}

	// key control
	function keyPush(e){
		if(can_control){
			switch(e.key){
				case 'ArrowLeft':
				case 'a':
				case 'A':
					if(velocity_x!==1){
						new_velocity_x=-1;
						new_velocity_y=0;
						can_control=false;
					}
					return;
				case 'ArrowUp':
				case 'w':
				case 'D':
					if(velocity_y!==1){
						new_velocity_x=0;
						new_velocity_y=-1;
						can_control=false;
					}
					return;
				case 'ArrowRight':
				case 'd':
				case 'D':
					if(velocity_x!==-1){
						new_velocity_x=1;
						new_velocity_y=0;
						can_control=false;
					}
					return;
				case 'ArrowDown':
				case 's':
				case 'S':
					if(velocity_y!==-1){
						new_velocity_x=0;
						new_velocity_y=1;
						can_control=false;
					}
					return;
			}
		}

		switch(e.key){
			case 'p':
			case 'P':
			case 'r':
			case 'R':
				startGame();
				return;
		}
	}

	// touch control
	var touch_x_down=null;
	var touch_y_down=null;

	function getTouches(e){
		return e.touches || e.originalEvent.touches;
	}

	function handleTouchStart(e){
		const first_touch=getTouches(e)[0];
		touch_x_down=first_touch.clientX;
		touch_y_down=first_touch.clientY;
	};

	function handleTouchMove(e){
		if(
			!touch_x_down ||
			!touch_y_down
		) return;

		var touch_x_up=e.touches[0].clientX;
		var touch_y_up=e.touches[0].clientY;

		var touch_x_diff=touch_x_down-touch_x_up;
		var touch_y_diff=touch_y_down-touch_y_up;

		if(Math.abs(touch_x_diff)>Math.abs(touch_y_diff)){
			if(touch_x_diff>0){
				if(velocity_x!==1){
					new_velocity_x=-1;
					new_velocity_y=0;
					can_control=false;
				}
			}else{
				if(velocity_x!==-1){
					new_velocity_x=1;
					new_velocity_y=0;
					can_control=false;
				}
			}
		}else{
			if(touch_y_diff>0){
				if(velocity_y!==1){
					new_velocity_x=0;
					new_velocity_y=-1;
					can_control=false;
				}
			}else{
				if(velocity_y!==-1){
					new_velocity_x=0;
					new_velocity_y=1;
					can_control=false;
				}
			}
		}

		touch_x_down=null;
		touch_y_down=null;
	};

	function resetFood(){
		if(snake_length===tile_count_x*tile_count_y) gameOver();

		food_pos_x=Math.floor(Math.random()*tile_count_x)*tile_size;
		food_pos_y=Math.floor(Math.random()*tile_count_y)*tile_size;

		if(
			food_pos_x===snake_pos_x &&
			food_pos_y===snake_pos_y
		) resetFood();

		if(tail.some(snake_part=>
			snake_part.x===food_pos_x &&
			snake_part.y===food_pos_y
		)) resetFood();
	}

	function gameOver(){
		game_is_running=false;

		$('.game-over').fadeIn(200);
	}

	$('.game-over .restart, .start-game .play').on("click", function(){
		startGame();
	});

	// Open fullscreen if mobile device
	function openFullscreen(){
		if($(window).width()>360) return;

		var document_element=document.documentElement;

		if(document_element.requestFullscreen){
			document_element.requestFullscreen();
		}else if(document_element.msRequestFullscreen){
			document_element.msRequestFullscreen();
		}else if(document_element.mozRequestFullScreen){
			document_element.mozRequestFullScreen();
		}else if(document_element.webkitRequestFullScreen){
			document_element.webkitRequestFullScreen();
		}
	}
});