define([
	'aloha',
	'aloha/plugin',
	'jquery',
	'aloha/contenthandlermanager',
	'videoembed/videoembedcontenthandler',
	'videoembed/removeextrabrcontenthandler',
   'ui/ui',
   'ui/button',
   'ui/text',
   'ui/utils',
   'block/blockmanager',
   'videoembed/block',
], function (Aloha,
			 Plugin,
			 jQuery,
			 ContentHandlerManager,
			 VideoEmbedContentHandler,
			 RemoveExtraBrContentHandler,
			 Ui,
			 Button,
			 Text,
			 UiUtil,
			 BlockManager,
			 bootstrapBlock) {
	'use strict';

	/**
	 * Register the plugin with unique name
	 */
	var VideoEmbedPlugin = Plugin.create('videoembed', {
		defaults : {},
		dependencies : [],
		init : function () {
			var plugin = this;
			BlockManager.registerBlockType('VideoBlock', bootstrapBlock.VideoBlock);
			BlockManager.registerBlockType('YoutubeBlock', bootstrapBlock.YoutubeBlock);
			ContentHandlerManager.register( 'videoembed', VideoEmbedContentHandler );
			ContentHandlerManager.register( 'removebr', RemoveExtraBrContentHandler );

			var videobutton = Ui.adopt("addVideo", Button, {
				tooltip: "video",
				scope: 'Aloha.continuoustext',
				icon: 'aloha-icon icon-facetime-video',
				click: function(){
					plugin.createVideo();
				}
			});
			var videobutton = Ui.adopt("insertVideo", Button, {
				tooltip: "video",
				scope: 'Aloha.continuoustext',
				icon: 'aloha-icon icon-facetime-video',
				click: function(){
					plugin.createVideo();
				}
			});
			
			this.bindInteractions();
			this._addVideoUI();
		},
		bindInteractions: function () {
			var plugin = this;
			Aloha.bind( 'aloha-editable-created', function (event, editable) {
				jQuery(editable.obj).activateYoutube(false);
				jQuery('.youtube', editable.obj).alohaBlock({'aloha-block-type': 'YoutubeBlock'});
			});
			Aloha.bind( 'aloha-smart-content-changed', function ( event, editable ) {
				if ( Aloha.activeEditable ) {
					jQuery('[contenteditable!="false"] > .youtube:not(.aloha-block)', editable.obj).alohaBlock({'aloha-block-type': 'YoutubeBlock'});
				}
			});
			Aloha.bind( 'aloha-editable-destroyed', function (event, editable) {
				var youtube = jQuery('.youtube', editable.obj);
				youtube.mahaloBlock();
			});
			BlockManager.bind('block-activate', function (blocks) {
				if (blocks[0].title == "YoutubeBlock") {
					plugin._youtubeIdField.element.find('input').val(blocks[0].$element.data('id'));
					plugin._youtubeParamField.element.find('input').val(blocks[0].$element.data('params'));
				}
			});
		},
		_addVideoUI: function() {
			var scope = 'Aloha.Block.YoutubeBlock';
			var plugin = this;
			this._youtubeIdField = Ui.adopt("videoId", Text, {
				scope: scope,
				setValue: function(value) {
					BlockManager._activeBlock.$element.data('id', value);
					var thumbsrc = "http://i.ytimg.com/vi/" + BlockManager._activeBlock.$element.data('id') + "/hqdefault.jpg";
					BlockManager._activeBlock.$element.css('background-image', "url('"+thumbsrc+"')");
				},
				init: function() {
					this._super();
					this.element.css('width', '230px');
					this.element = UiUtil.wrapWithLabel("Id", this.element);
				},
			});
			this._youtubeParamField = Ui.adopt("videoParams", Text, {
				scope: scope,
				setValue: function(value) {
					BlockManager._activeBlock.$element.data('params', value);
				},
				init: function() {
					this._super();
					this.element.css('width', '240px');
					this.element = UiUtil.wrapWithLabel("Parmas", this.element);
				},
			});
			this._youtubeRemove = Ui.adopt("videoRemove", Button, {
				tooltip: "remove video",
				icon: 'aloha-img icon-trash',
				scope: scope,
				click : function () {
					plugin.removeYoutube();
				}
			});			
		},
		createVideo: function() {
			// Check if there is an active Editable and that it contains an element (= .obj)
			if ( Aloha.activeEditable && typeof Aloha.activeEditable.obj !== 'undefined' ) {
				var video = jQuery('<div><div class="youtube" data-id="" data-params=""></div></div>');
				video.activateYoutube(false);
				video = video.children();
				video.alohaBlock({'aloha-block-type': 'YoutubeBlock'});
				BlockManager.getBlock(video).activate();

				GENTICS.Utils.Dom.insertIntoDOM(
						video,
						Aloha.Selection.getRangeObject(),
						Aloha.activeEditable.obj
				);
			}
		},
		
		removeYoutube: function ( ) {
			var youtube = BlockManager._activeBlock;

			if ( youtube && youtube.title == 'YoutubeBlock' ) {
				//deactivate block
				youtube.unblock();
				//delete element from DOM
				youtube.$element.remove();
			}
		},
	});

	return VideoEmbedPlugin;
});