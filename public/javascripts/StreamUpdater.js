$(document).ready(function() {
	var currTime = Math.round(new Date().getTime() / 1000);
	var lastTime = currTime;
	var missionTime = $('#postStream').data('init-time');
	var days = 0;
	var hours = 0;
	var minutes = 0;
	var seconds = 0;

	var appendMessagesToList = function(){
		currTime = Math.round(new Date().getTime() / 1000);
		var deltaTime = currTime - lastTime;
		console.log(missionTime, deltaTime);
		lastTime = currTime;
		var urlString = 'http://localhost:9000/streambetween/' + missionTime + '/' + (missionTime + deltaTime);
		console.log(urlString);
		$.getJSON(urlString, function(data){
			data.forEach(function(post){
				$('#postStream').prepend(
					"<li id=post_" + post.timecode + "><div><b>" + post.speaker + "</b></div><div>" + post.body + "</div></li>");
			});
		});
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

		$('#currentMissionTime').text(days+":"+hours+":"+minutes+":"+seconds);
		missionTime += deltaTime;

	}

	setInterval(appendMessagesToList,1000);

}); 