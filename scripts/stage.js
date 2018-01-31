'use strict';

let AWS = require("aws-sdk"),
    proxy = require("proxy-agent"),
    fs = require("fs"),
    _ = require("lodash");

let awsRegion = "us-east-1";

// if a proxy is set
if (process.env.http_proxy){
    AWS.config.update({
        httpOptions: {
            agent: proxy(process.env.http_proxy);
        }
    });
}

let args = process.argv.slice(2);

if (args.length != 3){
    console.log("Usage: stage <BUILDID> <S3BUCKET> <S3KEYPREFIX");
    process.exit(1);
}

let buildId = args[0],
    s3Bucket = args[1],
    s3KeyPrefix = args[2],
    s3 = new AWS.S3({region: awsRegion});

let s3Params = {
        Bucket: s3Bucket,
        Key: s3KeyPrefix + "lambdas." + buildId + ".zip",
        ContentType: "application/zip",
        ServerSideEncryption: "AES256",
        Body: fs.createReadStream("./dist/lambdas.zip")
    }

s3.upload(s3Params, (err, data) => {
    if (err){
        console.log("ERROR: Could not stage file.");
        process.exit(1);
    } else {
        console.log("Staged file.")
    }
});