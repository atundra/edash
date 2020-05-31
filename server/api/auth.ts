import { createRouter, nestRouter, applyRouterMethodMap } from './utils';
import { pipe } from 'fp-ts/lib/pipeable';
import type { Router, ReqHandler } from './types';

const setNextRedirect: ReqHandler = () => (req, res, next) => {
  if (req.session && req.query.next && String(req.query.next).startsWith('/')) {
    /**
     * @todo
     * Better validatation for next url
     */
    req.session.redirectTo = req.query.next;
  }

  return next();
};

const authenticateGithub: ReqHandler = ({ passport }) => passport.authenticate('github');

const authenticateGithubAndRediredToLoginPage: ReqHandler = ({ passport }) =>
  passport.authenticate('github', { failureRedirect: '/login' });

const redirectToNext: ReqHandler = () => (req, res) =>
  req.session?.redirectTo ? res.redirect(req.session.redirectTo) : res.redirect('/');

const githubRouter: Router = pipe(
  createRouter(),
  applyRouterMethodMap([
    ['get', '/', setNextRedirect, authenticateGithub],
    ['get', '/callback', authenticateGithubAndRediredToLoginPage, redirectToNext],
  ])
);

export const router: Router = pipe(createRouter(), nestRouter('/github', githubRouter));
