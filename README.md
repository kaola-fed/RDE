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
rde/0.0.0 darwin-x64 node-v10.5.0
$ rde --help [COMMAND]
USAGE
  $ rde COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`rde build`](#rde-build)
* [`rde create [APPNAME]`](#rde-create-appname)
* [`rde help [COMMAND]`](#rde-help-command)
* [`rde lint`](#rde-lint)
* [`rde lint:fix`](#rde-lintfix)
* [`rde run CMD`](#rde-run-cmd)
* [`rde serve`](#rde-serve)
* [`rde suite`](#rde-suite)
* [`rde template:create RDTNAME`](#rde-templatecreate-rdtname)
* [`rde template:serve`](#rde-templateserve)

## `rde build`

@rede/suite development tool

```
USAGE
  $ rde build

EXAMPLE
  $ rde suite init
```

_See code: [src/commands/build.ts](https://github.com/kaolafed/rde/blob/v0.0.0/src/commands/build.ts)_

## `rde create [APPNAME]`

create a rde project

```
USAGE
  $ rde create [APPNAME]

ARGUMENTS
  APPNAME  app name

EXAMPLE
  $ rde create <appname>
```

_See code: [src/commands/create.ts](https://github.com/kaolafed/rde/blob/v0.0.0/src/commands/create.ts)_

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

@rede/suite development tool

```
USAGE
  $ rde lint

EXAMPLE
  $ rde suite init
```

_See code: [src/commands/lint/index.ts](https://github.com/kaolafed/rde/blob/v0.0.0/src/commands/lint/index.ts)_

## `rde lint:fix`

@rede/suite development tool

```
USAGE
  $ rde lint:fix

EXAMPLE
  $ rde suite init
```

_See code: [src/commands/lint/fix.ts](https://github.com/kaolafed/rde/blob/v0.0.0/src/commands/lint/fix.ts)_

## `rde run CMD`

run scripts provided by @rede/template

```
USAGE
  $ rde run CMD

ARGUMENTS
  CMD  commands provided by @rde/template

EXAMPLE
  $ rde run dev
```

_See code: [src/commands/run.ts](https://github.com/kaolafed/rde/blob/v0.0.0/src/commands/run.ts)_

## `rde serve`

start a dev server

```
USAGE
  $ rde serve

OPTIONS
  -d, --docker

EXAMPLE
  $ rde serve
```

_See code: [src/commands/serve.ts](https://github.com/kaolafed/rde/blob/v0.0.0/src/commands/serve.ts)_

## `rde suite`

@rde-pro/suite development tool

```
USAGE
  $ rde suite

EXAMPLE
  $ rde suite init
```

_See code: [src/commands/suite/index.ts](https://github.com/kaolafed/rde/blob/v0.0.0/src/commands/suite/index.ts)_

## `rde template:create RDTNAME`

create a rde template project

```
USAGE
  $ rde template:create RDTNAME

ARGUMENTS
  RDTNAME  rde template project name, used by package.json

EXAMPLE
  $ rde template:create <rdtname>
```

_See code: [src/commands/template/create.ts](https://github.com/kaolafed/rde/blob/v0.0.0/src/commands/template/create.ts)_

## `rde template:serve`

start a template dev server

```
USAGE
  $ rde template:serve

OPTIONS
  -d, --docker

EXAMPLE
  $ rde template:serve
```

_See code: [src/commands/template/serve.ts](https://github.com/kaolafed/rde/blob/v0.0.0/src/commands/template/serve.ts)_
<!-- commandsstop -->
