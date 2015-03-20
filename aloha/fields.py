from __future__ import unicode_literals

import base64
from django.conf import settings
from django.contrib.sites.models import Site
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import models
from django.template.defaultfilters import slugify
from django.utils import six
from django.utils.encoding import force_text
from django.utils.safestring import mark_safe
import logging
import os.path
import posixpath
import re
import urlparse

import bleach
from lxml.html import tostring

import lxml.html as html

from .widgets import AlohaWidget


_RE_PROTOCOL = re.compile(r"(?P<protocol>[^:]+):(?P<mime>[^;]+);(?P<encoding>[^,]+),(?P<data>.*)")
logger = logging.getLogger(__name__)


class HTMLField(six.with_metaclass(models.SubfieldBase, models.TextField)):
    """This stores HTML content to be displayed raw to the user.
    The content is cleaned using bleach to restrict the set of HTML used.
    The Aloha Editor widget is used for form editing."""
    def __init__(self, tags=None, attributes=None, styles=None, classes=None, iframe_origins=None, *args, **kwargs):
        self.tags = tags
        self.attributes = attributes
        self.styles = styles
        self.classes = classes
        self.iframe_origins = iframe_origins
        if tags is None:
            self.tags = getattr(settings, 'ALLOWED_TAGS', [])
        if attributes is None:
            self.attributes = getattr(settings, 'ALLOWED_ATTRIBUTES', {})
        if styles is None:
            self.styles = getattr(settings, 'ALLOWED_STYLES', [])
        if classes is None:
            self.classes = getattr(settings, 'ALLOWED_CLASSES', [])
        self.classes = set(self.classes)
        if iframe_origins is None:
            self.iframe_origins = getattr(settings, 'IFRAME_ORIGINS', [])
        return super(HTMLField, self).__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super(HTMLField, self).deconstruct()
        for k in ['tags', 'attributes', 'styles', 'classes']:
            v = getattr(self, k)
            if not isinstance(v, list):
                v = list(v)
            if v != getattr(settings, 'ALLOWED_' + k.upper(), []):
                kwargs[k] = getattr(self, k)
        if self.iframe_origins != getattr(settings, 'IFRAME_ORIGINS', []):
            kwargs['iframe_origins'] = self.iframe_origins
        return name, path, args, kwargs

    def formfield(self, **kwargs):
        defaults = {'widget': AlohaWidget()}
        defaults.update(kwargs)
        return super(HTMLField, self).formfield(**defaults)

    def to_python(self, value):
        return mark_safe(value)

    def clean(self, value, model_instance):
        if not value:
            return super(HTMLField, self).clean(value, model_instance)
        frag = html.fromstring(value)
        instance_slug = slugify(force_text(getattr(model_instance, 'title', model_instance)))
        frag = self._process_images(frag, instance_slug)
        frag = self._restrict_iframe_host(frag)
        frag = self._process_links(frag)
        frag = self._verify_id_namespace(frag, instance_slug)
        frag = self._verify_link_namespace(frag, instance_slug)
        #frag = self._remove_aloha_br(frag)
        if self.classes:  # if you don't specify any, it is assumed allow-all
            frag = self._filter_classes(frag)
        if frag.tag == "div":
            value = "".join([frag.text or "", "".join([tostring(child, encoding=unicode) for child in frag.iterchildren()])])
        else:
            value = tostring(frag, encoding=unicode)
        value = bleach.clean(value, tags=self.tags, attributes=self.attributes, styles=self.styles, strip=True)
        return super(HTMLField, self).clean(value, model_instance)

    def _process_images(self, frag, extra_path):
        for i, img in enumerate(filter(lambda img: img.attrib.get('src') and img.attrib['src'].startswith("data:"), frag.cssselect('img'))):
            protocol_matcher = _RE_PROTOCOL.match(img.attrib['src'])
            if not protocol_matcher:
                logger.debug("Data protocol found, but was malformed, {0}".format(img.attrib['src']))
                continue
            base, extension = protocol_matcher.group("mime").split("/", 1)
            if base != "image":
                continue
            img_name = img.attrib.get('title', base) + str(i)
            name = default_storage.save(os.path.join('images', 'aloha-uploads', extra_path, ".".join((img_name, extension))),
                                        ContentFile(base64.b64decode(protocol_matcher.group("data"))))
            img.attrib['src'] = posixpath.join(settings.MEDIA_URL, name)
        return frag

    def _restrict_iframe_host(self, frag):
        for iframe in frag.cssselect('iframe'):
            if not ('src' in iframe.attrib and any((iframe.attrib.get('src').startswith(orig) for orig in self.iframe_origins))):
                if iframe == frag:
                    frag = html.fromstring("<p></p>")
                else:
                    iframe.getparent().remove(iframe)
        return frag

    def _process_links(self, frag):
        site = Site.objects.get_current()
        for a in frag.cssselect('a'):
            if 'href' in a.attrib and not a.attrib['href'].startswith("/") \
                    and not a.attrib['href'].startswith(".") \
                    and urlparse.urlparse(a.attrib['href']).netloc.split('.')[-2:] != site.domain.split('.')[-2:]:
                a.attrib['rel'] = "nofollow"
                a.attrib['target'] = "_blank"
        return frag

    def _verify_id_namespace(self, frag, extra_namespace):
        namespace = "-".join(('aloha', extra_namespace))+'-'
        for elem in frag.cssselect('[id]'):
            if not elem.attrib['id'].startswith(namespace):
                elem.attrib['id'] = namespace + elem.attrib['id']
        return frag

    def _verify_link_namespace(self, frag, extra_namespace):
        namespace = "-".join(('#aloha', extra_namespace))+'-'
        for a in frag.cssselect('a.accordion-toggle'):
            href = a.attrib.get('href')
            if href and href.startswith('#') and not href.startswith(namespace):
                a.attrib['href'] = namespace + href[1:]
        return frag

    def _filter_classes(self, frag):
        for elem in frag.cssselect('[class]'):
            classes = elem.attrib['class'].split()
            elem.attrib['class'] = " ".join((cls for cls in classes if cls in self.classes))
        return frag

    def _remove_aloha_br(self, frag):
        for elem in frag.cssselect('br[class~=aloha-end-br]'):
            if elem == frag:
                frag = html.fromstring("<p></p>")
            else:
                elem.getparent().remove(elem)
        return frag

try:
    from south.modelsinspector import add_introspection_rules
    rules = [
             (
              (HTMLField,),
              [],
              {
               "tags": ["tags", {"default": None}],
               "attributes": ["attributes", {"default": None}],
               "styles": ["styles", {"default": None}],
               "classes": ["classes", {"default": None}],
               "iframe_origins": ["iframe_origins", {"default": None}],
               },
              )
             ]
    add_introspection_rules(rules, ["^aloha\.fields\.HTMLField"])
except ImportError:
    pass
