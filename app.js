process.chdir(__dirname);
const package_info = require("./package.json");
var software = package_info.name + " (V " + package_info.version + ")";
console.log(software);
console.log("=".repeat(software.length));

const fs = require('fs');
var envpath = __dirname + "/.env";
var config = require("dotenv").config({ path: envpath });
var config_example = "";
if (fs.existsSync(".env")) {
  for (var attributename in config.parsed) {
    config_example += attributename + "=\r\n";
  }
  fs.writeFileSync(".env.example", config_example);
}

var queue = require("better-queue");
var q = new queue(
  function(input, cb) {
    input(cb);
  },
  { afterProcessDelay: 1000 * 60 }
);

var OKCupid = require('okcupidjs')
var okc = new OKCupid()

okc.login(process.env.LOGIN, process.env.PASS, function(err, res, body) {
  console.log(body);
  if (err) {
    console.log('Login Error');
    console.error(err);
    process.exit(1);
    return;
  }
  console.log("Login Successfull?!");
});
