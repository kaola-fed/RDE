rede
====

Recommanded Development Environment

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/rede.svg)](https://npmjs.org/package/rede)
[![Downloads/week](https://img.shields.io/npm/dw/rede.svg)](https://npmjs.org/package/rede)
[![License](https://img.shields.io/npm/l/rede.svg)](https://github.com/nupthale/rede/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g rde
$ rde COMMAND
running command...
$ rde (-v|--version|version)
rde/0.0.1-beta.15 darwin-x64 node-v10.5.0
$ rde --help [COMMAND]
USAGE
  $ rde COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`rde build`](#rde-build)
* [`rde clean [CMD]`](#rde-clean-cmd)
* [`rde create [NAME]`](#rde-create-name)
* [`rde docker:run [CMD]`](#rde-dockerrun-cmd)
* [`rde docs:init`](#rde-docsinit)
* [`rde docs:publish`](#rde-docspublish)
* [`rde docs:serve`](#rde-docsserve)
* [`rde help [COMMAND]`](#rde-help-command)
* [`rde install [CMD]`](#rde-install-cmd)
* [`rde lint [CMD]`](#rde-lint-cmd)
* [`rde publish`](#rde-publish)
* [`rde run [CMD]`](#rde-run-cmd)
* [`rde serve`](#rde-serve)
* [`rde sync [CMD]`](#rde-sync-cmd)

## `rde build`

```
USAGE
  $ rde build

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -i, --install        generate local node_modules
  -r, --rebuild        rebuild image before run
  -v, --verbose        show verbose logs
  -w, --watch

EXAMPLE
  $ rde build
```

_See code: [lib/commands/build.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/build.js)_

## `rde clean [CMD]`

```
USAGE
  $ rde clean [CMD]

ARGUMENTS
  CMD  scripts provided by container

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -v, --verbose        show verbose logs
  -w, --watch

EXAMPLE
  $ rde clean
```

_See code: [lib/commands/clean.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/clean.js)_

## `rde create [NAME]`

open RDE world

```
USAGE
  $ rde create [NAME]

ARGUMENTS
  NAME  project name to create

OPTIONS
  -v, --verbose  show verbose logs

EXAMPLE
  $ rde create
```

_See code: [lib/commands/create.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/create.js)_

## `rde docker:run [CMD]`

run script inside docker container

```
USAGE
  $ rde docker:run [CMD]

ARGUMENTS
  CMD  scripts provided by container

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -v, --verbose        show verbose logs
  -w, --watch

EXAMPLE
  $ rde docker:run <cmd>
```

_See code: [lib/commands/docker/run.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/docker/run.js)_

## `rde docs:init`

```
USAGE
  $ rde docs:init

EXAMPLE
  $ rde docs:init
```

_See code: [lib/commands/docs/init.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/docs/init.js)_

## `rde docs:publish`

```
USAGE
  $ rde docs:publish

OPTIONS
  -v, --verbose  show verbose logs

EXAMPLE
  $ rde docs:publish
```

_See code: [lib/commands/docs/publish.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/docs/publish.js)_

## `rde docs:serve`

```
USAGE
  $ rde docs:serve

OPTIONS
  -v, --verbose  show verbose logs

EXAMPLE
  $ rde docs:serve
```

_See code: [lib/commands/docs/serve.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/docs/serve.js)_

## `rde help [COMMAND]`

display help for rde

```
USAGE
  $ rde help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

## `rde install [CMD]`

```
USAGE
  $ rde install [CMD]

ARGUMENTS
  CMD  scripts provided by container

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -v, --verbose        show verbose logs
  -w, --watch

EXAMPLE
  $ rde install
```

_See code: [lib/commands/install.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/install.js)_

## `rde lint [CMD]`

```
USAGE
  $ rde lint [CMD]

ARGUMENTS
  CMD  scripts provided by container

OPTIONS
  -e, --extras=extras        arguments need to pass to npm run cmd
  -i, --install              generate local node_modules
  -m, --commitMsg=commitMsg  commit msg
  -r, --rebuild              rebuild image before run
  -s, --staged               lint staged
  -v, --verbose              show verbose logs
  -w, --watch

EXAMPLE
  $ rde lint
```

_See code: [lib/commands/lint.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/lint.js)_

## `rde publish`

```
USAGE
  $ rde publish

OPTIONS
  -i, --increment=increment  Increment a version by the specified level.
                             Level can be one of: major, minor, patch, premajor, preminor,
                             prepatch, or prerelease.  Default level is 'patch'. Only one version may be
                             specified.

  -t, --tag=tag              as your image tag for pushing to docker hub, you should use increment just in case

  -v, --verbose              show verbose logs

  --preid=preid              Identifier to be used to prefix premajor, preminor, prepatch or prerelease version
                             increments.

EXAMPLES
  $ rde publish -t <semver-like version>
  $ rde publish -i prerelease --preid beta
  $ rde publish --preid beta
```

_See code: [lib/commands/publish.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/publish.js)_

## `rde run [CMD]`

run scripts provided by container

```
USAGE
  $ rde run [CMD]

ARGUMENTS
  CMD  scripts provided by container

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -i, --install        generate local node_modules
  -r, --rebuild        rebuild image before run
  -v, --verbose        show verbose logs
  -w, --watch

EXAMPLE
  $ rde run <cmd>
```

_See code: [lib/commands/run.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/run.js)_

## `rde serve`

```
USAGE
  $ rde serve

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -i, --install        generate local node_modules
  -r, --rebuild        rebuild image before run
  -v, --verbose        show verbose logs
  -w, --watch

EXAMPLE
  $ rde serve
```

_See code: [lib/commands/serve.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/serve.js)_

## `rde sync [CMD]`

```
USAGE
  $ rde sync [CMD]

ARGUMENTS
  CMD  scripts provided by container

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -v, --verbose        show verbose logs
  -w, --watch

EXAMPLE
  $ rde sync
```

_See code: [lib/commands/sync.js](https://github.com/kaolafed/rde/blob/v0.0.1-beta.15/lib/commands/sync.js)_
<!-- commandsstop -->
