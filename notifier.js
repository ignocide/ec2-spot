'use strict'

const ec2meta = require('ec2-meta')
const request = require('request')
const Cronjob = require('cron').CronJob

var job = null

var notifyMessage = function (type, message) {
  this.type = type,
  this.message = message
}

var start = function (url) {
  ec2meta.load('instance-id', function (err, instanceId) {
    // not ec2 (local)
    if (err || !instanceId) {
      return
    }

    request({
      method: 'POST',
      url: url,
      json: notifyMessage('start', {
        instanceId: instanceId,
        timestamp: new Date()
      }),
      headers: {
        'content-type': 'application/json'
      }
    }, function () {})
  })
}

var terminate = function (url, date) {
  ec2meta.load('instance-id', function (err, instanceId) {
    // not ec2 (local)
    if (err || !instanceId) {
      return
    }

    if (job) {
      job.stop()
    }

    request({
      method: 'POST',
      url: url,
      json: notifyMessage('terminate', {
        instanceId: instanceId,
        timestamp: date
      }),
      headers: {
        'content-type': 'application/json'
      }
    }, function () {})
  })
}

var cronTerminate = function (url) {
  job = new CronJob('*/6 * * * * *', function () {
    ec2meta.load('termination-time', function (err, date) {
      // not ec2 (local)
      if (err || !date) {
        return
      }

      job.stop()

      terminate(url, date)
    })
  })

  job.start()
}

module.exports = {
  start: start,
  terminate: terminate,
  cronTerminate: cronTerminate
}
