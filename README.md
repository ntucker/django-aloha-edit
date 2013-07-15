django-aloha-edit
=================

Provides easy integration of the Aloha Editor into your Django app as well as several additional Aloha plugins.

Installing
----------

    pip install django-aloha-edit

Usage
-----

Using the HTMLField:

    from aloha.fields import HTMLField

    class myModel(models.Model):
        content = HTMLField()

This will allow you to sanitize the output while automatically using the Aloha Widget

These settings will allow customization of the sanitizer:

    ALLOWED_TAGS = ['a', 'abbr', ]
    ALLOWED_ATTRIBUTES = {
                    'a'         : ['href', 'rel', 'target', 'title',],
                 }
    ALLOWED_STYLES = ['float','text-align','width','height',]
    ALLOWED_CLASSES = ['error', 'success', 'warning', 'info',
                       ]
    IFRAME_ORIGINS = ["http://www.youtube.com/embed/", "http://blip.tv/play/"]

Extra Plugins
-------------

### Video Embed

This plugin provides video embedding capabilities. It currently supports both blip and youtube, but other services can easily be added.
This plugin provides both a content handler (so you can copy/paste links) as well as UI elements in the Aloha bar to manipulate and add
video embeds.

For youtube videos, the embed include a special div that will reduce load on usage. You must include /static/js/youtube.js on both the
edit page as well as the page that shows the content. This provides a jQuery function to activate the click functionality so the
actual video will load when a user clicks it. Make sure to call this on page load of any page you are presenting your HTML content.

e.g.) $(function() {$(body).activateYoutube();});

### Bootstrap UI

This plugin provides manipulation of several [bootstrap](http://twitter.github.io/bootstrap/) elements including collapse (called spoiler here)
and thumbnails. Make sure you include the appropriate css and javascript for those parts of bootstrap or they will not work.

### Usage

Make sure to load the plugins in either the aloha config file or the script load specification. Use 'user/videoembed', 'user/bootstrapui'

You must also add the UI elements to the UI configuration. Below is a sample config:

```javascript
Aloha = window.Aloha || {};
Aloha.settings = {
		sidebar: {
			disabled: true
		},
		plugins: {
			load: ['common/ui','common/commands','common/format','common/list', 'common/align',
			       'common/table','common/image','common/undo','common/abbr',
			       'common/link','common/contenthandler','common/paste','common/block','common/characterpicker',
			       'user/videoembed', 'user/bootstrapui'],
		},
		toolbar: {
			tabs: [
			       {
			      	 label: 'tab.format.label',
			      	 showOn: { scope: 'Aloha.continuoustext' },
			      	 components: [
			      	              [
											'bold', 'strong', 'italic', 'emphasis', '\n',
											'subscript', 'superscript', 'strikethrough', 'quote',
											], [
											'formatLink', 'formatAbbr', 'formatNumeratedHeaders', 'toggleDragDrop', '\n',
											'formatSpoilers', 'formatThumbnail', 'addVideo', '\n',
											'toggleMetaView', 'wailang', 'toggleFormatlessPaste',
											], [
											'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', '\n',
											'orderedList', 'unorderedList', 'indentList', 'outdentList'
											], [
											'formatBlock'
											]
			      	              ]
			       },
			       {
			      	 label: "tab.insert.label",
			      	 showOn: { scope: 'Aloha.continuoustext' },
			      	 components: [
			      	              [ "createTable", "characterPicker", "insertLink",
			      	                "insertImage", "insertAbbr", "insertToc",
			      	                "insertHorizontalRule", "insertTag", 'insertSpoilers', 'insertVideo','insertThumbnail',]
			      	              ]
			       },
			       {
			      	 label: "tab.img.label",
			      	 showOn: {scope: 'image'},
			      	 components: [
			      	              [ "imageSource", "\n",
			      	                "imageTitle" ],
			      	                [ "imageResizeWidth", "\n",
			      	                  "imageResizeHeight" ],
			      	                  [ "imageAlignLeft", "imageAlignRight", "imageAlignNone", "\n",
			      	                    "imageCropButton", "imageCnrReset", "imageCnrRatio",   ],
			      	                    [ "imageBrowser" ],
			      	              			["wrapThumbnail",]
			      	              ]
			       },
			       {
			      	 label: "Thumbnail",
			      	 showOn: { scope: 'Aloha.Block.ThumbnailBlock' },
			      	 components: [
			      	              [ "thumbnailSrc", "thumbnailCaption","thumbnailRemove",],
			      	              ["\n","thumbnailAlignLeft", "thumbnailAlignRight", "thumbnailAlignNone"]
			      	              ]
			       },
			       {
			      	 label: "Spoiler",
			      	 showOn: { scope: 'Aloha.Block.SpoilerBlock' },
			      	 components: [
			      	              [ "spoilerTitle","spoilerRemove",],
			      	              ]
			       },
			       {
			      	 label: "Video",
			      	 showOn: { scope: 'Aloha.Block.VideoBlock' },
			      	 components: [
			      	              [ "videoSrc",],
			      	              ]
			       },
			       ]
		},
		bundles: {
			// Path for custom bundle relative from require.js path
			user: '../../js/aloha-plugins'
		}
};

```

About Aloha Editor
------------------
The [Aloha Editor](http://www.aloha-editor.org/) is a WYSIWYG that uses the
HTML5 content-editable attribute of the browswer for the best editing experience.
