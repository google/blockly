const core = require('@actions/core');
const github = require('@actions/github');

try {

  console.log(`Reviewer: ${github.context.payload.pull_request.requested_reviewers}`)
  const token = core.getInput("repo-token", { required: true });
  console.log(`Token: ${token}`);

  const octokit = github.getOctokit(token);
  console.log(octokit);
  // const result = await octokit.rest.issues.addAssignees({
  //   owner: github.context.repo.owner,
  //   repo: github.context.repo.repo,
  //   issue_number: number,
  //   assignees: [author]
  // });

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);

  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}