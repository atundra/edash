import puppeteer from "puppeteer";

const browser = puppeteer.launch();

export const getBrowser = () => browser;
