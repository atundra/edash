import { createRouter, nestRouter, applyRouterMethodMap } from './utils';
import { pipe } from 'fp-ts/lib/pipeable';
import type { Router } from './types';

const githubRouter: Router = pipe(
  createRouter(),
  applyRouterMethodMap([
    ['get', '/', ({ passport }) => passport.authenticate('github')],
    [
      'get',
      '/callback',
      ({ passport }) => passport.authenticate('github', { failureRedirect: '/login' }),
      () => (req, res) => {
        res.redirect('/');
      },
    ],
  ])
);

export const router: Router = pipe(createRouter(), nestRouter('/github', githubRouter));
