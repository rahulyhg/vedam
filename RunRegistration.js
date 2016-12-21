var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var path = require('path')
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
var TAMIL_CALENDAR_DATA=path.resolve('data/TamilCalendar.json')
var VedamUtils = require(path.resolve('VedamUtils'))

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Sheets API.
  authorize(JSON.parse(content), listRegistrations);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      console.log("IN error",err)
      getNewToken(oauth2Client, callback);

    } else {
      console.log("File path",TOKEN_PATH)
      oauth2Client.credentials = JSON.parse(token);
      console.log("Got token-->",token.toString())
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listRegistrations(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '17VagNnpcMoWULGfF08AMFpEKB5uwo7b2-jP7b5KzhIA',
    range: 'Form Responses 1!A2:J',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
     // console.log("data",rows)

     // console.log('Name, Major:');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        console.log('%s,%s,%s,%s,%s,%s,%s', row[1],row[2],row[3],row[4],row[5],row[6],row[7]);
      }
      console.log("Calling Check Tamil Month")
      checkTamilMonth(auth,response.values)
      
  }
  });

  
}


function checkTamilMonth(auth,listOfPeople){
  var vedamUtils=new VedamUtils()
  var calendarData = vedamUtils.readCalendarData()
  var unRegistered=vedamUtils.getReminderNotSet(listOfPeople)
  console.log("UnRegistered Users",unRegistered)
  var reminderDateSet=vedamUtils.calculateReminders(unRegistered)
  console.log("Calculated Reminders for Users",reminderDateSet)
  if(reminderDateSet!==undefined && reminderDateSet.length>0){
    updateSheet(auth,reminderDateSet)
  }
 // 
}


function updateSheet(auth,reminderDateSet){
  console.log('IN update Sheets')
  var spreadsheetId = '17VagNnpcMoWULGfF08AMFpEKB5uwo7b2-jP7b5KzhIA';
  var collToUpdate=7
  var rowToUpdate=1
  var requests = [];
  var vedamUtils=new VedamUtils()
 for (i = 0; i < reminderDateSet.length; i++) {
  requests.push({
  updateCells: {
  start: {sheetId: 962028053, rowIndex: reminderDateSet[i][10]+1, columnIndex: collToUpdate},
    rows: [{
      values: [{
        userEnteredValue: {stringValue: reminderDateSet[i][7]}
      }]
    }],
    fields: 'userEnteredValue'
  }
});
  vedamUtils.sendEmail(reminderDateSet[i][1],reminderDateSet[i][5],reminderDateSet[i][3],reminderDateSet[i][2])
}
 
console.log('Created Request for update')
var batchUpdateRequest = {requests: requests}
var sheets = google.sheets('v4');

sheets.spreadsheets.batchUpdate({
   auth: auth,
  spreadsheetId: spreadsheetId,
  resource: batchUpdateRequest
}, function(err, response) {
  if(err) {
    // Handle error
    console.log("Error while Updating Sheets for Reminder Date",err);
  }
  console.log('Sheets Updated Successfully')
});
}