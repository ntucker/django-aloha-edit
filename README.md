django-aloha-edit
=================

Provides easy integration of the Aloha Editor into your Django app

Installing
----------
    pip install -e "git+https://github.com/ntucker/django-aloha-edit#egg=aloha"

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

About Aloha Editor
------
The [Aloha Editor](http://www.aloha-editor.org/) is a WYSIWYG that uses the
HTML5 content-editable attribute of the browswer for the best editing experience.
