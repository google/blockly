"""Blockly Demo: Report

Copyright 2012 Google Inc.
http://blockly.googlecode.com/

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

"""Store reports about code written by users.
"""

__author__ = "ellen.spertus@gmail.com (Ellen Spertus)"

import cgi
import logging

from google.appengine.ext import db

print "Content-type: text/plain\n"

class Report(db.Model):
  identifier = db.FloatProperty()
  application = db.StringProperty()
  date = db.DateTimeProperty(auto_now_add=True)
  level = db.IntegerProperty()
  result = db.IntegerProperty()
  # StringProperty is limited to 500 characters, so use TextProperty.
  program = db.TextProperty()

# Catch errors extracting form fields or converting to numeric types.
# Let any other errors propagate up.
try:
  forms = cgi.FieldStorage()
  identifier = float(forms["id"].value)
  application = forms["app"].value
  level = int(forms["level"].value)
  result = int(forms["result"].value)
  program = forms["program"].value
  row = Report(identifier = identifier, application = application,
               level = level, result = result, program = program)
  row.put()
except ValueError, KeyError:
  logging.error("Unable to extract all form fields.")
