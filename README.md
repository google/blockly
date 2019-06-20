# Blockly (fork)
This is a fork of the official repo by Google, so we can make updates to it and rebuild the executable scripts.

## Building
To build, run the build.py script that is in the main folder.

You will need a Python 2.7 environment. You can use the following command to create one:
`conda create -n blockly-build python=2.7`

## Building Constraints
You will need the closure folder to be present in a neighbor directory, as such:
```
index.html
blocks.js
...
vendor/blockly/
vender/closure-library/
```
Therefore, you should use the submodule that will be inside the [pc-standalone-app](https://github.com/ShapeRobotics/pc-standalone-app) repo.

## Updating the fork
Make a pull request on the GitHub website. Select the remote master branch (in this case, this means Google's master branch). This will update the origin master branch and put all of the missing commits inside the history, and put our commits on top.

It can turn out to be a mess, so keeping branches of all changes is necessary.

Alternatively, use this:
https://stackoverflow.com/questions/7244321/how-do-i-update-a-github-forked-repository