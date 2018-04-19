"""Blockly Demo: Storage

Copyright 2012 Google Inc.
https://developers.google.com/blockly/

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
from google.appengine.api import memcache
from google.appengine.ext import ndb


def keyGen():
  # Generate a random string of length KEY_LEN.
  KEY_LEN = 6
  CHARS = "abcdefghijkmnopqrstuvwxyz23456789"  # Exclude l, 0, 1.
  max_index = len(CHARS) - 1
  return "".join([CHARS[randint(0, max_index)] for x in range(KEY_LEN)])

class Xml(ndb.Model):
  # A row in the database.
  xml_hash = ndb.IntegerProperty()
  xml_content = ndb.TextProperty()

def xmlToKey(xml_content):
  # Store XML and return a generated key.
  xml_hash = long(hashlib.sha1(xml_content).hexdigest(), 16)
  xml_hash = int(xml_hash % (2 ** 64) - (2 ** 63))
  lookup_query = Xml.query(Xml.xml_hash == xml_hash)
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
  # Check memcache for a quick match.
  xml = memcache.get("XML_" + key_provided)
  if xml is None:
    # Check datastore for a definitive match.
    result = Xml.get_by_id(key_provided)
    if not result:
      xml = ""
    else:
      xml = result.xml_content
    # Save to memcache for next hit.
    memcache.add("XML_" + key_provided, xml, 3600)
  return xml.encode("utf-8")

if __name__ == "__main__":
  print("Content-Type: text/plain\n")
  forms = cgi.FieldStorage()
  if "xml" in forms:
    print(xmlToKey(forms["xml"].value))
  if "key" in forms:
    print(keyToXml(forms["key"].value))
