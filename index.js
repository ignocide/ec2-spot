'use strict'

const AWS = require('aws-sdk')
const ec2meta = require('ec2-meta')
const notifier = require('./notifier')

var toBase64 = function (cmd) {
  return new Buffer(cmd).toString('base64')
}

var createPreScript = function (opts) {
  var script = []

  if (opts && ((opts.create && opts.create.url) || (opts.terminate && opts.terminate.url))) {
    var optsString = JSON.stringify(opts)
    script.push('#!/bin/bash')
    script.push('mkdir /.spot_webhook_notifier')
    script.push('cd /.spot_webhook_notifier')
    script.push('npm install https://github.com/ignocide/spot-ec2')
    if (opts.create && opts.create.url) {
      script.push(`node -e 'var notifier = require("spot-ec2/notifier"); notifier.start("${opts.create.url}")'`)
    }
    if (opts.terminate && opts.terminate.url) {
      script.push(`node -e 'var notifier = require("spot-ec2/notifier"); notifier.cronTerminate("${opts.terminate.url}")'`)
    }
    script.push('exit')
  }
  script.push('')

  return script.join('\n')
}

var SPOT = function (awsOpts, instanceOpts, extraOpts, notifierOpts) {
  awsOpts.apiVersions = {
    ec2: '2016-11-15'
  }
  this.ec2 = new AWS.EC2(awsOpts)

  this.InstanceOpts = JSON.parse(JSON.stringify(instanceOpts))
  this.notifierOpts = notifierOpts
  this.extraOpts = extraOpts

  var preTask = createPreScript(notifierOpts)

  if (extraOpts) {
    if (extraOpts.cmd) {
      this.InstanceOpts.LaunchSpecification.UserData = toBase64(preTask + extraOpts.cmd)
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

SPOT.prototype.terminate = function (callback) {
  var self = this
  ec2meta.load('instance-id', function (err, instanceId) {
    // not ec2 (local)
    if (err || !instanceId) {
      return
    }

    self.ec2.terminateInstances({
      InstanceIds: [
        instanceId
      ]
    }, function (err, data) {
      if (err) {
        return
      }

      var url = null
      try {
        url = self.notifierOpts && self.notifierOpts.terminate && self.notifierOpts.terminate.url
      } catch (err) {

      }
      if (url) {
        notifier.terminate(url, new Date())
      }
    })
  })
}

module.exports = SPOT
