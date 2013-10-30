"""Blockly Demo: Storage

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

"""Store and retrieve XML with App Engine.
"""

__author__ = "q.neutron@gmail.com (Quynh Neutron)"

import cgi
from random import randint
from google.appengine.ext import db
from google.appengine.api import memcache
import logging

print "Content-Type: text/plain\n"

def keyGen():
  # Generate a random string of length KEY_LEN.
  KEY_LEN = 6
  CHARS = "abcdefghijkmnopqrstuvwxyz23456789" # Exclude l, 0, 1.
  max_index = len(CHARS) - 1
  return "".join([CHARS[randint(0, max_index)] for x in range(KEY_LEN)])

class Xml(db.Model):
  # A row in the database.
  xml_hash = db.IntegerProperty()
  xml_content = db.TextProperty()

forms = cgi.FieldStorage()
if "xml" in forms:
  # Store XML and return a generated key.
  xml_content = forms["xml"].value
  xml_hash = hash(xml_content)
  lookup_query = db.Query(Xml)
  lookup_query.filter("xml_hash =", xml_hash)
  lookup_result = lookup_query.get()
  if lookup_result:
    xml_key = lookup_result.key().name()
  else:
    trials = 0
    result = True
    while result:
      trials += 1
      if trials == 100:
        raise Exception("Sorry, the generator failed to get a key for you.")
      xml_key = keyGen()
      result = db.get(db.Key.from_path("Xml", xml_key))
    xml = db.Text(xml_content, encoding="utf_8")
    row = Xml(key_name = xml_key, xml_hash = xml_hash, xml_content = xml)
    row.put()
  print xml_key

if "key" in forms:
  # Retrieve stored XML based on the provided key.
  key_provided = forms["key"].value
  # Normalize the string.
  key_provided = key_provided.lower().strip()
  # Check memcache for a quick match.
  xml = memcache.get("XML_" + key_provided)
  if xml is None:
    # Check datastore for a definitive match.
    result = db.get(db.Key.from_path("Xml", key_provided))
    if not result:
      xml = ""
    else:
      xml = result.xml_content
    # Save to memcache for next hit.
    if not memcache.add("XML_" + key_provided, xml, 3600):
      logging.error("Memcache set failed.")
  print xml.encode("utf-8")
