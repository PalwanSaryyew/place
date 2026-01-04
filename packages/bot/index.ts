import { Bot, Keyboard } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = 'https://nexuz.space';

if (!token) {
  throw new Error('BOT_TOKEN must be provided!');
}

if (!webAppUrl) {
    throw new Error('WEB_APP_URL must be provided!');
}

const bot = new Bot(token);

// Create a simple keyboard layout.
const keyboard = new Keyboard().webApp('Go to Store', webAppUrl).resized();

bot.command('start', (ctx) => {
    ctx.reply('Welcome to the store! Click the button below to start shopping.', {
        reply_markup: keyboard,
    });
});

bot.start();

console.log('Bot started');

// Enable graceful stop
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
