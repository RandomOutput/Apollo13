$(document).ready(function() {
	var _firstUpdate = true;
	var _currTime = Math.round(new Date().getTime() / 1000);
	var _lastTime = _currTime;
	var _missionTime = $('#postStream').data('init-time');
	var _url_root = 'http://localhost:9000'
	var _width = $(window).width();
	var _height = $(window).height();
	var _docHeight = $(document).height();
	var _lastPost = undefined;
	var _nextPost = undefined;

	var defaultUpdateInterval = 60; //seconds
	var nextUpdateMissionTime = 0;
	var postQueue = []

	$(window).resize(function(){
		_width = $(window).width();
		_height = $(window).height();
	});

	function updateQueue() {
		console.log("updateQueue");
		var urlString = ""
		if(_firstUpdate) {
			urlString = _url_root+'/streambefore/' + 9 + '/' + _missionTime;
			_firstUpdate = false;
		}
		else {
			urlString = _url_root+'/streambetween/' + _missionTime + '/' + (_missionTime + defaultUpdateInterval);
			nextUpdateMissionTime = _missionTime + defaultUpdateInterval;
		}
		

		$.getJSON(urlString, function(data) {
			//Push new unique posts into the queue
			data.forEach(function(post) {
				if( postQueue.indexOf(post) === -1 ) {
					postQueue.unshift(post);
				}
			});
		});
	}

	function getNextPost() {
		if(postQueue.length > 0) {
			return postQueue[postQueue.length - 1];
		}
		else {
			urlString = _url_root+'/nextpost/' + _missionTime;
			_nextPost = $.getJSON(urlString, function(data) {
				_nextPost = data;
			});
		}
	}

	/*
	 * Manage the transmission alert dialog
	 * 
	 * This only manages the timecode and turning on. Turning off is managed separately.
	 */ 
	 function manageNextTransmissionAlert() {
	 	if(_nextPost !== undefined) {
	 		var diff = _nextPost.timecode - _missionTime;
	 		console.log("diff",diff);

	 		$('#nextTransmissionTime').text("Next expected transmission in: T-" + secondsToDateString(diff));

	 		if($('#nextTransmissionTime').hasClass('hidden') && diff >= 8) {
	 			$('#nextTransmissionTime').removeClass('hidden');
	 			$('#nextTransmissionTime').addClass('visible');
	 		}
	 	}
	 	else {
	 		console.log("next post undefined");
	 	}
	 }

	 /*
	  * Check if the next transmission time alert should be hidden and excecute.
	  */
	function checkHideNextTransmissionTime() {
		if(_nextPost !== undefined) {
	 		var diff = _nextPost.timecode - _missionTime;
	 		if($('#nextTransmissionTime').hasClass('visible') && diff < 8) {
	 			$('#nextTransmissionTime').removeClass('visible');
	 			$('#nextTransmissionTime').addClass('hidden');
	 		}
	 	}
	}

	/*
	 * Main Update Loop
	 */
	function updateMission() {
		var pageUpdated = false;

		//Update the mission clock
		updateMissionClock();

		//Hide / Show "next transmission in" alert
		manageNextTransmissionAlert();

		//Ask the server for more messages
		if( _missionTime >= nextUpdateMissionTime ) { updateQueue(); }
		
		//Add new messages to the stream
		while( postQueue.length > 0 && postQueue[postQueue.length - 1].timecode <= _missionTime ) { 
			var post = postQueue.pop();
			appendMessagesToList(post);
			_lastPost = post;
			_nextPost = getNextPost();
			checkHideNextTransmissionTime();
			formatStream();
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
	}

	function updateMissionClock()
	{
		var deltaTime = 0;

		_currTime = Math.round(new Date().getTime() / 1000);
		deltaTime = _currTime - _lastTime;
		_missionTime += deltaTime;
		_lastTime = _currTime;

		$('#currentMissionTime').text("T+" + secondsToDateString(_missionTime));
	}

	function secondsToDateString(timeInSeconds) {
		var days = 0;
		var hours = 0;
		var minutes = 0;
		var seconds = 0;
		var retString = "";
		
		//Update the clock vars
		days = ""+Math.floor(timeInSeconds / (24*60*60));
		timeInSeconds = timeInSeconds % (24*60*60);
		hours = ""+Math.floor(timeInSeconds / (60*60));
		timeInSeconds = timeInSeconds % (60*60);
		minutes = ""+Math.floor(timeInSeconds / 60);
		timeInSeconds = timeInSeconds % 60;
		seconds = ""+timeInSeconds;


		while(hours.length < 2) { hours = "0"+hours; }
		while(minutes.length < 2) { minutes = "0"+minutes; }
		while(seconds.length < 2) { seconds = "0"+seconds; }

		retString = days+":"+hours+":"+minutes+":"+seconds;

		return retString;
	}

	var formatStream = function(){
		$('#postStream').children().each(function(){
			var dist = _height - $(this).offset().top;
			dist = dist/_height;
			dist = Math.round(dist*100)/100;
			$(this).css('opacity', ''+dist);
		});
	}

	var cullStream = function(){
		$('#postStream').children().each(function(){
			var dist = _docHeight - $(this).offset().top;
			dist = dist/_docHeight;

			if(dist < 0) {
				$(this).remove();
			}
		});
	}

	_nextPost = getNextPost();
	updateMission();
	setInterval(updateMission,1000);
}); 