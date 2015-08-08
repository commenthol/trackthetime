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
Specify your <project> without using spaces. <description> may take as much spaces as you like.

If you like to add a line in the past use (assume it's 17:00h):

    ttt 11:00 meeting with smart people

To track your breaks:

    ttt p

To track your working end

    ttt e

Then check what you have done today with:

    ttt

If you like to change your entries, edit the file:

    ttt -e

If your entries have gone out of order, sort it:

    ttt -s

## Reporting

Reporting can be done per day, week, month. Switches are `-w, -w, -m`.
If you like to get reports a certain project use the `-p` switch.

To report all projects of the current week, type:

    ttt -w -p

To report all meetings of the current month, type (you need to have typed `ttt meeting` previously):

    ttt -w -p meeting

To restrict reporting to a certain timeframe, e.g. only last week use

    ttt -w -t -1week

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your
code to be distributed under the MIT license. You are also implicitly
verifying that all code is your original work or correctly attributed
with the source of its origin and licence.

## License

Copyright (c) 2015 commenthol (MIT License)

See [LICENSE][] for more info.

## References

<!-- !ref -->

<!-- ref! -->

[LICENSE]: ./LICENSE
