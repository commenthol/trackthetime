const help = `
  Usage: ttt [options]

  Options:

    -h, --help           output usage information
    -s, --sort           sort the time track log
    -e, --edit           edit the time track log
    -d, --day            report dayly stats
    -w, --week           report weekly stats
    -m, --month          report monthly stats
    -p, --project [prj]  report projects only
    -f, --from <val>     report from "val"
    -t, --to <val>       report until "val"
    -l, --last [n]       show last n lines
        --config         open config in editor
`

function cli (args) {
  const argv = expand(args || process.argv.slice(2))
  const cmd = { args: [] }

  while (argv.length) {
    const arg = argv.shift()

    switch (arg) {
      case '-h':
      case '--help':
        cmd.help = help
        break
      case '-s':
      case '--sort':
        cmd.sort = true
        break
      case '-e':
      case '--edit':
        cmd.edit = true
        break
      case '-d':
      case '--day':
        cmd.day = true
        break
      case '-w':
      case '--week':
        cmd.week = true
        break
      case '-m':
      case '--month':
        cmd.month = true
        break
      case '-p':
      case '--project':
        cmd.project = nextArg(argv)
        break
      case '-f':
      case '--from':
        cmd.from = nextArg(argv, true)
        break
      case '-t':
      case '--to':
        cmd.to = nextArg(argv, true)
        break
      case '-l':
      case '--last':
        cmd.last = nextArg(argv)
        break
      case '--config':
        cmd.config = true
        break
      default:
        cmd.args.push(arg)
    }
  }
  return cmd
}

module.exports = cli

function expand (argv) {
  const nArgv = []
  for (const arg of argv) {
    if (/^-[a-z]+$/.test(arg)) {
      const shortArgs = arg.slice(1).split('')
      for (const short of shortArgs) {
        nArgv.push(`-${short}`)
      }
    } else {
      nArgv.push(arg)
    }
  }
  return nArgv
}

function nextArg (argv, required = false) {
  const next = argv[0]
  if (typeof next !== 'string' || next.indexOf('-') === 0) {
    return required ? undefined : true
  }
  return argv.shift()
}
