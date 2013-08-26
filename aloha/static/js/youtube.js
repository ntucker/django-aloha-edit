(function( $ ) {
	$.fn.activateYoutube = function(trigger) {
		if (trigger === undefined) {
			trigger = true;
		}
		$('.youtube', this).empty().each(function(index, element) {
			$youtube = $(element);
			var thumbsrc = "http://i.ytimg.com/vi/" + $youtube.data('id') + "/hqdefault.jpg";
			$youtube.css('background-image', "url('"+thumbsrc+"')");
			$youtube.append($('<span class="icon-stack play"><i class="icon-circle icon-stack-base"></i><i class="icon-youtube-play"></i></span>'));
			var width = $youtube.outerWidth();
			var height = width * 0.5625;
			$youtube.height(height);
			if (trigger) {
				$youtube.click(function(event) {
					$(this).html('<iframe src="//www.youtube.com/embed/' + $(this).data('id')
				        + '?autoplay=1&'+$(this).data('params')+'" frameborder="0" allowfullscreen width="'+width+'" height="'+height+'">');
				});
			}
		});
	};
})( jQuery );