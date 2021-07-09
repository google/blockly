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
const { setEmitFlags } = require('typescript');

const baseUrl = "https://api.github.com/graphql";

async function generateReleaseNotes(done) {
  const githubToken = process.argv[4];
  const headers = {
    "Content-Type": "application/json",
    Authorization: "bearer " + githubToken,
  };
  const goalDate = await getGoalDate(headers);


  var note = `{Insert greeting},

The {Insert Month and Year} release is out! In this release:

{List major features in both core and samples}

🎉 **Kudos** 🎉

**Third Party Plugins**
{List third party plugins that have been released in the last quarter
 See internal: docs.google.com/document/d/1rhhmKyivKHeLKT_2ZkI5hjc37mqyEBSUINr0hvouqxU/edit#heading=h.racwemyaxdb}

**Core contributions**
{Reorganize into kudos}
${await getContributors('blockly', 'develop', goalDate, headers)}

**Samples contributions**
{Reorganize into kudos}
${await getContributors('blockly-samples', 'master', goalDate, headers)}

Full release notes are below. As always, we welcome bug reports and pull requests!

Cheers,
{Insert Your Name}

${await getReleaseNotes(headers)}
`;

  console.log(note);

  done();
}

async function getGoalDate(headers) {
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: headers,
      body: makeReleasesQuery(),
    });
    const json = await response.json();
    const releases = json.data.repository.releases.nodes;
    let latestTag = extractMajorAndMinor(releases[0].tagName);
    for (let release of releases) {
      if (extractMajorAndMinor(release.tagName) != latestTag) {          
        return Date.parse(release.createdAt);
      }
    }
  } catch (error) {
    console.log(error);
  }
  return Number.MAX_VALUE;
}

async function getContributors(repo, baseRef, goalDate, headers) {
  const collaborators = await getCollaborators(repo, headers);

  let cursor = '';
  const contributors = new Map();
  do {
    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: headers,
        body: makeContributorQuery(repo, baseRef, cursor),
      });
      const json = await response.json();
      const pullRequestData = json.data.repository.pullRequests;
      const pulls = pullRequestData.nodes;
      cursor = pullRequestData.pageInfo.endCursor;
    
      for (let i = 0; i < pulls.length; i++) {
        const pull = pulls[i];
        const createdDate = Date.parse(pull.createdAt);
        if (createdDate < goalDate) {
          cursor = '';
          break;
        }

        if (collaborators.has(pull.author.login)) {
          continue;
        }
        let contributions = contributors.get(pull.author.login);
        if (!contributions) {
          contributions = [];
          contributors.set(pull.author.login, contributions);
        }
        contributions.push({
          title: pull.title,
          url: pull.url,
          number: pull.number
        })
      }

    } catch (error) {
        console.log(error);
    }
  } while (cursor);

  let notes = '';
  for (let [name, contributions] of contributors) {
    notes += `* ${name}\n`;
    for (let contribution of contributions) {
      notes += `  * ${formatPull(contribution)}\n`;
    }
  }
  return notes;
}

async function getCollaborators(repo, headers) {
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: headers,
      body: makeCollaboratorQuery(repo),
    });
    const json = await response.json();
    const collaborators =  json.data.repository.collaborators.nodes
        .map((node) => node.login);
    collaborators.push('dependabot');
    return new Set(collaborators);
  } catch (error) {
    console.log(error);
  }
  return new Set();
}

async function getReleaseNotes(headers) {
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: headers,
      body: makeLatestReleaseQuery(),
    });
    const json = await response.json();
    return json.data.repository.releases.nodes[0].description;
  } catch (error) {
    console.log(error);
  }
  return '';
}

function makeReleasesQuery() {
  // Hopefully we never have more than 20 patch releases.
  return JSON.stringify({
    query: `
      query {
        repository(name: "blockly", owner: "google"){
          releases(first: 20, orderBy: {direction: DESC, field: CREATED_AT}){
            nodes{
              createdAt
              tagName
            }
          }
        }
      }
    `,
  })
}

function makeContributorQuery(repo, baseRef, cursor) {
  return JSON.stringify({
    query: `
      query {
        repository(name: "${repo}", owner: "google"){
          pullRequests(first: 100, baseRefName: "${baseRef}",
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
              number
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
        repository(name: "${repo}", owner: "google"){
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

function makeLatestReleaseQuery() {
  return JSON.stringify({
    query: `
      query {
        repository(name: "blockly", owner: "google"){
          releases(first: 1, orderBy: {direction: DESC, field: CREATED_AT}){
            nodes{
              description
            }
          }
        }
      }
    `,
  })
}

function formatPull({title, url, number}) {
  return `([#${number}](${url})) ${title}`;
}

function extractMajorAndMinor(tag) {
  return tag.substring(0, tag.lastIndexOf('.'));
}

const contributors = gulp.series(generateReleaseNotes);

module.exports = {
  contributors: contributors,
}
