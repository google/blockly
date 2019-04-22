# Blockly [![Build Status]( https://travis-ci.org/google/blockly.svg?branch=master)](https://travis-ci.org/google/blockly)


Google's Blockly is a web-based, visual programming editor.  Users can drag
blocks together to build programs.  All code is free and open source.

**The project page is https://developers.google.com/blockly/**

![](https://developers.google.com/blockly/images/sample.png)

Blockly has an active [developer forum](https://groups.google.com/forum/#!forum/blockly). Please drop by and say hello. Show us your prototypes early; collectively we have a lot of experience and can offer hints which will save you time. We actively monitor the forums and typically respond to questions within 2 working days.

Help us focus our development efforts by telling us [what you are doing with
Blockly](https://developers.google.com/blockly/registration). The questionnaire only takes
a few minutes and will help us better support the Blockly community.

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)

Want to contribute? Great! First, read [our guidelines for contributors](https://developers.google.com/blockly/guides/modify/contributing).

## Releases

We release by pushing the latest code to the master branch, followed by updating our [docs](developers.google.com/blockly) and [demo pages](https://blockly-demo.appspot.com). We typically release a new version of Blockly once a quarter (every 3 months). If there are breaking bugs, such as a crash when performing a standard action or a rendering issue that makes Blockly unusable, we will cherry-pick fixes to master between releases to fix them.

Releases are tagged by the release date (YYYYMMDD) with a leading '1.' and a trailing '.0' in case we ever need a major or minor version. For example, [1.20190419.0](https://github.com/google/blockly/tree/1.20190419.0)

### New APIs

Once a new API is merged into master it is considered beta until the following release. We generally try to avoid changing an API after it has been merged to master, but sometimes we need to make changes after seeing how an API is used. If an API has been around for at least two releases we'll do our best to avoid breaking it.

### Branches

There are two main branches for Blockly.

**[master](https://github.com/google/blockly)** - This is the (mostly) stable current release of Blockly.

**[develop](https://github.com/google/blockly/tree/develop)** - This is where most of our work happens. Pull requests should always be made against develop. This branch will generally be usable, but may be less stable than the master branch. Once something is in develop we expect it to merge to master in the next release.

**other branches:** - Larger changes may have their own branches until they are good enough for people to try out. These will be developed separately until we think they are almost ready for release. These branches typically get merged into develop immediately after a release to allow extra time for testing.

## Issues and Milestones

We typically triage all bugs within 2 working days, which includes adding any appropriate labels and assigning it to a milestone.

### Milestones

**Upcoming release** - The upcoming release milestone is for all bugs we plan on fixing before the next release. This typically has the form of year_quarter_release. For example, 2019_q2_release. Some bugs will be added to this release when they are triaged, others may be added closer to a release.

**Bug Bash Backlog** - These are bugs that we're still prioritizing. They haven't been added to a specific release yet, but we'll consider them for each release depending on relative priority and available time.

**Icebox** - These are bugs that we do not intend to spend time on. They are either too much work or minor enough that we don't expect them to ever take priority. We are still happy to accept pull requests for these bugs.
