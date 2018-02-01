const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const ZipPlugin = require("zip-webpack-plugin");

const config = {}

const build_timestamp = Date.now().toString();

// support multiple lambdas
// read dir and transform to -
// {lambda1: "./lambdas/lambda1.js", lambda2: "./lambdas/lambda2.js"}
config.entry = fs.readdirSync(path.join(__dirname, "./src/lambdas"))
    .filter(filename => /\.js$/.test(filename))
    .map(filename => {
        var entry = {};
        entry[filename.replace(".js", "")] = path.join(
            __dirname,
            "./src/lambdas",
            filename
        );
        return entry;
    })
    .reduce((finalObject, entry) => Object.assign(finalObject, entry), {});

// build for node
config.target = "node";
config.node = {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
}

config.output = {
    path: path.join(__dirname, "dist"),
    library: "[name]",
    libraryTarget: "commonjs2",
    filename: '[name].js'
}

config.resolve = {
    extensions: [
        "*",
        ".js",
        ".json"
    ]
}

config.module = {}
config.module.loaders = [
    {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
    },
    {
        test: /\.json$/,
        loader: "json-loader"
    }
]

config.plugins = [
    new ZipPlugin({filename: "lambdas.zip"})
]

module.exports = config;

console.log("BUILD ID: ", build_timestamp);