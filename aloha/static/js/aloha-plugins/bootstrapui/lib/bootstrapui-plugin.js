define([
        'aloha',
        'aloha/plugin',
        'jquery',
        'ui/ui',
        'ui/button',
        'ui/toggleButton',
        'ui/text',
        'ui/utils',
        'block/blockmanager',
        'bootstrapui/block',
        ], function (Aloha,
      		  Plugin,
      		  jQuery,
      		  Ui,
      		  Button,
      		  ToggleButton,
      		  Text,
      		  UiUtil,
      		  BlockManager,
      		  bootstrapBlock) {
	'use strict';

	/**
	 * Register the plugin with unique name
	 */
	return Plugin.create('bootstrapui', {
		defaults : {},
		dependencies : [],
		init : function () {
			var plugin = this;
			BlockManager.registerBlockType('ThumbnailBlock', bootstrapBlock.ThumbnailBlock);
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
			
			
			this._addThumbnailUI();
			
			this.bindInteractions();
		},
		_addThumbnailUI: function() {
			var plugin = this;
			var scope = 'Aloha.Block.ThumbnailBlock';

			this._thumbnailSrcField = Ui.adopt("thumbnailSrc", Text, {
				label:'src',
				scope: scope,
				setValue: function(value) {
					BlockManager._activeBlock.attr('image', value);
				},
				init: function() {
					this._super();
					this.element = UiUtil.wrapWithLabel("Source", this.element);
				},
			});
			this._thumbnailCaptionField = Ui.adopt("thumbnailCaption", Text, {
				label:'caption',
				scope: scope,
				setValue: function(value) {
					BlockManager._activeBlock.attr('caption', value);
				},
				init: function() {
					this._super();
					this.element = UiUtil.wrapWithLabel("Caption", this.element);
				},
			});
			this._thumbnailAlignLeftButton = Ui.adopt("thumbnailAlignLeft", Button, {
				tooltip: "align left",
				icon: 'aloha-img icon-align-left',
				scope: scope,
				click : function () {
					BlockManager._activeBlock.attr('position', 'left');
				}
			});

			this._thumbnailAlignRightButton = Ui.adopt("thumbnailAlignRight", Button, {
				tooltip: "align right",
				icon: 'aloha-img icon-align-right',
				scope: scope,
				click : function () {
					BlockManager._activeBlock.attr('position', 'right');
				}
			});

			this._thumbnailAlignNoneButton = Ui.adopt("thumbnailAlignNone", Button, {
				tooltip: "align none",
				icon: 'aloha-img icon-align-justify',
				scope: scope,
				click : function () {
					BlockManager._activeBlock.attr('position', '');
				}
			});
		},
		bindInteractions: function () {
			var plugin = this;
			Aloha.bind( 'aloha-editable-created', function (event, editable) {
				jQuery('.accordion-inner, .accordion-toggle', editable.obj).addClass('aloha-editable');
				jQuery('.accordion-group', editable.obj).alohaBlock();

				jQuery('.thumbnail', editable.obj).alohaBlock({'aloha-block-type': 'ThumbnailBlock'});
				jQuery('.thumbnail img', editable.obj).addClass('aloha-ui'); //this prevents the image plugin from activating
			});
			Aloha.bind( 'aloha-editable-destroyed', function (event, editable) {
				jQuery('.accordion-inner, .accordion-toggle', editable.obj).mahalo();
				jQuery('.accordion-group', editable.obj).mahaloBlock();

				jQuery('.thumbnail', editable.obj).mahaloBlock();
			});
			BlockManager.bind('block-activate', function (blocks) {
				plugin._thumbnailSrcField.element.find('input').val(blocks[0].attr('image'));
				plugin._thumbnailCaptionField.element.find('input').val(blocks[0].attr('caption'));
			});
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

			/*Aloha.require( 'image/image-plugin', function( module ) {
			});*/
			// Check if there is an active Editable and that it contains an element (= .obj)
			if ( Aloha.activeEditable && typeof Aloha.activeEditable.obj !== 'undefined' ) {
				var thumbnail = jQuery('<div class="thumbnail"><img src="" class="aloha-ui" /><div class="caption">Caption</div></div>');
				thumbnail.alohaBlock({'aloha-block-type': 'ThumbnailBlock'});

				GENTICS.Utils.Dom.insertIntoDOM(
						thumbnail,
						Aloha.Selection.getRangeObject(),
						Aloha.activeEditable.obj
				);
			}
		},

	});
});