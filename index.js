"use strict"

var fs = require('fs')
var commander = require('commander')

commander.version('0.1.0')
.option('-d, --directory <directory>', 'Directory where json file(s) are located')
.parse(process.argv)

var directory = commander.directory

if(!directory){
  console.error("INVALID_DIRECTORY")
  process.exit()
}