/**
 * Notes:
 *   It only adds assignees. It does not remove assignees.
 *   Not able to test yet with how it works with auto adding a reviewer.
 *   Presumably it works the same as manually adding a reviewer, but you never know.
 */
module.exports = ({github, context, core}) => {
  try {
    console.log(context);
    console.log("============");
    console.log(context.payload.pull_request);
    if (context.payload.pull_request === undefined) {
      throw new Error("Can't get pull_request payload. Check a request reviewer event was triggered.");
    }

    const reviewers = context.payload.pull_request.requested_reviewers;
    console.log(`Reviewers: ${reviewers}`);
    // Assignees takes in a list of logins rather than the reviewer object.
    const reviewerNames = reviewers.map(reviewer => reviewer.login);
    console.log(`ReviewerNames: ${reviewerNames}`);
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
