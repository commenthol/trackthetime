# trackthetime

> A time tracker

[![NPM version](https://badge.fury.io/js/trackthetime.svg)](https://www.npmjs.com/package/trackthetime/)
[![Build Status](https://secure.travis-ci.org/commenthol/trackthetime.svg?branch=master)](https://travis-ci.org/commenthol/trackthetime)

Yet another time tracker which runs from commandline.

Super simple to use. Easy reporting.

## Installation

    npm i -g trackthetime

## Usage

To track you time per project use the following format

    ttt <project> <description>

e.g.

    ttt coding yet some other lines of code

This adds a line to the `ttt.log` file in `~/.config/ttt/`.
Specify your `<project>` without using spaces. `<description>` may take as much spaces as you like.

If you like to add a line in the past, use (assume it's 17:00h):

    ttt 11:00 meeting with smart people

If you got interrupted at 10:30 by a phone call of 30 min

    ttt 10:30 +30 phone Mr. Burns calling

To track your breaks:

    ttt p

Continue with previous task:

    ttt c

To track your working end

    ttt e

Then check what you have done today with:

    ttt

If you have been on vacation at 24th of December

    ttt 12-24 vacation

or sick the day after new year...

    ttt 01-02 sick

If you like to change your entries, edit the file:

    ttt -e

If your entries have gone out of order, sort it:

    ttt -s

To quickly check your last entries:

    ttt -l

## Configuration

Configuration can be changed with:

    ttt --config

---

```js
{
  "daily": 8,     // daily working hours
  "weekly": 40,   // weekly working hours
  "editor": "vi", // (optional) your commandline editor of choice
                  // if unset then EDITOR env var is used
}
```

## Reporting

Reporting can be done per day, week, month. Switches are `-d, -w, -m`.  
If you like to get reports from a certain project use the `-p` switch.

To report all projects of the current week, type:

    ttt -w -p

To report all meetings of the current month, type (you need to have typed `ttt meeting` previously):

    ttt -m -p meeting

To report all meetings of the current month including breaks:

    ttt -m -p meeting,pause

To restrict reporting to a certain timeframe, e.g. only last week use

    ttt -w -t 1week

To report restrict your projects to everything except 'meetings':

    ttt -m -p *,-meeting,pause

## Options

```
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
```

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your
code to be distributed under the MIT license. You are also implicitly
verifying that all code is your original work or correctly attributed
with the source of its origin and licence.

## License

Copyright (c) 2016 commenthol (MIT License)

See [LICENSE][] for more info.

## References

<!-- !ref -->

* [LICENSE][LICENSE]

<!-- ref! -->

[LICENSE]: ./LICENSE
