'use strict'

const AWS = require('aws-sdk')
const ec2meta = require('ec2-meta')

var toBase64 = function (cmd) {
  return new Buffer(cmd).toString('base64')
}

var SPOT = function (awsOpts, instanceOpts, extraOpts) {
  awsOpts.apiVersions = {
    ec2: '2016-11-15'
  }
  this.ec2 = new AWS.EC2(awsOpts)
  this.InstanceOpts = JSON.parse(JSON.stringify(instanceOpts))

  if (notifierOpts) {

  }

  if (extraOpts) {
    this.extraOpts = extraOpts
    if (extraOpts.cmd) {
      this.InstanceOpts.LaunchSpecification.UserData = toBase64(extraOpts.cmd)
    }
  }
}

SPOT.prototype.launch = function (callback) {
  var self = this
  var opts = JSON.parse(JSON.stringify(self.InstanceOpts))

  if (self.extraOpts && self.extraOpts.duration) {
    opts.ValidUntil = new Date(+new Date() + self.extraOpts.duration * 1000).toISOString()
  }
  self.ec2.requestSpotInstances(opts, callback)
}

module.exports = SPOT
