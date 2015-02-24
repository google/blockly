PYTHON = python

FILES = $(shell find . -name '*.js' -or -name '*.mp3' -or -name '*.html' -or -name '*.jpeg' -or -name '*.gif' -or -name '*.cur' -or -name '*.png' -or -name '*.wav' | grep -v .*compressed.js | grep -v en\.js)

blockly_compressed.js: $(FILES)
	$(PYTHON) build.py

clean:
	rm -rf *compressed.js

