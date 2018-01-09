
## useage

### create ec2Instance
```javascript
const ec2Spot = require('ec2-spot')
const spotInstance = new ec2Spot(AWSCertificate,SpotInstanceConfig,startUpCommand,webHookEndpoints)
```

### start

```javascript
spot.launch(function (err, result) {
  console.log(err)
  console.log(JSON.stringify(result, null, 2))
})
```

### terminate

```javascript
//not remote, use in local env
spot.terminate(function () {
  process.exit(0)
})
```

## configs

| config    | required  | etc     |
|:----------|:----------|:--------|
| AWSCertificate     | true     |  http://docs.amazonaws.cn/en_us/AWSJavaScriptSDK/latest/AWS/EC2.html |
| SpotInstanceConfig | true     |  http://docs.amazonaws.cn/en_us/AWSJavaScriptSDK/latest/AWS/EC2.html#requestSpotInstances-property |
| startUpCommand | false     | |
| webHookEndpoints | false | |

### ec2 spot instance config example

```javascript
//AWSCertificate
{
  "accessKeyId": "",
  "secretAccessKey":"",
  "region": ""
}

//SpotInstanceConfig
{
  "LaunchSpecification": {
    "IamInstanceProfile": {
      Arn: ""
    },
    "ImageId": "",
    "InstanceType": "",
    "KeyName": "",
    "SecurityGroupIds": []
  },
  "SpotPrice": "",
  "Type": ""
}

let cmd = []
cmd.push(`#!/bin/bash`)
cmd.push(`git clone -b develop https://${config.id}:${config.passwd}@bitbucket.org/${config.group}/${config.project}.git`)
cmd.push(`cd ${config.project}`)
cmd.push(`npm install`)
cmd.push(`node run`)
//startUpCommand
{
  cmd: cmd.join('\n')
}

//webHookEndpoints
{
  create: {
    url: `${config.startWebhookUrl}`
  },
  terminate: {
    url: `${config.endWebhookUrl}`
  }
}

```
