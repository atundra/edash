import readline from 'readline';
import { readFile, writeFile } from 'fs';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { startOfDay } from 'date-fns';
import {
  GOOGLE_API_OAUTH_CLIENT_ID,
  GOOGLE_API_OAUTH_CLIENT_SECRET,
  GOOGLE_API_OAUTH_REDIRECT_URI,
  GOOGLE_API_OAUTH_TOKEN_PATH,
  ENABLE_GOOGLE_API,
} from '../../../config';
import { events as stubEvents } from './stub';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = GOOGLE_API_OAUTH_TOKEN_PATH;

export const loadCalendarEvents = (
  params: calendar_v3.Params$Resource$Events$List = {}
): Promise<calendar_v3.Schema$Event[]> =>
  new Promise((resolve, reject) => {
    if (!ENABLE_GOOGLE_API) {
      resolve(stubEvents);
      return;
    }

    authorize((auth) => {
      const calendar = google.calendar({ version: 'v3', auth });
      calendar.events.list(
        {
          calendarId: 'primary',
          timeMin: startOfDay(new Date()).toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
          ...params,
        },
        (err, res) => {
          if (err) {
            return reject(err);
          }
          const items = res?.data.items;
          if (!items) {
            resolve([]);
          } else {
            resolve(items);
          }
        }
      );
    });
  });

type OauthCallback = (client: OAuth2Client) => void;

const authorize = (callback: OauthCallback) => {
  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_API_OAUTH_CLIENT_ID,
    GOOGLE_API_OAUTH_CLIENT_SECRET,
    GOOGLE_API_OAUTH_REDIRECT_URI
  );

  // Check if we have previously stored a token.
  readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getAccessToken(oAuth2Client, callback);
    }

    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    callback(oAuth2Client);
  });
};

const getAccessToken = (
  oAuth2Client: OAuth2Client,
  callback: OauthCallback
) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err || !token) {
        return console.error('Error retrieving access token', err);
      }

      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          return console.error(err);
        }

        console.log('Token stored to', TOKEN_PATH);
      });

      callback(oAuth2Client);
    });
  });
};
