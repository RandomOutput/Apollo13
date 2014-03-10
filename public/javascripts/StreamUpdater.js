$(document).ready(function() {
	var _firstUpdate = true;
	var _currTime = Math.round(new Date().getTime() / 1000);
	var _lastTime = _currTime;
	var _missionTime = $('#postStream').data('init-time');
	var _url_root = 'http://localhost:9000'
	var _width = $(window).width();
	var _height = $(window).height();
	var _docHeight = $(document).height();

	var defaultUpdateInterval = 60; //seconds
	var defaultUpdateMargin = 10; //seconds
	var nextUpdateMissionTime = 0;
	var postQueue = []

	$(window).resize(function(){
		_width = $(window)._width();
		_height = $(window)._height();
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
			nextUpdateMissionTime = _missionTime + defaultUpdateInterval - defaultUpdateMargin;
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
		if( _missionTime >= nextUpdateMissionTime ) { updateQueue(); }
		
		//Add new messages to the stream
		while( postQueue.length > 0 && postQueue[postQueue.length - 1].timecode <= _missionTime ) { 
			var post = postQueue.pop();
			appendMessagesToList(post);
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
		var days = 0;
		var hours = 0;
		var minutes = 0;
		var seconds = 0;
		var deltaTime = 0;
		var tempTime = 0;

		_currTime = Math.round(new Date().getTime() / 1000);
		deltaTime = _currTime - _lastTime;
		_missionTime += deltaTime;
		_lastTime = _currTime;
		
		tempTime = _missionTime;

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

	updateMission();
	setInterval(updateMission,1000);
}); 