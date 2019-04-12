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
$ rede COMMAND
running command...
$ rede (-v|--version|version)
rde/0.0.0 darwin-x64 node-v10.5.0
$ rede --help [COMMAND]
USAGE
  $ rede COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`rede help [COMMAND]`](#rede-help-command)
* [`rede init APPNAME`](#rede-init-appname)
* [`rede run CMD`](#rede-run-cmd)
* [`rede suite`](#rede-suite)
* [`rede template`](#rede-template)

## `rede help [COMMAND]`

display help for rede

```
USAGE
  $ rede help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

## `rede init APPNAME`

create a rede project

```
USAGE
  $ rede init APPNAME

ARGUMENTS
  APPNAME  package name, used by package.json

EXAMPLE
  $ rede create <appname>
```

_See code: [src/commands/init.ts](https://github.com/kaolafed/rede/blob/v0.0.0/src/commands/init.ts)_

## `rede run CMD`

run scripts provided by @rede/template

```
USAGE
  $ rede run CMD

ARGUMENTS
  CMD  commands provided by @rede/template

EXAMPLE
  $ rede run dev
```

_See code: [src/commands/run.ts](https://github.com/kaolafed/rede/blob/v0.0.0/src/commands/run.ts)_

## `rede suite`

@rede/suite development tool

```
USAGE
  $ rede suite

EXAMPLE
  $ rede suite init
```

_See code: [src/commands/suite/index.ts](https://github.com/kaolafed/rede/blob/v0.0.0/src/commands/suite/index.ts)_

## `rede template`

@rede/template development tool

```
USAGE
  $ rede template

EXAMPLE
  $ rede template init
```

_See code: [src/commands/template/index.ts](https://github.com/kaolafed/rede/blob/v0.0.0/src/commands/template/index.ts)_
<!-- commandsstop -->
