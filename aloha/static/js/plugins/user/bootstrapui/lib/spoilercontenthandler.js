define(
	['aloha', 'jquery', 'aloha/contenthandlermanager'],
	function(Aloha, jQuery, ContentHandlerManager) {
		"use strict";
	
		var SpoilerContentHandler = ContentHandlerManager.createHandler({
			handleContent: function( content, options, editable ) {
				options = options || {};
				if (options.command === 'getContents') {
					if (typeof content === 'string') {
						content = jQuery('<div>' + content + '</div>');
					} else if (content instanceof jQuery) {
						content = jQuery('<div>').append(content);
					}
					jQuery('.panel-collapse', content).addClass('collapse').removeClass("in");
					jQuery('.accordion-toggle', content).addClass('collapsed');
					jQuery('.panel-body', content).removeAttr('contenteditable');
					jQuery('.panel', content).removeAttr('contenteditable');
					return content.html();
				}
				return content;
			}
		});
		return SpoilerContentHandler;
	});
