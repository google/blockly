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

async function getContributors(done) {
  githubToken = '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';

  function makeQuery(cursor) {
    return {
      query: `
        query {
          repository(name: "blockly", owner: "google"){
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
    };
  } 

  const baseUrl = "https://api.github.com/graphql";

  const headers = {
    "Content-Type": "application/json",
    Authorization: "bearer " + githubToken,
  };

  const goalDate = Date.parse('2021-03-01');
  let cursor = '';
  let reachedEnd = false;
  while(!reachedEnd) {
      console.log('running');
    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(makeQuery(cursor)),
      });
      const json = await response.json()
      if (!json.data) {
          console.log(json);
          break;
      }
      const pullRequestData = json.data.repository.pullRequests;
      const pulls = pullRequestData.nodes;
      cursor = pullRequestData.pageInfo.endCursor;
  
      for (let i = 0; i < pulls.length; i++) {
        const createdDate = Date.parse(pulls[i].createdAt);
        if (createdDate < goalDate) {
          reachedEnd = true;
          break;
        }
      }
    } catch (error) {
        console.log(error);
    }
  }
  done();
}

const contributors = gulp.series(getContributors);

module.exports = {
  contributors: contributors,
}
