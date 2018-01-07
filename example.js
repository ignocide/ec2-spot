const ec2Spot = require('ec2-spot')
const config = require('./config')
var cmd = []

cmd.push(`#!/bin/bash`)
cmd.push(`git clone -b develop https://${config.id}:${config.passwd}@bitbucket.org/${config.group}/${config.project}.git`)
cmd.push(`cd ${config.project}`)
cmd.push(`npm install`)
cmd.push(`node run`)

var spot = new ec2Spot({
  accessKeyId: `${config.aws.appId}`,
  secretAccessKey: `${config.aws.secretKey}`,
  region: ''
}, {
  LaunchSpecification: {
    IamInstanceProfile: {
      Arn: ''
    },
    ImageId: '',
    InstanceType: '',
    KeyName: '',
    SecurityGroupIds: [
    ]
  },
  SpotPrice: '',
  Type: ''
}, {
  'cmd': cmd.join('\n')
}, {
  create: {
    url: `${config.startWebhookUrl}`
  },
  terminate: {
    url: `${config.endWebhookUrl}`
  }
})

//launch
spot.launch(function (err, result) {
  console.log(err)
  console.log(result)
  console.log(JSON.stringify(result, null, 2))
})


//terminate
spot.terminate(function () {
  process.exit(0)
})
