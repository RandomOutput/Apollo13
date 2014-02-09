$(document).ready(function() {
	var currTime = Math.round(new Date().getTime() / 1000);
	var lastTime = currTime;
	var missionTime = $('#postStream').data('init-time');
	var days = 0;
	var hours = 0;
	var minutes = 0;
	var seconds = 0;
	var width = $(window).width();
	var height = $(window).height();
	var docHeight = $(document).height();

	$(window).resize(function(){
		width = $(window).width();
		height = $(window).height();
	});

	var appendMessagesToList = function(){
		currTime = Math.round(new Date().getTime() / 1000);
		var deltaTime = currTime - lastTime;
		lastTime = currTime;
		var urlString = 'http://localhost:9000/streambetween/' + missionTime + '/' + (missionTime + deltaTime);
		$.getJSON(urlString, function(data){
			data.forEach(function(post){
				$('#postStream').prepend(
					"<li id=post_" + post.timecode + "><div class='speaker'>" + post.speaker + "</div><div class='message'>" + post.body + "</div></li>");
				$('#post_'+post.timecode).hide().slideDown(100);
				formatStream();
			});
		});

		cullStream();

		var tempTime = missionTime;
		days = ""+Math.floor(tempTime / (24*60*60));
		tempTime = tempTime % (24*60*60);
		hours = ""+Math.floor(tempTime / (60*60));
		tempTime = tempTime % (60*60);
		minutes = ""+Math.floor(tempTime / 60);
		tempTime = tempTime % 60;
		seconds = ""+tempTime;

		while(hours.length < 2) { hours = "0"+hours; }
		while(minutes.length < 2) { minutes = "0"+minutes; }
		while(seconds.length < 2) { seconds = "0"+seconds; }

		$('#currentMissionTime').text("T+"+days+":"+hours+":"+minutes+":"+seconds);
		missionTime += deltaTime;

	}

	var formatStream = function(){
		$('#postStream').children().each(function(){
			var dist = height - $(this).offset().top;
			dist = dist/height;
			dist = Math.round(dist*100)/100;
			$(this).css('opacity', ''+dist);
		});
	}

	var cullStream = function(){
		$('#postStream').children().each(function(){
			var dist = docHeight - $(this).offset().top;
			dist = dist/docHeight;

			if(dist < 0) {
				$(this).remove();
			}
		});
	}

	cullStream();
	formatStream();
	setInterval(appendMessagesToList,1000);

}); 