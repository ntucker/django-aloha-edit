from distutils.core import setup

setup(name='aloha',
      version='0.1.0',
      description='Django Aloha Edit',
      author='Nathaniel Tucker',
      author_email='me@ntucker.me',
      url='https://github.com/ntucker/django-aloha-edit',
      packages=['aloha'],
      install_requires = ['django>=1.4', 'bleach>=1.2.1', 'lxml',],
     )
