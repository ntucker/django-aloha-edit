from __future__ import unicode_literals

import posixpath
import os.path
import base64
from functools import wraps

from django.conf import settings
from django.http import HttpResponse
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils.decorators import available_attrs


def handle_image_posts(function=None):
    """
    Decorator for views that handles ajax image posts in base64 encoding, saving
    the image and returning the url
    """
    @wraps(function, assigned=available_attrs(function))
    def _wrapped_view(request, *args, **kwargs):
        if 'image' in request.META['CONTENT_TYPE']:
            name = default_storage.save(os.path.join('images', 'aloha-uploads', request.META['HTTP_X_FILE_NAME']),
                                        ContentFile(base64.b64decode(request.body.split(",", 1)[1])))
            return HttpResponse(posixpath.join(settings.MEDIA_URL, name), content_type="text/plain")
        else:
            return function(request, *args, **kwargs)
    return _wrapped_view
