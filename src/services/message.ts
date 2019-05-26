export const MCOMMON = {
  UNRECOGNIZED: 'Missing rde config file',
  UNSUPPORTED_FRAMEWORK: 'Unsupported framework in your config file',
  WRONG_FRAMEWORK_CONFIG: 'Framework is not set correctly in your config file or framework is not supported by rde',
  WRONG_DOCKER_CONFIG_PORTS: 'Missing docker ports in your config file',
  WRONG_DOCKER_CONFIG_TAG: 'Missing docker tag in your config file',
  WRONG_MAPPING_CONFIG_MAPPING: 'Missing exportFiles in your config file',
  WRONG_DOCS_CONFIG: 'Incorrect docs url in your config file',
  INVALID_COMMIT_MSG_FORMAT: 'invalid commit msg format',
  UNRECOGNIZED_VERSION_FLAG: 'Unrecognized version flag for publish',
  WRONG_PUBLISH_TAG: 'Use semver-like tag instead of latest',
  WRONG_PROJECT_STRUCTURE: 'Unsupported project structure, please use `$rde create` to create one'
}

export const MRDA = {
  UNRECOGNIZED: 'Unrecognized application project, please use `$ rde create` to create one',
  NO_PKG_IN_CACHE_DIR: 'Cannot find package.json in .cache dir, please run `$rde lint` first'
}

export const MRDC = {
  UNRECOGNIZED: 'Unrecognized container project, please use `$ rde create` to create one',
  WRONG_DIR_STRUCTURE_APP: 'Wrong dir structure, app dir is not exist',
  WRONG_DIR_STRUCTURE_TPL: 'Wrong dir structure, template dir is not exist',

}

export const MDOCS = {
  MISSING_DOCS_DIR: 'Missing _docs dir at root project',
  MISSING_REQUIRED_MD: 'Missing index.md or faq.md in _docs dir',
}
