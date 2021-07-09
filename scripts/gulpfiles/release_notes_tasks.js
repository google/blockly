/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp scripts for creating release notes.
 */

 var fetch = require('node-fetch');
 
 const BASE_URL = 'https://api.github.com/graphql';
 
 async function listReleaseNotes() {
   const githubToken = process.argv[4];
   const headers = {
     'Content-Type': 'application/json',
     Authorization: 'bearer ' + githubToken,
   };
   const goalDate = await getGoalDate(headers);
 
 
   var note = `Please fill in the following template and post to the forums.
   
 ---

{Insert greeting},
 
 The {Insert Month and Year} release is out! In this release:
 
 {List major features in both core and samples}
 
 ## 🎉 Kudos 🎉
 
 ### Third Party Plugins
 {List third party plugins that have been released in the last quarter
  See [internal doc](https://docs.google.com/document/d/1rhhmKyivKHeLKT_2ZkI5hjc37mqyEBSUINr0hvouqxU/edit#heading=h.racwemyaxdb)}
 
 ### Core contributions
 {Reorganize into kudos}
 ${await getContributors('blockly', 'develop', goalDate, headers)}
 
 ### Samples contributions
 {Reorganize into kudos}
 ${await getContributors('blockly-samples', 'master', goalDate, headers)}
 
 Full release notes are below. As always, we welcome bug reports and pull requests!
 
 Cheers,
 {Insert Your Name}
 
 ${await getReleaseNotes(headers)}
 `;

   try {
     const response = await fetch(BASE_URL, {
       method: 'POST',
       headers: headers,
       body: await makeIssueMutation("Post release notes", note, headers),
     });
     const json = await response.json();
   } catch (error) {
     console.log(error);
   }
 
   //console.log(note);
 }
 
 async function getGoalDate(headers) {
   try {
     const response = await fetch(BASE_URL, {
       method: 'POST',
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
       const response = await fetch(BASE_URL, {
         method: 'POST',
         headers: headers,
         body: makePullRequestQuery(repo, baseRef, cursor),
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
         if (collaborators.has(pull.author.login)) continue;
 
         let contributions = contributors.get(pull.author.login);
         if (!contributions) {
           contributions = [];
           contributors.set(pull.author.login, contributions);
         }
         contributions.push(
             {title: pull.title, url: pull.url, number: pull.number})
       }
     } catch (error) {
       console.log(error);
     }
   } while (cursor);
 
   let notes = '';
   for (const [name, contributions] of contributors) {
     notes += `* ${name}\n`;
     for (const contribution of contributions) {
       notes += `    * ${formatPull(contribution)}\n`;
     }
   }
   return notes.replace(/"/g, '');
 }
 
 async function getCollaborators(repo, headers) {
   try {
     const response = await fetch(BASE_URL, {
       method: 'POST',
       headers: headers,
       body: makeCollaboratorQuery(repo),
     });
     const json = await response.json();
     const collaborators =
         json.data.repository.collaborators.nodes.map(node => node.login);
     collaborators.push('dependabot');
     return new Set(collaborators);
   } catch (error) {
     console.log(error);
   }
   return new Set();
 }
 
 async function getReleaseNotes(headers) {
   try {
     const response = await fetch(BASE_URL, {
       method: 'POST',
       headers: headers,
       body: makeLatestReleaseQuery(),
     });
     const json = await response.json();
     return json.data.repository.releases.nodes[0].descriptionHTML
        .replace(/"/g, '');
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
 
 function makePullRequestQuery(repo, baseRef, cursor) {
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
   // I doubt there are ever more than 100 collaborators.
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
               descriptionHTML
             }
           }
         }
       }
     `,
   })
 }

 async function makeIssueMutation(title, body, headers) {
   let repoId;
   try {
     const response = await fetch(BASE_URL, {
       method: 'POST',
       headers: headers,
       body: makeRepoQuery("blockly", "BeksOmega"),
     });
     const json = await response.json();
     repoId = json.data.repository.id;
   } catch (error) {
     console.log(error);
   }

   return JSON.stringify({
     query: `
       mutation {
        createIssue(input: {
            repositoryId: "${repoId}",
            title: "${title}",
            body: "${body}"
        }) {
          clientMutationId
        }
      }
     `,
   });
 }

 function makeRepoQuery(repo, owner) {
   return JSON.stringify({
     query: `
       query {
         repository(name: "${repo}", owner: "${owner}"){
           id
         }
       }
     `,
   })
 }
 
 function formatPull({title, url, number}) {
   return `(<a href=${url}>#${number}</a>) ${title.replace(/#/g, '')}`;
 }
 
 function extractMajorAndMinor(tag) {
   return tag.substring(0, tag.lastIndexOf('.'));
 }
 
 module.exports = {
   listReleaseNotes: listReleaseNotes,
 }
 