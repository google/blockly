#!/usr/bin/env python
import SimpleHTTPServer
import SocketServer
import cgi
import sys

PORT = 8080

# Simple server to respond to both POST and GET requests. POST requests will
# just respond as normal GETs.
class ServerHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):

    def do_GET(self):
        SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

Handler = ServerHandler

# Allows use to restart server immediately after restarting it.
SocketServer.ThreadingTCPServer.allow_reuse_address = True

httpd = SocketServer.TCPServer(("", PORT), Handler)

print ("Serving at: http://%s:%s" % ("localhost", PORT))
httpd.serve_forever()
