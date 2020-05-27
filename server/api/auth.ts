import { Router, RequestHandler } from 'express';
import passport from 'passport';

type Method = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

type RouteHandler = [Method, string, ...RequestHandler[]];

const createRouter = (routeHandlers: RouteHandler[]) =>
  routeHandlers.reduce((router, [method, route, ...handlers]) => router[method](route, ...handlers), Router());

const githubRouter = createRouter([
  ['get', '/', passport.authenticate('github')],
  [
    'get',
    '/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    },
  ],
]);

export const router = Router().use('/github', githubRouter);
