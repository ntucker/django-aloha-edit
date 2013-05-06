define([
	'aloha',
	'aloha/plugin',
	'jquery',
	'aloha/contenthandlermanager',
	'videoembed/videoembedcontenthandler',
	'videoembed/removeextrabrcontenthandler'
], function (Aloha,
			 Plugin,
			 jQuery,
			 ContentHandlerManager,
			 VideoEmbedContentHandler,
			 RemoveExtraBrContentHandler) {
	'use strict';

	/**
	 * Register the plugin with unique name
	 */
	var VideoEmbedPlugin = Plugin.create('videoembed', {
		defaults : {},
		dependencies : [],
		init : function () {
			ContentHandlerManager.register( 'videoembed', VideoEmbedContentHandler );
			ContentHandlerManager.register( 'removebr', RemoveExtraBrContentHandler );
			Aloha.bind( 'aloha-editable-created', function (event, editable) {
				jQuery('iframe', editable.obj).wrap('<div />').parent().alohaBlock();
			});
			Aloha.bind( 'aloha-smart-content-changed', function ( event, editable ) {
				if ( Aloha.activeEditable ) {
					jQuery('[contenteditable!="false"] > iframe', editable.obj).wrap('<div />').parent().alohaBlock();
				}
			});
			Aloha.bind( 'aloha-editable-destroyed', function (event, editable) {
				var iframe = jQuery('iframe', editable.obj);
				iframe.parent().mahaloBlock();
				iframe.unwrap();
			});
		}
	});

	return VideoEmbedPlugin;
});