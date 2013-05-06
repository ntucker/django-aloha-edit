define([
        'aloha',
        'aloha/plugin',
        'jquery',
        'ui/ui',
        'ui/button',
        'ui/toggleButton',
        'block/blockmanager',
        ], function (Aloha,
      		  Plugin,
      		  jQuery,
      		  Ui,
      		  Button,
      		  ToggleButton,
      		  BlockManager) {
	'use strict';

	/**
	 * Register the plugin with unique name
	 */
	return Plugin.create('bootstrapui', {
		defaults : {},
		dependencies : [],
		init : function () {
			var plugin = this;
			var spoilerbutton = Ui.adopt("insertSpoilers", Button, {
				tooltip: "spoiler",
				scope: 'Aloha.continuoustext',
				icon: 'aloha-icon icon-warning-sign',
				click: function(){
					plugin.createSpoiler();
				}
			});
			var spoilerbutton = Ui.adopt("formatSpoilers", Button, {
				tooltip: "spoiler",
				scope: 'Aloha.continuoustext',
				icon: 'aloha-icon icon-warning-sign',
				click: function(){
					plugin.createSpoiler();
				}
			});
			var thumbnailbutton = Ui.adopt("insertThumbnail", Button, {
				tooltip: "thumbnail",
				scope: 'Aloha.continuoustext',
				icon: 'aloha-icon icon-picture',
				click: function(){
					plugin.createThumbnail();
				}
			});
			Aloha.bind( 'aloha-editable-created', function (event, editable) {
				jQuery('.accordion-inner, .accordion-toggle', editable.obj).addClass('aloha-editable');
				jQuery('.accordion-group', editable.obj).alohaBlock();

				jQuery('.caption', editable.obj).addClass('aloha-editable');
				jQuery('.thumbnail', editable.obj).alohaBlock();
			});
			Aloha.bind( 'aloha-editable-destroyed', function (event, editable) {
				jQuery('.accordion-inner, .accordion-toggle', editable.obj).mahalo();
				jQuery('.accordion-group', editable.obj).mahaloBlock();

				jQuery('.caption', editable.obj).mahalo();
				jQuery('.thumbnail', editable.obj).mahaloBlock();
			});

			//BlockManager.registerBlockType('ImageBlock', block.ImageBlock);
		},
		createSpoiler: function() {
			// Check if there is an active Editable and that it contains an element (= .obj)
			if ( Aloha.activeEditable && typeof Aloha.activeEditable.obj !== 'undefined' ) {
				var id = GENTICS.Utils.guid();
				var spoiler = jQuery('<div class="accordion-group"> \
						<div class="accordion-heading"> \
						<a class="accordion-toggle aloha-editable" data-toggle="collapse" href="#'+id+'" rel="nofollow" target="_blank" title="Show Spoiler">Spoiler</a> \
						</div> \
						<div class="accordion-body collapse" id="'+id+'" style=""> \
						<div class="accordion-inner aloha-editable"></div> \
						</div> \
						</div> \
				');
				spoiler.alohaBlock();

				GENTICS.Utils.Dom.insertIntoDOM(
						spoiler,
						Aloha.Selection.getRangeObject(),
						Aloha.activeEditable.obj
				);
			}
		},
		createThumbnail: function() { //pull-left, pull-right

			Aloha.require( 'image/image-plugin', function( module ) {
			});
			// Check if there is an active Editable and that it contains an element (= .obj)
			if ( Aloha.activeEditable && typeof Aloha.activeEditable.obj !== 'undefined' ) {
				var thumbnail = jQuery('<div class="thumbnail"><img src="" /><div class="caption aloha-editable"></div></div>');
				thumbnail.alohaBlock();

				GENTICS.Utils.Dom.insertIntoDOM(
						thumbnail,
						Aloha.Selection.getRangeObject(),
						Aloha.activeEditable.obj
				);
			}
		},

	});
});