/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp scripts for creating release notes.
 */

var gulp = require('gulp');
var fetch = require('node-fetch');

const baseUrl = "https://api.github.com/graphql";

async function generateReleaseNotes(done) {
  const goalDate = Date.parse('2021-03-01');
  const githubToken = process.argv[4];
  const headers = {
    "Content-Type": "application/json",
    Authorization: "bearer " + githubToken,
  };


  var note = `{Insert greeting},

The {Insert Month and Year} release is out! In this release:

{List major features in both core and samples}

🎉 **Kudos** 🎉
{Thank forums contributors and issue filers}

**Third Party Plugins**
{List third party plugins that have been released in the last quarter}

**Core contributions**
{Reorganize into thank-yous}
${await getContributors('blockly', goalDate, headers)}

**Samples contributions**
{Reorganize into thank-yous}
${await getContributors('blockly-samples', goalDate, headers)}

🔨 **Breaking Changes in core** 🔨 
${await getBreakingChanges(headers)}

Full release notes are below. As always, we welcome bug reports and pull requests!

Cheers,
{Your Name}

**Issues Closed**:
${await getClosedIssues(headers)}

**Pull Requests**:
${await getMergedPrs(headers)}`;

  console.log(note);

  done();
}

async function getContributors(repo, goalDate, headers) {
  const collaborators = await getCollaborators(repo, headers);

  let cursor = '';
  do {
    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: headers,
        body: makeContributorQuery(repo, cursor),
      });
      const json = await response.json();

      const pulls = pullRequestData.nodes;
      cursor = pullRequestData.pageInfo.endCursor;
    
      for (let i = 0; i < pulls.length; i++) {
        const createdDate = Date.parse(pulls[i].createdAt);
        if (createdDate < goalDate) {
          cursor = '';
          break;
        }
      }

    } catch (error) {
        console.log(error);
        break;
    }
  } while (cursor);
}

async function getCollaborators(repo, headers) {
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: headers,
      body: makeCollaboratorQuery(repo),
    });
    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.log(error);
    break;
  }
  return '';
}

async function getBreakingChanges(headers) {
  return '';
}

async function getClosedIssues(headers) {
  return '';
}

async function getMergedPrs(headers) {
  return '';
}

function makeContributorQuery(repo, cursor) {
  return JSON.stringify({
    query: `
      query {
        repository(name: "${repo}", owner: "google"){
          pullRequests(first: 100, baseRefName: "develop",
              ${cursor ? `after: "${cursor}"` : ''}
              orderBy: {direction: DESC, field: CREATED_AT},
              states: [OPEN, MERGED]) {
            nodes{
              author{
                login
              }
              createdAt
              title
              url
            }
            pageInfo{
              endCursor
            }
          }
        }
      }
    `,
  });
} 

function makeCollaboratorQuery(repo) {
  return JSON.stringify({
    query: `
      query {
        repository(name: "blockly", owner: "google"){
        collaborators(first:100){
            nodes{
              login
            }
          }
        }
      }
    `,
  });
}

function processContributors(goalDate, pullRequestData) {
}

const contributors = gulp.series(generateReleaseNotes);

module.exports = {
  contributors: contributors,
}
