module.exports = async ({ context, github, core }) => {
  try {
    const inputOwner = core.getInput('owner') || context.repo.owner
    const inputTopics = core.getInput('topics')
    const inputOperator = core.getInput('operator') || 'OR'
    const inputMatrixUse = core.getBooleanInput('matrix_use') || true
    const inputFormat = core.getInput('format') || 'json'
    const inputDelimiter = core.getInput('delimiter') || `\n`

    // constraints
    const choiceOperator = ['AND', 'OR']
    const choiceOutputFormat = ['json', 'flat']

    // validate choice inputs
    if (!choiceOperator.includes(inputOperator)) {
      throw new Error(`Invalid operator: ${inputOperator}, accepted values: ${choiceOperator.join(', ')}`)
    }

    if (!choiceOutputFormat.includes(inputFormat)) {
      throw new Error(`Invalid format: ${inputFormat}, accepted values: ${choiceOutputFormat.join(', ')}`)
    }

    if (inputFormat === 'flat' && inputFlatDelimiter === '') {
      throw new Error('Delimiter is required when format is `flat`')
    }

    // topics
    let topics = []
    if (inputTopics) {
      topics = inputTopics
        .trim()
        .split(',')
        .map((element) => {
          element = element.trim()
          if (element.includes(' ')) {
            return element.split(' ')
          } else {
            return element
          }
        })
        .flat()
        .filter((element) => element !== '')
    }

    core.info(`Owner: ${inputOwner}`)
    core.info(`Topics: ${JSON.stringify(topics)}`)
    core.info(`Operator: ${inputOperator}`)
    core.info(`Matrix Use: ${inputMatrixUse}`)
    core.info(`Format: ${inputFormat}`)
    core.info(`Delimiter: ${inputDelimiter === `\n` ? '\\n' : inputDelimiter}`)

    // construct search query
    let searchQuery = `user:${inputOwner}`
    if (topics.length > 0) {
      searchQuery += `+${topics.map((element) => element).join(`+${inputOperator}+`)}+in:topics`
    }
    core.info(`Search query: ${searchQuery}`)

    // check total count
    const checkTotalCount = await github.rest.search.repos({
      q: searchQuery,
      per_page: 1,
      page: 1
    })
    const totalCount = checkTotalCount.data.total_count
    core.info(`Found repo(s): ${totalCount}`)

    // check matrix limit
    if (inputFormat === 'json' && inputMatrixUse === 'true' && totalCount > 256) {
      throw new Error(
        'Found more than 256 repos. Please adjust the filter. 256 repos is a hard limit for matrix job! docs: https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow'
      )
    }

    // check gh api limit
    if (totalCount > 1000) {
      throw new Error(
        'Found more than 1000 repos. Please adjust the filter. 1000 repos is a hard limit for GitHub API query return!'
      )
    }

    // get repos
    const getRepos = await github.paginate(github.rest.search.repos, {
      q: searchQuery,
      per_page: 100,
      order: 'desc'
    })

    // construct output
    let repos = []
    if (totalCount) {
      getRepos.map((element) => {
        const repo = {
          owner: element.owner.login,
          name: element.name,
          full_name: element.full_name,
          private: element.private,
          html_url: element.html_url,
          fork: element.fork,
          archived: element.archived,
          disabled: element.disabled,
          is_template: element.is_template,
          visibility: element.visibility,
          default_branch: element.default_branch
        }
        repos.push(repo)
      })
    }

    // format output
    if (inputFormat === 'flat') {
      repos = repos.map((element) => {
        return element.full_name
      })
      repos = repos.join(inputDelimiter)
    }

    // set outputs
    core.setOutput('count', totalCount)
    core.setOutput('repos', repos)
    core.setOutput('format', inputFormat)
  } catch (error) {
    core.setFailed(error.message)
  }
}
