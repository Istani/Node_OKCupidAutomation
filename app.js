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
var BumAPI = require("bumbleapi")(
  process.env.BUMBLE_LOGIN,
  process.env.BUMBLE_PASS
);

var q = new queue(
  function(input, cb) {
    input(cb);
  },
  { afterProcessDelay: 1000 * 60 }
);

var count = 100;
q.push(cb => {
  Login(cb);
});
function NeustartUndSo(Zeit = 5) {
  console.log(new Date(), "Restart in " + Zeit + " Min!");
  setTimeout(() => {
    count = 100;
    main();
  }, 1000 * 60 * Zeit);
}


async function Login(cb) {
  BumAPI.startup().then(res => {
    console.log(res);
    q.push(cb => {
      GetUser(cb);
    });
    cb();
  });
}
async function GetUser(cb) {
  try {
    BumAPI.getEncounters().then(data => {
      for (let i = 0; i < data.results.length; i++) {
        if (count > 0) {
          count--;
          const element = data.results[i].user;
          console.log(element);
          save_file("P_" + element.user_id, element);
          q.push(cb => {
            Vote(element, cb);
          });
        } else {
          NeustartUndSo(60*8);
          cb();
          return;
        }
      }

      q.push(cb => {
        GetUser(cb);
      });
      cb();
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
async function Vote(user, cb) {
  try {
    BumAPI.voteYestForEncounter(user.user_id).then(data => {
      console.log(data);
      cb();
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
async function save_file(name, data, only_new = false) {
  try {
    var filename = "./tmp/" + name + ".json";
    var fs = require("fs");
    if (fs.existsSync(filename)) {
      if (only_new) {
        return false;
      }
      fs.unlinkSync(filename);
    }
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
