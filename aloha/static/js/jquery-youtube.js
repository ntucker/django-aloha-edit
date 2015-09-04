define([
	'jquery'
], function (
		$
		) {
	$.fn.activateYoutube = function(trigger, meta) {
		if (trigger === undefined) {
			trigger = true;
		}
		$('.youtube:not([itemprop])', this).empty().each(function(index, element) {
			$youtube = $(element);
			var thumbsrc = "//i.ytimg.com/vi/" + $youtube.data('id') + "/hqdefault.jpg";
			var embedUrl = '//www.youtube.com/embed/' + $youtube.data('id') + '?autoplay=1&'+$youtube.data('params');
			$youtube.css('background-image', "url('"+thumbsrc+"')");
			$youtube.attr({itemprop: 'video', itemscope:'', itemtype:"http://schema.org/VideoObject"});
			var metastr = (
    	        '<meta itemprop="thumbnail" content="'+thumbsrc+'" />'
    	        +'<meta itemprop="thumbnailURL" content="'+thumbsrc+'" />'
    	        +'<meta itemprop="embedUrl" content="'+embedUrl+'" />'
    	    );
			if (meta !== undefined) {
			    for (var propname in meta) {
			        metastr += '<meta itemprop="'+propname+'" content="'+meta[propname]+'" />';
			    }
			}
			$youtube.append($(metastr + '<span class="fa-stack play"><i class="fa fa-circle fa-stack-1x"></i> <i class="fa fa-youtube-play fa-stack-1x"></i></span>'));
			$youtube.after($('<meta itemprop="image" content="'+thumbsrc+'">'))
			if (trigger) {
				$youtube.click(function(event) {
					$(this).html('<iframe src="'+embedUrl+'" allowfullscreen>');
				});
			}
		});
	};
	return $;
});