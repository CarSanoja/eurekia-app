#!/bin/bash
# This script initializes a Django project inside Docker

django-admin startproject quanta .
python manage.py startapp core
python manage.py startapp accounts
python manage.py startapp habits
python manage.py startapp reports
python manage.py startapp messaging
python manage.py startapp admin_studio