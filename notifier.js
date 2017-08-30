'use strict'

const ec2meta = require('ec2-meta')
const request = require('request')
const CronTab = require('crontab')
const path = require('path')

var job = null

var NotifyMessage = function (type, message) {
  this.type = type
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
      json: new NotifyMessage('start', {
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

    CronTab.load(function (err, crontab) {
      if (err || !crontab) {
        return
      }

      crontab.remove({
        comment: 'ec2-spot-terminate-notification'
      })

      crontab.save(function () {})
    })
  })
}

var checkTerminate = function (url) {
  ec2meta.load('termination-time', function (err, date) {
    // not ec2 (local)
    if (err || !date) {
      return
    }

    terminate(url, date)
  })
}

var registerCron = function (url) {
  CronTab.load(function (err, crontab) {
    if (err || !crontab) {
      return
    }

    var jobFile = path.join(__dirname, 'job.js')
    job = crontab.create(['node', jobFile, url].join(' '), '*/6 * * * *', 'ec2-spot-terminate-notification')
    crontab.save(function () {})
  })
}

module.exports = {
  start: start,
  terminate: terminate,
  checkTerminate: checkTerminate,
  registerCron: registerCron
}
