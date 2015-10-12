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
from django.shortcuts import get_object_or_404
import logging
import os.path
import posixpath
import re
import urlparse
from io import BytesIO

import bleach
from lxml.html import tostring
import lxml.html as html
from tinycss.css21 import CSS21Parser
from PIL import Image

from .widgets import AlohaWidget


_RE_PROTOCOL = re.compile(r"(?P<protocol>[^:]+):(?P<mime>[^;]+);(?P<encoding>[^,]+),(?P<data>.*)")
logger = logging.getLogger(__name__)


class HTMLSanitizerMixin(object):
    KWARG = ['tags', 'attributes', 'styles', 'classes', 'iframe_origins', 'source_field']
    def __init__(self, *args, **kwargs):
        for k in self.KWARG:
            setattr(self, k, kwargs.pop(k, None))
        if self.tags is None:
            self.tags = getattr(settings, 'ALLOWED_TAGS', [])
        if self.attributes is None:
            self.attributes = getattr(settings, 'ALLOWED_ATTRIBUTES', {})
        if self.styles is None:
            self.styles = getattr(settings, 'ALLOWED_STYLES', [])
        if self.classes is None:
            self.classes = getattr(settings, 'ALLOWED_CLASSES', [])
        self.classes = set(self.classes)
        if self.iframe_origins is None:
            self.iframe_origins = getattr(settings, 'IFRAME_ORIGINS', [])
        super(HTMLSanitizerMixin, self).__init__(*args, **kwargs)

    def sanitize(self, value, instance_slug):
        frag = html.fromstring(bleach.clean(value, tags=self.tags, attributes=self.attributes, styles=self.styles, strip=True))
        frag = self._trim_paragraphs(frag)
        frag = self._process_images(frag, instance_slug)
        frag = self._process_schema(frag)
        frag = self._restrict_iframe_host(frag)
        frag = self._process_links(frag)
        frag = self._verify_id_namespace(frag, instance_slug)
        frag = self._verify_link_namespace(frag, instance_slug)
        if self.classes:  # if you don't specify any, it is assumed allow-all
            frag = self._filter_classes(frag)
        if frag.tag == "div" or frag.tag == "body":
            value = "".join([frag.text or "", "".join([tostring(child, encoding=unicode) for child in frag.iterchildren()])])
        else:
            value = tostring(frag, encoding=unicode)
        return value

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

            imgdata = base64.b64decode(protocol_matcher.group("data"))
            if 'style' in img.attrib and 'width' in img.attrib['style'] and 'height' in img.attrib['style']:
                style = CSS21Parser().parse_style_attr(img.attrib['style'])[0]
                style = {dec.name: dec.value[0].value for dec in style if dec.name in ['width', 'height']}
                imgproc = Image.open(BytesIO(imgdata))
                if imgproc.mode == "P":
                    if len(imgproc.palette.getdata()[1]) > 256:
                        imgproc = imgproc.convert("RGB")
                imgproc = imgproc.resize((style['width'], style['height']), Image.LANCZOS)
                params = {}
                format = extension
                if format=="jpg" and imgproc.mode not in ["RGB", "L", "CMYK"]:
                    format = "png"
                imgbuffer = BytesIO()
                imgproc.save(imgbuffer, format=format, **params)
                imgdata = imgbuffer.getvalue()
            name = default_storage.save(os.path.join('images', 'aloha-uploads', extra_path, ".".join((img_name, extension))),
                                        ContentFile(imgdata))
            img.attrib['src'] = posixpath.join(settings.MEDIA_URL, name)
        return frag

    def _process_schema(self, frag):
        for img in frag.cssselect('img'):
            img.attrib['itemprop'] = 'image'
        return frag

    def _trim_paragraphs(self, frag):
        for p in frag.cssselect('p'):
            if not list(p) and (not p.text or not p.text.strip()) and not next(p.itersiblings(), None) and not next(p.itersiblings(preceding=True), None):
                p.getparent().remove(p)
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


class HTMLField(HTMLSanitizerMixin, models.TextField):
    """This stores HTML content to be displayed raw to the user.
    The content is cleaned using bleach to restrict the set of HTML used.
    The Aloha Editor widget is used for form editing."""
    def deconstruct(self):
        name, path, args, kwargs = super(HTMLField, self).deconstruct()
        for k in ['tags', 'attributes', 'styles', 'classes']:
            v, s = getattr(self, k), getattr(settings, 'ALLOWED_' + k.upper(), [])
            if isinstance(v, list):
                v = set(v)
            if isinstance(s, list):
                s = set(s)
            if v != s:
                kwargs[k] = getattr(self, k)
        if self.iframe_origins != getattr(settings, 'IFRAME_ORIGINS', []):
            kwargs['iframe_origins'] = self.iframe_origins
        if self.source_field:
            kwargs['source_field'] = self.source_field
        return name, path, args, kwargs

    def formfield(self, **kwargs):
        defaults = {'widget': AlohaWidget()}
        defaults.update(kwargs)
        return super(HTMLField, self).formfield(**defaults)

    def from_db_value(self, value, expression, connection, context):
        return mark_safe(value)

    def to_python(self, value):
        return mark_safe(value)

    def clean(self, value, model_instance):
        if not value:
            return super(HTMLField, self).clean(value, model_instance)

        if self.source_field:
            source_instance = getattr(model_instance, self.source_field)
        else:
            source_instance = model_instance
        instance_slug = slugify(force_text(getattr(source_instance, 'title', model_instance)))
        value = self.sanitize(value, instance_slug)

        return super(HTMLField, self).clean(value, model_instance)


try:
    from rest_framework import serializers
    class HTMLSerializerField(HTMLSanitizerMixin, serializers.CharField):
        def to_internal_value(self, data):
            data = super(HTMLSerializerField, self).to_internal_value(data)
            if not data:
                return data

            if self.source_field:
                if self.parent.instance:
                    source_article = getattr(self.parent.instance, self.source_field)
                else:
                    source_article = self.parent.fields[self.source_field].to_internal_value(self.parent.initial_data[self.source_field])
                instance_slug = slugify(force_text(source_article.title))
            elif 'title' in self.parent.initial_data:
                instance_slug = slugify(force_text(self.parent.initial_data['title']))
            else:
                logger.error('Using HTMLField with no title is not currently supported')
                #instance_slug = TODO: base on ID?
            data = self.sanitize(data, instance_slug)

            return data

        def to_representation(self, value):
            if isinstance(value, six.binary_type):
                value = value.decode("utf-8") #TODO: py3: remove decode as python should work with unicode properly
            return super(HTMLSerializerField, self).to_representation(value)
except ImportError:
    pass

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
