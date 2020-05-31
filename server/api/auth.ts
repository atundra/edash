import { createRouter, nestRouter, applyRouterMethodMap } from './utils';
import { pipe } from 'fp-ts/lib/pipeable';
import type { Router } from './types';

const githubRouter: Router = pipe(
  createRouter(),
  applyRouterMethodMap([
    [
      'get',
      '/',
      () => (req, res, next) => {
        if (req.session && req.query.next && String(req.query.next).startsWith('/')) {
          /**
           * @todo
           * Better validatation for next url
           */
          req.session.redirectTo = req.query.next;
        }

        return next();
      },
      ({ passport }) => passport.authenticate('github'),
    ],
    [
      'get',
      '/callback',
      ({ passport }) => passport.authenticate('github', { failureRedirect: '/login' }),
      () => (req, res) => (req.session?.redirectTo ? res.redirect(req.session.redirectTo) : res.redirect('/')),
    ],
  ])
);

export const router: Router = pipe(createRouter(), nestRouter('/github', githubRouter));
