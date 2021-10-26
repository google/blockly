/**
 * This script adds requested reviewers as assignees. If you remove a requested
 * reviewer, it will not remove them as an assignee.
 *
 * See https://github.com/google/blockly/issues/5643 for more information on
 * why this was added.
 */
module.exports = ({github, context, core}) => {
  try {
    if (context.payload.pull_request === undefined) {
      throw new Error("Can't get pull_request payload. Check a request reviewer event was triggered.");
    }
    const reviewers = context.payload.pull_request.requested_reviewers;
    // Assignees takes in a list of logins rather than the reviewer object.
    const reviewerNames = reviewers.map(reviewer => reviewer.login);
    const {number:issue_number} = context.payload.pull_request;

    github.rest.issues.addAssignees({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue_number,
      assignees: reviewerNames
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}
