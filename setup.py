from setuptools import setup, find_packages
import os.path

def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(name='django-aloha-edit',
      version='0.3.1',
      description='Django Aloha Edit',
      author='Nathaniel Tucker',
      author_email='me@ntucker.me',
      url='https://github.com/ntucker/django-aloha-edit',
      packages=find_packages(),
      include_package_data=True,
      install_requires=['django>=1.4', 'bleach>=1.2.1', 'lxml', ],
      long_description=read('README.md'),
      license="BSD",
      classifiers=[
          'Development Status :: 4 - Beta',
          'Environment :: Web Environment',
          'Framework :: Django',
          'Intended Audience :: Developers',
          'License :: OSI Approved :: BSD License',
          'Operating System :: OS Independent',
          'Programming Language :: Python',
      ],
      )
