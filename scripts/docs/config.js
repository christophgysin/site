/**
  Constants used for doc processing scripts
*/
const path = require('path')
const projectRoot = path.join(__dirname, '..', '..')
const repoURL = 'https://github.com/serverless/serverless'
// set branch of docs you want to see
const repoBranch = 'master'
/* uncomment out the line below to work locally with different docs branch
repoBranch = 'improve-docs'
/**/

module.exports = {
  repoURL,
  repoBranch,
  serverlessRepoPath: path.join(projectRoot, 'serverless'),
  serverlessDocsPath: path.join(projectRoot, 'serverless/docs/'),
  // path to where docs live in site content folder
  siteDocsPath: path.join(projectRoot, 'content/framework/docs/'),
  docsMenuPath: path.join(projectRoot, 'src/layouts/Doc/'),
  // downloadLink: `${repoURL}/archive/master/.zip`
  downloadLink: `${repoURL}/archive/${repoBranch}/.zip`
}
