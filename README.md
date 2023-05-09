# 🗃️ Get Repositories Action

[![GitHub - marketplace](https://img.shields.io/badge/marketplace-get--repositories-blue?logo=github&style=flat-square)](https://github.com/marketplace/actions/get-repositories)
[![GitHub - release](https://img.shields.io/github/v/release/raven-actions/get-repos?style=flat-square)](https://github.com/raven-actions/get-repos/releases/latest)
[![GitHub - ci](https://img.shields.io/github/actions/workflow/status/raven-actions/get-repos/ci.yml?logo=github&label=CI&style=flat-square&branch=main&event=push)](https://github.com/raven-actions/get-repos/actions/workflows/ci.yml?query=branch%3Amain+event%3Apush)
[![GitHub - license](https://img.shields.io/github/license/raven-actions/get-repos?style=flat-square)](https://github.com/raven-actions/get-repos/blob/main/LICENSE)

This [GitHub Action](https://github.com/features/actions) provides an array of repositories associated with a provided organization or user, with the option to include specific topics related to the repositories.

The primary purpose is to repeat a task for all repositories in an organization using the [GitHub Actions matrix](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs) feature.

> ⚠️ With a job matrix, creating a maximum of **256** jobs per workflow run is possible!

## 📃 Table of Contents <!-- omit in toc -->

- [🤔 Usage](#-usage)
  - [Quick Start](#quick-start)
- [📥 Inputs](#-inputs)
- [📤 Outputs](#-outputs)
  - [Example JSON output](#example-json-output)
- [👥 Contributing](#-contributing)
- [📄 License](#-license)

## 🤔 Usage

### Quick Start

Example GitHub Workflow, to get all repositories that contain **ALL** listed topics (`AND` operator is by default). Follow [📥 Inputs](#-inputs) to adjust behavior to `OR`. Then the result will be: get all repos with **ANY** listed topics.

```yaml
name: Sync Repositories

on:
  schedule:
    - cron: "30 6 * * *"

jobs:
  get-repos:
    name: Get Repos
    runs-on: ubuntu-latest
    outputs:
      repos: ${{ steps.get-repos.outputs.repos }}
    steps:
      - name: Get Repositories Action
        id: get-repos
        uses: raven-actions/get-repos@v1
        with:
          topics: "sync,dependant,docs"

  sync-repos:
    name: Sync (${{ matrix.repo.name }})
    if: ${{ needs.get-repos.outputs.repos != '[]' }} # make sure repos exist
    runs-on: ubuntu-latest
    needs:
      - get-repos
    strategy:
      matrix:
        repo: ${{ fromJson(needs.get-repos.outputs.repos) }}
      fail-fast: false
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          repository: ${{ matrix.repo.full_name }}

      # rest of your workflow steps...
```

## 📥 Inputs

|      Name      | Required |   Type   |       Default value       | Description                                                                                          |
|:--------------:|:--------:|:--------:|:-------------------------:|------------------------------------------------------------------------------------------------------|
|    `owner`     |  false   | `string` | `github.repository_owner` | The organization or user name                                                                        |
|    `topics`    |  false   | `string` |         _not set_         | Comma-separated list of repository topics                                                            |
|   `operator`   |  false   | `string` |           `AND`           | Logic operator to use when filtering repositories by topics, `OR` or `AND`                           |
|  `matrix-use`  |  false   |  `bool`  |          `true`           | Output to be used in matrix job? It just checks that the returned query has not exceeded 256 repos.  |
| `github-token` |  false   | `string` |      `github.token`       | GitHub Token with `repo` scope. Be aware results are always limited to permissions of GitHub tokens. |

## 📤 Outputs

|  Name   |     Type      | Description                    |
|:-------:|:-------------:|--------------------------------|
| `repos` | `json object` | Repositories JSON array object |
| `count` |     `int`     | Number of found repositories   |

### Example JSON output

Each of the keys you can use in your matrix job.

```json
[
  {
    "owner": "raven-actions",
    "name": "debug",
    "full_name": "raven-actions/debug",
    "private": false,
    "html_url": "https://github.com/raven-actions/debug",
    "fork": false,
    "archived": false,
    "disabled": false,
    "is_template": false,
    "visibility": "public",
    "default_branch": "main"
  },
  {
    "owner": "raven-actions",
    "name": "actionlint",
    "full_name": "raven-actions/actionlint",
    "private": false,
    "html_url": "https://github.com/raven-actions/actionlint",
    "fork": false,
    "archived": false,
    "disabled": false,
    "is_template": false,
    "visibility": "public",
    "default_branch": "main"
  }
]
```

## 👥 Contributing

Contributions to the project are welcome! Please follow [Contributing Guide](https://github.com/raven-actions/get-repos/blob/main/.github/CONTRIBUTING.md).

## 📄 License

This project is distributed under the terms of the [MIT](https://github.com/raven-actions/get-repos/blob/main/LICENSE) license.
