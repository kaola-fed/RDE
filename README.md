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
rde/0.0.1-alpha.26 darwin-x64 node-v10.5.0
$ rde --help [COMMAND]
USAGE
  $ rde COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`rde build`](#rde-build)
* [`rde create`](#rde-create)
* [`rde docker:run [CMD]`](#rde-dockerrun-cmd)
* [`rde docs:publish`](#rde-docspublish)
* [`rde docs:serve`](#rde-docsserve)
* [`rde help [COMMAND]`](#rde-help-command)
* [`rde lint`](#rde-lint)
* [`rde publish`](#rde-publish)
* [`rde run [CMD]`](#rde-run-cmd)
* [`rde serve`](#rde-serve)
* [`rde suite`](#rde-suite)

## `rde build`

```
USAGE
  $ rde build

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -r, --rebuild        rebuild image before run
  -s, --staged         lint staged
  -v, --verbose        show verbose logs
  -w, --watch

EXAMPLE
  $ rde build
```

_See code: [lib/commands/build.js](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.26/lib/commands/build.js)_

## `rde create`

open RDE world

```
USAGE
  $ rde create

OPTIONS
  -f, --from=from  create container from another one
  -v, --verbose    show verbose logs

EXAMPLE
  $ rde create
```

_See code: [lib/commands/create.js](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.26/lib/commands/create.js)_

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

_See code: [lib/commands/docker/run.js](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.26/lib/commands/docker/run.js)_

## `rde docs:publish`

```
USAGE
  $ rde docs:publish

OPTIONS
  -v, --verbose  show verbose logs

EXAMPLE
  $ rde docs:serve
```

_See code: [lib/commands/docs/publish.js](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.26/lib/commands/docs/publish.js)_

## `rde docs:serve`

```
USAGE
  $ rde docs:serve

OPTIONS
  -v, --verbose  show verbose logs

EXAMPLE
  $ rde docs:serve
```

_See code: [lib/commands/docs/serve.js](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.26/lib/commands/docs/serve.js)_

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

## `rde lint`

```
USAGE
  $ rde lint

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -r, --rebuild        rebuild image before run
  -s, --staged         lint staged
  -v, --verbose        show verbose logs
  -w, --watch

EXAMPLE
  $ rde lint
```

_See code: [lib/commands/lint.js](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.26/lib/commands/lint.js)_

## `rde publish`

```
USAGE
  $ rde publish

OPTIONS
  -t, --tag=tag  (required) as your image tag for pushing to docker hub
  -v, --verbose  show verbose logs

EXAMPLE
  $ rde publish
```

_See code: [lib/commands/publish.js](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.26/lib/commands/publish.js)_

## `rde run [CMD]`

run scripts provided by container

```
USAGE
  $ rde run [CMD]

ARGUMENTS
  CMD  scripts provided by container

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -r, --rebuild        rebuild image before run
  -s, --staged         lint staged
  -v, --verbose        show verbose logs
  -w, --watch

EXAMPLE
  $ rde run <cmd>
```

_See code: [lib/commands/run.js](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.26/lib/commands/run.js)_

## `rde serve`

```
USAGE
  $ rde serve

OPTIONS
  -e, --extras=extras  arguments need to pass to npm run cmd
  -r, --rebuild        rebuild image before run
  -s, --staged         lint staged
  -v, --verbose        show verbose logs
  -w, --watch

EXAMPLE
  $ rde serve
```

_See code: [lib/commands/serve.js](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.26/lib/commands/serve.js)_

## `rde suite`

@rde-pro/suite development tool

```
USAGE
  $ rde suite

OPTIONS
  -v, --verbose  show verbose logs

EXAMPLE
  $ rde suite init
```

_See code: [lib/commands/suite/index.js](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.26/lib/commands/suite/index.js)_
<!-- commandsstop -->
