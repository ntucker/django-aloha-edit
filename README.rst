django-aloha-edit
=================

.. image:: https://pypip.in/d/django-aloha-edit/badge.png
    :target: http://badge.fury.io/py/django-aloha-edit

Provides easy integration of the Aloha Editor into your Django app as well as several additional Aloha plugins.

Installing
----------

.. code-block:: bash

    pip install django-aloha-edit

Usage
-----

HTMLField
~~~~~~~~~

Using the Model Field

.. code-block:: python

    from aloha.fields import HTMLField

    class MyModel(models.Model):
        content = HTMLField()

This will allow you to sanitize the output while automatically using the Aloha Widget

These settings will allow customization of the sanitizer

.. code-block:: python

    ALLOWED_TAGS = ['a', 'abbr', ]
    ALLOWED_ATTRIBUTES = {'a': ['href', 'rel', 'target', 'title',], }
    ALLOWED_STYLES = ['float','text-align','width','height',]
    ALLOWED_CLASSES = ['error', 'success', 'warning', 'info',
                       ]
    IFRAME_ORIGINS = ["http://www.youtube.com/embed/", "http://blip.tv/play/"]

Widget
~~~~~~

.. code-block:: python

    from aloha.widgets import AlohaWidget

    class MyForm(forms.Form):
        content = forms.CharField(widget=AlohaWidget)

Be sure to include the form media in your template somewhere and the end of the head area

.. code-block:: html

   <head>
   {{ form.media }}
   </head>

Note: Specifying the widget is not necessary if you are using the HTMLField

Additional Media Dependencies
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Aloha uses jQuery and require.js. Both should be loaded before the form media in any template you use the widget.
You must use the provided Aloha fork of jQuery or it will not work. Unfortunately they don't provide later versions.

.. code-block:: html

    <script src="{{STATIC_URL}}aloha/lib/vendor/jquery-1.7.2.js"></script>
    <script src="{{STATIC_URL}}aloha/lib/require.js"></script>
    <script>
    // this makes require.js and jquery work together
    if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
        define( "jquery", [], function () { return jQuery; } );
    }
    </script>

Django settings file
~~~~~~~~~~~~~~~~~~~~

Make sure to add 'aloha' to the list of installed apps. This will allow django to find the static files when it runs
collectstatic.

.. code-block:: python

    INSTALLED_APPS = (
        'aloha',
    )

Extra Plugins
-------------

Video Embed
~~~~~~~~~~~

This plugin provides video embedding capabilities. It currently supports both blip and youtube, but other services can easily be added.
This plugin provides both a content handler (so you can copy/paste links) as well as UI elements in the Aloha bar to manipulate and add
video embeds.

For youtube videos, the embed include a special div that will reduce load on usage. You must include /static/js/youtube.js on both the
edit page as well as the page that shows the content. This provides a jQuery function to activate the click functionality so the
actual video will load when a user clicks it. Make sure to call this on page load of any page you are presenting your HTML content.

e.g.) ``$(function() {$(body).activateYoutube();});``

Bootstrap UI
~~~~~~~~~~~~

This plugin provides manipulation of several [bootstrap](http://twitter.github.io/bootstrap/) elements including collapse (called spoiler here)
and thumbnails. Make sure you include the appropriate css and javascript for those parts of bootstrap or they will not work.

Usage
~~~~~

Make sure to load the plugins in either the aloha config file or the script load specification. Use 'user/videoembed', 'user/bootstrapui'

You must also add the UI elements to the UI configuration. Below is a sample config:

.. code-block:: javascript

   Aloha = window.Aloha || {};
   Aloha.settings = {
   	sidebar : {
   		disabled : true
   	},
   	plugins : {
   		load : [ 'common/ui', 'common/commands', 'common/format', 'common/list',
   				'common/align', 'common/table', 'common/image', 'common/undo',
   				'common/abbr', 'common/link', 'common/contenthandler',
   				'common/paste', 'common/block', 'common/characterpicker',
   				'user/videoembed', 'user/bootstrapui' ],
   	},
   	contentHandler : {
   		insertHtml : [ 'word', 'blockelement', 'generic', 'sanitize',
   				'videoembed', ],
   		initEditable : [ 'sanitize' ],
   		getContents : [ 'blockelement', 'basic', 'removebr', 'videoembed',
   				'spoiler', 'sanitize', ],
   		sanitize : 'relaxed', // relaxed, restricted, basic,
   		allows : {
   			elements : [ 'a', 'abbr', 'acronym', 'b', 'blockquote', 'br', 'cite',
   					'code', 'dd', 'del', 'div', 'dl', 'dt', 'em', 'h2', 'h3', 'h4',
   					'h5', 'i', 'iframe', 'img', 'ins', 'li', 'ol', 'p', 'pre', 'q',
   					'small', 'strong', 'sub', 'sup', 'table', 'td', 'th', 'tr', 'u',
   					'ul' ],
   
   			attributes : {
   				'a' : [ 'href', 'rel', 'target', 'title', 'data-toggle', 'class' ],
   				'blockquote' : [ 'cite' ],
   				'q' : [ 'cite' ],
   				'img' : [ 'src', 'alt', 'title', 'style' ],
   				'iframe' : [ 'src', 'width', 'height', 'frameborder',
   						'allowfullscreen' ],
   				'div' : [ 'class', 'id', 'style', 'data-id', 'data-params' ],
   				'span' : [ 'class' ],
   				'p' : [ 'style' ],
   				'table' : [ 'class' ],
   				'td' : [ 'colspan' ],
   				'th' : [ 'colspan' ],
   				'ul' : [ 'class' ],
   				'li' : [ 'class' ],
   				'i' : [ 'class' ],
   				'span' : [ 'class' ],
   			},
   
   			protocols : {
   				'a' : {
   					'href' : [ 'ftp', 'http', 'https', 'mailto', '__relative__' ]
   				}, // Sanitize.RELATIVE
   				'blockquote' : {
   					'cite' : [ 'http', 'https', '__relative__' ]
   				},
   				'q' : {
   					'cite' : [ 'http', 'https', '__relative__' ]
   				},
   				'img' : {
   					'src' : [ 'http', 'https', 'data', '__relative__' ]
   				},
   				'iframe' : {
   					'src' : [ 'http', 'https', '__relative__' ]
   				}
   			}
   		}
   	},
   	toolbar : {
   		tabs : [
   				{
   					label : 'tab.format.label',
   					showOn : {
   						scope : 'Aloha.continuoustext'
   					},
   					components : [
   							[ 'bold', 'strong', 'italic', 'emphasis', '\n',
   									'subscript', 'superscript', 'strikethrough',
   									'quote', ],
   							[ 'formatLink', 'formatAbbr', 'formatNumeratedHeaders',
   									'toggleDragDrop', '\n', 'formatSpoilers',
   									'formatThumbnail', 'addVideo', '\n',
   									'toggleMetaView', 'wailang',
   									'toggleFormatlessPaste', ],
   							[ 'alignLeft', 'alignCenter', 'alignRight',
   									'alignJustify', '\n', 'orderedList',
   									'unorderedList', 'indentList', 'outdentList' ],
   							[ 'formatBlock' ] ]
   				},
   				{
   					label : "tab.insert.label",
   					showOn : {
   						scope : 'Aloha.continuoustext'
   					},
   					components : [ [ "createTable", "characterPicker", "insertLink",
   							"insertImage", "insertAbbr", "insertToc",
   							"insertHorizontalRule", "insertTag", 'insertSpoilers',
   							'insertVideo', 'insertThumbnail', ] ]
   				},
   				{
   					label : "tab.img.label",
   					showOn : {
   						scope : 'image'
   					},
   					components : [
   							[ "imageSource", "\n", "imageTitle" ],
   							[ "imageResizeWidth", "\n", "imageResizeHeight" ],
   							[ "imageAlignLeft", "imageAlignRight", "imageAlignNone",
   									"\n", "imageCropButton", "imageCnrReset",
   									"imageCnrRatio", ], [ "imageBrowser" ],
   							[ "wrapThumbnail", ] ]
   				},
   				{
   					label : "Thumbnail",
   					showOn : {
   						scope : 'Aloha.Block.ThumbnailBlock'
   					},
   					components : [
   							[ "thumbnailSrc", "thumbnailCaption", "thumbnailRemove", ],
   							[ "\n", "thumbnailAlignLeft", "thumbnailAlignRight",
   									"thumbnailAlignNone" ] ]
   				}, {
   					label : "Spoiler",
   					showOn : {
   						scope : 'Aloha.Block.SpoilerBlock'
   					},
   					components : [ [ "spoilerTitle", "spoilerRemove", ], ]
   				}, {
   					label : "Video",
   					showOn : {
   						scope : 'Aloha.Block.VideoBlock'
   					},
   					components : [ [ "videoSrc", ], ]
   				}, {
   					label : "YouTube",
   					showOn : {
   						scope : 'Aloha.Block.YoutubeBlock'
   					},
   					components : [ [ "videoId", "videoParams", "videoRemove" ], ]
   				}, ]
   	},
   	bundles : {
   		// Path for custom bundle relative from require.js path
   		user : '../../js/aloha-plugins'
   	}
   };

Using Font Awesome Icons for the added plugins
----------------------------------------------

Make sure to include the following CSS to make the icons display properly.

.. code-block:: css

   .@{fa-css-prefix} {
     font-family: FontAwesome !important;
   }
   
   .aloha .ui-icon {
     &.@{fa-css-prefix} {
       text-indent:0;
       background-image: none !important;
     } 
   }

Python 3 compatibility
----------------------

Python 3 is supported using six. However, you must use the py3k fork of bleach as it is a dependency and bleach is not
py3k compat by default.

About Aloha Editor
------------------
The [Aloha Editor](http://www.aloha-editor.org/) is a WYSIWYG that uses the
HTML5 content-editable attribute of the browswer for the best editing experience.
