'use strict';

let AWS = require('aws-sdk'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

var args = process.argv.slice(2);

if (args.length != 4){
    console.log("Usage: stack <BUILDID> <ENV> <CF_TEMPLATE_FILE> <create | update | delete>")
    process.exit(1);
}

let buildid = args[0],
    env = args[1],
    template = args[2],
    operation = args[3],
    name = path.parse(template).name.toUpperCase().replace(/_/g, '-'),
    stack = name + '-' + env;

// prepocess template and replace the BUILD_ID and ENV tokens
let templateContents = fs.readFileSync(template, "utf8");
templateContents = templateContents.replace(/%ENV%/g, env);
templateContents = templateContents.replace(/%BUILD_ID%/g, buildid);

// update stack
let cFormation = new AWS.CloudFormation({region: "us-east-1"});
let cfParams = {
    StackName: stack,
    TemplateBody: templateContents,
    Parameters: [
        {
            ParameterKey: "Env",
            ParameterValue: env
        },
        {
            ParameterKey: "BuildId",
            ParameterValue: buildid
        }
    ]
}

if (operation === "create" || operation === "update"){
    cFormation.describeStacks({StackName: stack}, (err, data) => {
        if (err) {
            console.log("Creating stack...");

            cFormation.createStack(cfParams, (err1, data1) => {
                if (err1) {
                    console.log("ERROR: Unable to create stack.", err1)
                    process.exit(1);
                } else {
                    console.log("Stack creation in progress. ", data1.StackId)
                }
            });
        } else {
            console.log("Updating stack...");

            cFormation.updateStack(cfParams, (err2, data2) => {
                if (err2) {
                    console.log("ERROR: Unable to update stack.", err2)
                    process.exit(1);
                } else {
                    console.log("Stack update in progress. ", data2.StackId)
                }
            })
        }
    });
} else if (operation === "delete"){
    cFormation.deleteStack({StackName: stack}, (err, data) => {
        if (err){
            console.log("Unable to delete stack.", err);
            process.exit(1);
        } else {
            console.log("Started stack deletion");
        }
    });
}