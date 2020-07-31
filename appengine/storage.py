"""Blockly Demo: Storage

Copyright 2012 Google LLC

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
import hashlib
from random import randint
from google.cloud import ndb


class Xml(ndb.Model):
  # A row in the database.
  xml_hash = ndb.IntegerProperty()
  xml_content = ndb.TextProperty()
  last_accessed = ndb.DateTimeProperty(auto_now=True)

def keyGen():
  # Generate a random string of length KEY_LEN.
  KEY_LEN = 6
  CHARS = "abcdefghijkmnopqrstuvwxyz23456789"  # Exclude l, 0, 1.
  max_index = len(CHARS) - 1
  return "".join([CHARS[randint(0, max_index)] for x in range(KEY_LEN)])


def xmlToKey(xml_content):
  # Store XML and return a generated key.
  xml_hash = int(hashlib.sha1(xml_content.encode("utf-8")).hexdigest(), 16)
  xml_hash = int(xml_hash % (2 ** 64) - (2 ** 63))
  lookup_query = Xml.query(Xml.xml_hash == xml_hash)
  client = ndb.Client()
  with client.context():
    lookup_result = lookup_query.get()
    if lookup_result:
      xml_key = lookup_result.key.string_id()
    else:
      trials = 0
      result = True
      while result:
        trials += 1
        if trials == 100:
          raise Exception("Sorry, the generator failed to get a key for you.")
        xml_key = keyGen()
        result = Xml.get_by_id(xml_key)
      row = Xml(id = xml_key, xml_hash = xml_hash, xml_content = xml_content)
      row.put()
  return xml_key


def keyToXml(key_provided):
  # Retrieve stored XML based on the provided key.
  # Normalize the string.
  key_provided = key_provided.lower().strip()
  # Check datastore for a match.
  client = ndb.Client()
  with client.context():
    result = Xml.get_by_id(key_provided)
  if not result:
    xml = ""
  else:
    # Put it back into the datastore immediately, which updates the last
    # accessed time.
    with client.context():
      result.put()
    xml = result.xml_content
  return xml


def app(environ, start_response):
  forms = cgi.FieldStorage(fp=environ['wsgi.input'], environ=environ)
  if "xml" in forms:
    out = xmlToKey(forms["xml"].value)
  elif "key" in forms:
    out = keyToXml(forms["key"].value)
  else:
    out = ""

  headers = [
    ("Content-Type", "text/plain")
  ]
  start_response("200 OK", headers)
  return [out.encode("utf-8")]
