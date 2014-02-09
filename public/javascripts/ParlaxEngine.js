$(document).ready(function(){ 
	var currTime = Math.round(new Date().getTime() / 1000);
	var lastTime = currTime;
	var width = $(window).width();
	var height = $(window).height();
	var mouseX  = width/2.0;
	var mouseY = height/2.0;
	var currX = 0;
	var currY = 0;
	var maxSpeed = 100.0;
	var layers;
	var backgoundAlt = 0.005;

	$(window).resize(function(){
		width = $(window).width();
		height = $(window).height();
	});

	$(window).mousemove(function( event ) {
		mouseX = event.pageX;
		mouseY = event.pageY;
	});

	function update(){
		requestAnimationFrame(update);
		currTime = Math.round(new Date().getTime() / 1000);
		var dt = currTime - lastTime;
		lastTime = currTime;

		//Calculate current paralax offset position
		var offsetX = mouseX - (width/2.0);
		var offsetY = mouseY - (height/2.0);
		var amnt = backgoundAlt;
		var top = offsetY*amnt;
		var left = offsetX*amnt;
		$('body').css('background-position', left+"px "+top+"px");
		$(layers).each(function(item) {
			amnt = $(this).attr('data-altitude');
			top = offsetY*amnt;
			left = offsetX*amnt;	
			$(this).css({'top': top+"px", 'left': left+"px"});
		});
	}

	layers = $('.layer');
	requestAnimationFrame(update);
});