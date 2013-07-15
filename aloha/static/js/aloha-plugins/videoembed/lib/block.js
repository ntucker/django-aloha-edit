define([
   'jquery',
	'block/block',
	'block/blockmanager',
], function(jQuery, block, BlockManager) {
	var VideoBlock = block.AbstractBlock.extend({
		title: 'VideoBlock',
		getSchema: function() {
			return {
				'source': {
					type: 'string',
					label: 'Source'
				},
			}
		},
		init: function($element, postProcessFn) {
			this.attr('source', $element.find('iframe').attr('src'));
			postProcessFn();
		},
		update: function($element, postProcessFn) {
			$element.find('iframe').first().attr('src', this.attr('source'));
			postProcessFn();
		}
	});
	var YoutubeBlock = block.AbstractBlock.extend({
		title: 'YoutubeBlock',
		getSchema: function() {
			return {
				'id': {
					type: 'string',
					label: 'ID'
				},
				'params': {
					type: 'string',
					label: 'Parmas'
				}
			}
		},
		init: function($element, postProcessFn) {
			this.attr('id', $element.data('id'));
			this.attr('params', $element.data('params'));
			postProcessFn();
		},
		update: function($element, postProcessFn) {
			$element.data('id', this.attr('id'));
			$element.data('params', this.attr('params'));
			postProcessFn();
		}
	});
	return {
		VideoBlock: VideoBlock,
		YoutubeBlock: YoutubeBlock
	};
});