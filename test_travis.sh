#! /usr/bin/env bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-H "Travis-API-Version: 3" \
-H "Authorization: token zKh47Z86eEmAz-LyXlUIKw" \
-d '{ "quiet": true }' \
https://api.travis-ci.org/job/564198801/debug
