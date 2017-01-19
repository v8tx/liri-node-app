//ext files and dependencies
var keys = require('./keys.js');
var OAuth = require('OAuth');
var requestify = require('requestify');
var request = require('request');
var colors = require('colors');
var fs = require('fs');

//command line args
var command = process.argv[2];
var optParam = process.argv[3];


init();

//makes it easy to control where the data is being output to
function print(something) {
    console.log(something);
    fs.appendFile('./log.txt', something + "\n", 'utf-8', function(err, data) {
        if (err) {
            return console.log(err);
        }
    });
}

//called at runtime immediately; Checks for initial errors
function init() {
    if (command === undefined) {
        print("What was that? I need explicit instructions!".red);
    } else if (command === "my-tweets" || command === "do-what-it-says" || command === "movie-this" || command === "spotify-this-song") {
        main();
    } else {
        print("Hmm, I don't understand".red);
    }
}

//main func to handle which functions get run
function main() {
    if (!optParam) {
        if (command === "my-tweets") {
            print("FETCHING TWEETS".green);
            tweetify("https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=v_lotus8&count=20");
        } else if (command === "do-what-it-says") {
            openFile();
        } else if (command === "spotify-this-song") {
            spotifySong("The Sign");
        } else if (command === "movie-this") {
            findMovie("Mr. Nobody");
        } else {
            print("I'm sorry. I don't recognize those commands!")
        }
    } else {
        if (command === "movie-this") {
            findMovie(optParam);
        } else {
            spotifySong(optParam);
        }
    }
}
//function to grab my last 20 tweets;
function tweetify(specifiedURL) {
    var oauth = new OAuth.OAuth('https://api.twitter.com/oauth/request_token', 'https://api.twitter.com/oauth/access_token', keys["twitterKeys"]["consumer_key"], keys["twitterKeys"]["consumer_secret"], '1.0A', null, 'HMAC-SHA1');
    oauth.get(specifiedURL, keys["twitterKeys"]["access_token_key"],
        //you can get it at dev.twitter.com for your own apps
        keys["twitterKeys"]["access_token_secret"],
        //you can get it at dev.twitter.com for your own apps
        function(e, data, res) {
            if (e) console.error(e);
            var numberOfPosts = JSON.parse(data).length;
            for (var i = 0; i < numberOfPosts; i++) {
                print(JSON.parse(data)[i]["created_at"]);
                print(JSON.parse(data)[i]["text"].blue);
            }
        });
}

//opens file and runs init again; Needs better err handling
function openFile() {
    print("Running Open File...".green);
    fs.readFile('./random.txt', 'utf-8', function(err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
        data = data.split(',');
        command = data[0];
        optParam = data[1];
        init();
    });
}

//Uses request;
function findMovie2(optParam) {
	request('http://www.omdbapi.com/?t=' + optParam + '&y=&plot=short&tomatoes=true&r=json', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    movie = JSON.parse(body);// Show the HTML for the Google homepage. 
    print(movie["Title"]);
        print(movie["Year"]);
        print(movie["Rated"]);
        print(movie["Country"]);
        print(movie["Language"]);
        print(movie["Plot"]);
        print(movie["tomatoRating"] + "%");
        print(movie["tomatoURL"]);
  	}
});
}

//Uses Requestify;
function findMovie(optParam) {
    optParam = optParam.replace(" ", "+");
    print("Looking For Movie...".green);
    requestify.get('http://www.omdbapi.com/?t=' + optParam + '&y=&plot=short&tomatoes=true&r=json').then(function(response) {
        movie = response.getBody();
        print(movie["Title"]);
        print(movie["Year"]);
        print(movie["Rated"]);
        print(movie["Country"]);
        print(movie["Language"]);
        print(movie["Plot"]);
        print(movie["Actors"]);
        print(movie["tomatoRating"] + "%");
        print(movie["tomatoURL"]);
    });
}

//similar to the movie one above;b
function spotifySong(optParam) {
    optParam = optParam.replace(" ", "%");
    print("Looking For Song...".green);
    requestify.get('https://api.spotify.com/v1/search?q=' + optParam + '&type=track&limit=10').then(function(response) {
        // Get the response body
        results = response.getBody()['tracks']['items'];
        for (var i = 0; i < results.length; i++) {
            print(i + ".");
            print("Artists: " + results[i]["artists"][0]["name"].green);
            print("Song Name: " + optParam.replace('%', ' ').blue);
            print("Preview: " + results[i]["preview_url"].gray);
            print("Album: " + results[i]["album"]["name"]);
            print('\n');
        }
    });
}