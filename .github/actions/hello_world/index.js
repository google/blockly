const core = require('@actions/core');
const { context, getOctokit } = require('@actions/github');

try {
  if (context.payload.pull_request === undefined) {
    throw new Error("Can't get pull_request payload. Check a request reviewer event was triggered.");
  }

  const reviewers = context.payload.pull_request.requested_reviewers;
  const reviewerNames = reviewers.map(reviewer => reviewer.login);

  const {number:issue_number} = context.payload.pull_request;
  const token = core.getInput("repo-token", { required: true });

  const octokit = getOctokit(token);

  const result = octokit.rest.issues.addAssignees({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issue_number,
    assignees: reviewerNames
  });
} catch (error) {
  core.setFailed(error.message);
}