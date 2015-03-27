//* TITLE Volume **//
//* VERSION 1.0 REV A **//
//* DESCRIPTION Adds volume controls next to all Tumblr-hosted audio posts. **//
//* DEVELOPER ruirize **//
//* FRAME false **//
//* BETA false **//

XKit.extensions.ruirize_volume = new Object({
	running: false,
	run: function() {
		XKit.tools.init_css("ruirize_volume");
		XKit.post_listener.add("ruirize_volume", XKit.extensions.ruirize_volume.addVolumeControls);

		XKit.extensions.ruirize_volume.addVolumeControls();
	},
	destroy: function() {
		XKit.tools.remove_css("ruirize_volume");
		$("ruirize-volume").remove();
		$("ruirize-volume-setup").removeClass("ruirize-volume-setup");
		$("ruirize-volume-loaded").removeClass("ruirize-volume-loaded");
	},

	addVolumeControls: function() {
		var posts = XKit.interface.get_posts("ruirize-volume-setup", false);
		$(posts).each(function(index) {
			$(this).addClass("ruirize-volume-setup");
			var currentPost = XKit.interface.post($(this));
			if (currentPost.type != "audio") return;

			var thisPost = $(this);
			$(this).find(".post_content_inner").get(0).addEventListener("DOMNodeInserted", function (ev) {
				console.log(ev.target);
				if ($(ev.target).prop("tagName") == "AUDIO" && !thisPost.hasClass("ruirize-volume-loaded")) {
					XKit.extensions.ruirize_volume.constructVolumeControl(thisPost);
					thisPost.addClass("ruirize-volume-loaded");
				}
			}, false);
		});
	},

	constructVolumeControl: function(post) {
		var volumeControl = $(('<div class="ruirize-volume"><div class="ruirize-current-volume"></div><div class="ruirize-volume-cursor"></div></div>'))
			.appendTo(post.find('.audio_controls'));
		var audioElement = post.find('audio');
		console.log(audioElement);

		var isMouseDown = false;
		volumeControl.mousemove(function(ev){
			$(this).children(".ruirize-volume-cursor").css("top", ev.offsetY + "px");

			if (isMouseDown) {
				var volume = 1 - (ev.offsetY / $(this).height());
				XKit.extensions.ruirize_volume.updateVolume(volume, volumeControl, audioElement);
			}
		});

		volumeControl.mousedown(function(ev){
			if (ev.button !== 0) return;
			
			isMouseDown = true;

			var volume = 1 - (ev.offsetY / $(this).height());
			XKit.extensions.ruirize_volume.updateVolume(volume, volumeControl, audioElement);
		});

		volumeControl.mouseup(function(ev){
			isMouseDown = false;
		});
		volumeControl.mouseout(function(ev){
			isMouseDown = false;
		});
		volumeControl.bind('dragstart', function(event) { event.preventDefault(); });
		
		var initialVolume = XKit.extensions.ruirize_volume.readCookie("ruirize-volume-preference");
		if (initialVolume == null) {
			initialVolume = 0.8
		}
		XKit.extensions.ruirize_volume.updateVolume(initialVolume, volumeControl, audioElement);
	},

	updateVolume: function(volume, volumeControlElement, audioElement) {
		volumeControlElement.children(".ruirize-current-volume").height(volume * volumeControlElement.height());
		audioElement.prop("volume", volume);
		XKit.extensions.ruirize_volume.createCookie("ruirize-volume-preference", volume, 365);
	},
	
	readCookie: function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	},
	createCookie: function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}
});