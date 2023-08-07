const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');

const telegramToken = '6261398570:AAEEWtJdnZqAhXnqmfYpe08HGUkrvhkN2Nw';
const newsApiKey = '0c5ae748f67442659f3ecdb1a7704f2a';
const channelId = '@uzbek_times_uz';

// Create a new Telegram bot
const bot = new TelegramBot(telegramToken, { polling: false });

// Function to fetch news from the News API
async function getNews() {
    try {
        const response = await axios.get(
            `https://newsapi.org/v2/everything?q=Uzbekistan&apiKey=${newsApiKey}`
        );
        return response.data.articles;
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

// Function to post news to the Telegram channel
async function postNewsToChannel() {
    try {
        const news = await getNews();

        const seenNews = new Set();

        for (const article of news) {
            if (seenNews.has(article.url)) {
                continue;
            }

            const imageResponse = await axios.get(article.urlToImage, { responseType: 'arraybuffer' });
            const message = `
            ${article.title}
            
${article.description}
            
            \nRead more: ${article.url}
          `;


            await bot.sendPhoto(channelId, imageResponse.data, { caption: message });
            console.log('News sent to the channel successfully.');

            await new Promise((resolve) => setTimeout(resolve, 2000));

            seenNews.add(article.url);
        }
    } catch (error) {
        console.error('Error posting news to the channel:', error);
    }
}

// Function to send news to the Telegram channel on startup
async function sendNewsOnStartup() {
    try {
        await postNewsToChannel();
    } catch (error) {
        console.error('Error sending news on startup:', error);
    }
}

// Call the function to send news to the Telegram channel on startup
cron.schedule('*/1 * * * *', () => {
    sendNewsOnStartup();
});