/**
 * Notes:
 *   It only adds assignees. It does not remove assignees.
 *   Not able to test yet with how it works with auto adding a reviewer.
 *   Presumably it works the same as manually adding a reviewer, but you never know.
 */
const core = require('@actions/core');
const { context, getOctokit } = require('@actions/github');

try {
  if (context.payload.pull_request === undefined) {
    throw new Error("Can't get pull_request payload. Check a request reviewer event was triggered.");
  }

  const reviewers = context.payload.pull_request.requested_reviewers;
  // Assignees takes in a list of logins rather than the reviewer object.
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