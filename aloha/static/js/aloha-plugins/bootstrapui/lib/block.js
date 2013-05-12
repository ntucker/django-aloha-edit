define([
   'jquery',
	'block/block',
	'block/blockmanager',
], function(jQuery, block, BlockManager) {
	var ThumbnailBlock = block.AbstractBlock.extend({
		title: 'ThumbnailBlock',
		getSchema: function() {
			return {
				'image': {
					type: 'string',
					label: 'Image URI'
				},
				'caption': {
					type: 'string',
					label: 'Caption'
				},
				'position': {
					type: 'select',
					label: 'Position',
					values: [{
						key: '',
						label: 'No Float'
					}, {
						key: 'left',
						label: 'Float left'
					}, {
						key: 'right',
						label: 'Float right'
					}]
				}
			}
		},
		init: function($element, postProcessFn) {
			this.attr('image', $element.find('img').attr('src'));
			this.attr('caption', $element.find('.caption').text());
			postProcessFn();
		},
		update: function($element, postProcessFn) {
			if (this.attr('position') === 'right') {
				$element.removeClass('pull-left');
				$element.addClass('pull-right');
			} else if (this.attr('position') === 'left') {
				$element.removeClass('pull-right');
				$element.addClass('pull-left');
			} else {
				$element.removeClass('pull-left');
				$element.removeClass('pull-right');
			}

			$element.find('img').attr('src', this.attr('image'));
			$element.find('.caption').text(this.attr('caption'));
			postProcessFn();
		}
	});
	return {
		ThumbnailBlock: ThumbnailBlock,
	};
});