import {
  Strategy as GithubStrategy,
  StrategyOptions as GithubStrategyOptions,
  Profile as GithubProfile,
} from 'passport-github';
import type { VerifyCallback as Oauth2VerifyCallback } from 'passport-oauth2';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } from './config';

const getGithubStrategyConfig = (): GithubStrategyOptions => ({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: GITHUB_CALLBACK_URL,
});

const verifyCallback = (
  accessToken: string,
  refreshToken: string,
  profile: GithubProfile,
  done: Oauth2VerifyCallback
): void => {};

const getGithubStrategy = () => new GithubStrategy(getGithubStrategyConfig(), verifyCallback);
