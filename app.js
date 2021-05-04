process.chdir(__dirname);
const package_info = require("./package.json");
var software = package_info.name + " (V " + package_info.version + ")";
console.log(software);
console.log("=".repeat(software.length));

const fs = require("fs");
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
  function (input, cb) {
    input(cb);
  },
  { afterProcessDelay: 1000 * 60 }
);

//var OKCupid = require('okcupidjs')
var OKCupid = require("okcupidtest");
var Promise = require("bluebird");
//var okc = new OKCupid()
var okc = Promise.promisifyAll(new OKCupid());

var p_search = {
  // Primary filter
  order_by: "LOGIN", // "LOGIN" | "MATCH_AND_DISTANCE" | "ENEMY" | "MATCH"
  i_want: "women", // "men" {
  they_want: "men", // "women" | "everyone"
  minimum_age: 18,
  maximum_age: 40,
  radius: 25, // miles from location
  last_login: 86400, // seconds since last login

  // Looks filter
  // Height: each inch is 254
  // e.g. 5'4  is 5 * 12 * 254  + 4 * 254 = 16256
  //maximum_height: null,
  //minimum_height: null,

  // A-list features
  //minimum_attractiveness: null, // 4000 | 6000 | 8000 | 10000
  //maximum_attractiveness: null, // 4000 | 6000 | 8000 | 10000
  //"bodytype": [], "thin" | "fit" | "average" | "jacked" | "overweight" | "a_little_extra" | "full_figured" | "curvy"

  // Background filter
  //languages: 0,
  speaks_my_language: true,
  //"ethnicity": [], "asian" | "black" | "native_american" | ...
  //religion: ["agnosticism", "atheism"], //"buddhism" | "catholicism" | "christianity" | "sikh" | ...

  // Availabilty filter
  availability: "single", // "not_single"
  //monogamy: "yes", // "no"
  //looking_for: ["short_term_dating"], // "new_friends" | "long_term_dating" | "casual_sex"

  // Personality filter
  /*"personality_filters": {
		"self_confidence" : ..., // "more" | "less"
		"compassion" : ..., // "more" | "less"
		"independence" : ..., // "more" | "less"
		"introversion" : ..., // "more" | "less"
		"adventuresome" : ..., // "more" | "less"
		"artsiness" : ..., // "more" | "less"
		"romantic" : ..., // "more" | "less"
		"sex_experience" : ..., // "more" | "less"
		"old_fashionedness" : ..., // "more" | "less"
		"trust_in_others" : ..., // "more" | "less"
		"purity" : ... // "more" | "less"
	},*/

  // Vices filter
  //"smoking": ["no", "sometimes"] // "when_drinking" | "trying_to_quit" | "yes"
  //"drinking": ["socially", "rarely", "very_often"] // "not_at_all" | "often" | desperately"
  //"drugs": ["sometimes"], // "never" | "often"

  // Questions filter
  //questions: [403], // question id collection, 403 is "Do you enjoy discussing politics?"
  //answers: [2], // 2 for "yes" to question 403
  // maps by index to answer in "answers" field

  // More filter
  //"interest_ids": [], // interests id
  //"education": ["post_grad"], // "two_year_college" | "college_university" | "high_school"
  //"children": ["wants_kids", "doesnt_have"] // "might_want" | "doesnt_want" | "has_one_or_more"
  //"cats": ["has"],
  //"dogs": [], "has"

  // Additional metadata
  limit: 18, // max number of results
  fields: "userinfo,thumbs,percentages,likes,last_contacts,online", // additional data to be returned
};

okc.login(process.env.LOGIN, process.env.PASS, function (err, res, body) {
  console.log(err);
  okc.search({}, function (err, res, body) {
    console.log("2");
  });
});

async function main() {
  try {
    await okc.loginAsync(process.env.LOGIN, process.env.PASS);
    console.log("login done");
  } catch (e) {
    console.log("Failed to login. Check your username and password in the env file.");
    return;
  }
  console.log("searching...");

  let count = 0;

  const search = () => {
    okc.search(p_search, function (err, res, body) {
      body.data.forEach(function (user) {
        console.log(user.username);
      });
      var hash = body.paging.cursors.after;
      // check termination condition, otherwise recurse
      if (hash != null && count <= 100) {
        p_search.after = hash;
        count = count + body.data.length;
        search();
      }
    });
  };

  search();
}
//main();
