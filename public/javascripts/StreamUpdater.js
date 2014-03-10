$(document).ready(function() {
	var firstUpdate = true;
	var currTime = Math.round(new Date().getTime() / 1000);
	var lastTime = currTime;
	var missionTime = $('#postStream').data('init-time');
	var url_root = 'http://localhost:9000'
	var width = $(window).width();
	var height = $(window).height();
	var docHeight = $(document).height();

	$(window).resize(function(){
		width = $(window).width();
		height = $(window).height();
	});

	var lastUpdateMissionTime = 0;
	var defaultUpdateInterval = 60; //seconds
	var defaultUpdateMargin = 10; //seconds
	var nextUpdateMissionTime = 0;
	var postQueue = []

	function updateQueue() {
		console.log("updateQueue");
		var urlString = ""
		if(firstUpdate) {
			urlString = url_root+'/streambefore/' + 9 + '/' + missionTime;
			firstUpdate = false;
		}
		else {
			urlString = url_root+'/streambetween/' + missionTime + '/' + (missionTime + defaultUpdateInterval);
			nextUpdateMissionTime = missionTime + defaultUpdateInterval - defaultUpdateMargin;
		}
		
		console.log(urlString);

		$.getJSON(urlString, function(data) {
			//Push new unique posts into the queue
			data.forEach(function(post) {
				console.log(post);
				if( data.indexOf(post) !== -1 ) {
					postQueue.unshift(post);
				}
			});
		});
	}

	function updateMission() {
		var pageUpdated = false;

		//Update the mission clock
		updateMissionClock();

		//Ask the server for more messages
		if( missionTime >= nextUpdateMissionTime ) { updateQueue(); }
		
		//Add new messages to the stream
		while( postQueue.length > 0 && postQueue[postQueue.length - 1].timecode <= missionTime ) { 
			var post = postQueue.pop();
			appendMessagesToList(post);
			pageUpdated = true;
		}

		//Remove old messages from the stream
		if(pageUpdated) { 
			cullStream();
		}
	}

	var appendMessagesToList = function(post){
		$('#postStream').prepend(
			"<li id=post_" + post.timecode + "><div class='speaker'>" + post.speaker + "</div><div class='message'>" + post.body + "</div></li>");
		$('#post_'+post.timecode).hide().slideDown(100);
		formatStream();
	}

	function updateMissionClock()
	{
		var days = 0;
		var hours = 0;
		var minutes = 0;
		var seconds = 0;
		var deltaTime = 0;
		var tempTime = 0;

		currTime = Math.round(new Date().getTime() / 1000);
		deltaTime = currTime - lastTime;
		missionTime += deltaTime;
		lastTime = currTime;
		tempTime = missionTime;

		//Update the clock vars
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

	updateMission();
	setInterval(updateMission,1000);
}); 