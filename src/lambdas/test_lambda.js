"use strict";

let winston = require("winston");

if (process.env.LOG_LEVEL){
    winston.level = process.env.LOG_LEVEL;
} else {
    winston.level = "info";
}

exports.handler = async (event, context, callback) => {
    winston.info("test_lambda.handler invoked");

    try {
        callback(null, {msg, "Hello World"});
    } catch (e) {
        callback (e);
    }
}