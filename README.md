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
rde/0.0.1-alpha.1 darwin-x64 node-v10.5.0
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
* [`rde docker:run CMD`](#rde-dockerrun-cmd)
* [`rde docs:publish`](#rde-docspublish)
* [`rde docs:serve`](#rde-docsserve)
* [`rde help [COMMAND]`](#rde-help-command)
* [`rde lint`](#rde-lint)
* [`rde publish`](#rde-publish)
* [`rde run CMD`](#rde-run-cmd)
* [`rde serve`](#rde-serve)
* [`rde suite`](#rde-suite)

## `rde build`

```
USAGE
  $ rde build

OPTIONS
  -v, --verbose  show verbose logs

EXAMPLE
  $ rde build
```

_See code: [src/commands/build.ts](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.1/src/commands/build.ts)_

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

_See code: [src/commands/create.ts](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.1/src/commands/create.ts)_

## `rde docker:run CMD`

run script inside docker container

```
USAGE
  $ rde docker:run CMD

ARGUMENTS
  CMD  scripts provided by container

OPTIONS
  -v, --verbose  show verbose logs
  -w, --watch

EXAMPLE
  $ rde docker:run <cmd>
```

_See code: [src/commands/docker/run.ts](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.1/src/commands/docker/run.ts)_

## `rde docs:publish`

```
USAGE
  $ rde docs:publish

EXAMPLE
  $ rde docs:serve
```

_See code: [src/commands/docs/publish.ts](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.1/src/commands/docs/publish.ts)_

## `rde docs:serve`

```
USAGE
  $ rde docs:serve

EXAMPLE
  $ rde docs:serve
```

_See code: [src/commands/docs/serve.ts](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.1/src/commands/docs/serve.ts)_

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
  -v, --verbose  show verbose logs

EXAMPLE
  $ rde lint
```

_See code: [src/commands/lint.ts](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.1/src/commands/lint.ts)_

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

_See code: [src/commands/publish.ts](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.1/src/commands/publish.ts)_

## `rde run CMD`

run scripts provided by container

```
USAGE
  $ rde run CMD

ARGUMENTS
  CMD  scripts provided by container

OPTIONS
  -v, --verbose  show verbose logs
  -w, --watch

EXAMPLE
  $ rde run <cmd>
```

_See code: [src/commands/run.ts](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.1/src/commands/run.ts)_

## `rde serve`

```
USAGE
  $ rde serve

OPTIONS
  -v, --verbose  show verbose logs

EXAMPLE
  $ rde serve
```

_See code: [src/commands/serve.ts](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.1/src/commands/serve.ts)_

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

_See code: [src/commands/suite/index.ts](https://github.com/kaolafed/rde/blob/v0.0.1-alpha.1/src/commands/suite/index.ts)_
<!-- commandsstop -->
