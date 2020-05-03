import puppeteer from 'puppeteer';
import { PUPPETEER_ARGS } from '../config';

const browser = puppeteer.launch({ args: PUPPETEER_ARGS });

export const getBrowser = () => browser;
