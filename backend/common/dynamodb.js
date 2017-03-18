var aws = require('aws-sdk')
var doc = require('dynamodb-doc')
var awsClient = new aws.DynamoDB({region: "eu-west-1"})

var serverlessHelpers = require('serverless-helpers-js').loadEnv()

export const dynamo = new doc.DynamoDB(awsClient)
