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
$ npm install -g rede
$ rede COMMAND
running command...
$ rede (-v|--version|version)
rede/0.0.0 darwin-x64 node-v10.5.0
$ rede --help [COMMAND]
USAGE
  $ rede COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`rede hello [FILE]`](#rede-hello-file)
* [`rede help [COMMAND]`](#rede-help-command)

## `rede hello [FILE]`

describe the command here

```
USAGE
  $ rede hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ rede hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/nupthale/rede/blob/v0.0.0/src/commands/hello.ts)_

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
<!-- commandsstop -->
