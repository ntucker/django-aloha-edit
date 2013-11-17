from __future__ import unicode_literals

from django import forms
from django.utils.safestring import mark_safe
from django.forms.util import flatatt
from django.utils.encoding import force_unicode


class AlohaWidget(forms.Widget):
    def __init__(self, attrs=None):
        default_attrs = {}
        if attrs:
            default_attrs.update(attrs)
        super(AlohaWidget, self).__init__(default_attrs)

    def render(self, name, value, attrs=None):
        if value is None:
            value = ''
        final_attrs = self.build_attrs(attrs, name=name)
        return mark_safe('<div style="margin:0;padding:0;" class="aloha-edit span8" data-id="%s" id="aloha-%s">%s</div><input type="hidden"%s />'
                         % (final_attrs['id'], final_attrs['id'], force_unicode(value), flatatt(final_attrs)))

    class Media:
        css = {'all': ('aloha/css/aloha.css',)}
        js = ('js/aloha-settings.js',
              'aloha/lib/aloha.js',
              'js/init_aloha_form.js')
