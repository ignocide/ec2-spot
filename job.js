'use strict'

const notifier = require('./notifier')

var url = process.argv[2]
if(!url){
  return 
}
notifier.checkTerminate(url)
