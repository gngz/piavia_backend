const argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .option("p",{
    alias : "port",
    describe: 'port number',
    nargs: 1,

  }).argv


