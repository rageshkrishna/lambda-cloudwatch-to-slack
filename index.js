'use strict';

const request = require('request');

const slackChannel = process.env.slackRoom;
const hookUrl = process.env.hookUrl;

exports.handler = function (event, context, callback) {
  processCloudWatchEvent(event, callback);
};

function processCloudWatchEvent(event, callback) {
  console.log("Received event", JSON.stringify(event));
  const record = event.Records[0].Sns;
  const subject = record.Subject;
  const message = JSON.parse(record.Message);
  const alarmName = message.AlarmName;
  const newState = message.NewStateValue;
  const reason = message.NewStateReason;

  const slackMessage = {
    channel: slackChannel,
    attachments: [{
        text: `${alarmName} state is now ${newState}: ${reason}`,
    }],
    text: '*' + subject + '*',
    /* jshint camelcase:false */
    icon_emoji: ':lightning_cloud:'
    /* jshint camelcase:true */
  };
  

  const reqOpts = {
    uri: hookUrl,
    headers: {
      'Content-Type': 'application/json'
    },
    json: slackMessage
  };

  request.post(reqOpts,
    function (err) {
      if (err) {
        console.log('Error posting to Slack:', err);
        return callback(err);
      }
    }
  );
}