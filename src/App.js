import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TELEGRAM_TOKEN = '6261398570:AAEEWtJdnZqAhXnqmfYpe08HGUkrvhkN2Nw';
const NEWS_API_KEY = 'pub_263410b19bc56012dbb3a58758ab9cdceea77';
const CHANNEL_ID = '@uzbek_times_uz';
const App = () => {
  const [posting, setPosting] = useState(false);

  const fetchNews = async () => {
    try {
      const response = await axios.get(
        `https://newsdata.io/api/1/news?language=ru&apikey=${NEWS_API_KEY}`
      );
      return response.data.results;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const sendMessageToChannel = async (text, photoUrl) => {
    const payload = {
      chat_id: CHANNEL_ID,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };

    try {
      const responseText = await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(responseText.data);

      if (photoUrl) {
        const photoPayload = {
          chat_id: CHANNEL_ID,
          photo: photoUrl,
          caption: text,
          parse_mode: 'HTML',
        };

        await new Promise((resolve) => setTimeout(resolve, 1000)); // 3 hours delay
        const responsePhoto = await axios.post(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`,
          photoPayload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log(responsePhoto.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleStartPosting = async () => {
    setPosting(true);
    const newsArticles = await fetchNews();

    const imageUrlsByTitle = {};
    for (const article of newsArticles) {
      imageUrlsByTitle[article.title] = article.image_url;
    }

    let index = 0;
    const interval = setInterval(async () => {
      if (index < newsArticles.length) {
        const article = newsArticles[index];
        const message = `
          ${article.title}
\n${article.description}
          \nБольше: ${article.link}
        `;
        const photoUrl = imageUrlsByTitle[article.title] || "";
        await sendMessageToChannel(message, photoUrl);
        index++;
      } else {
        clearInterval(interval); // Stop the interval when all articles are posted
        setPosting(false);
      }
    },  180 * 60 * 1000); // 60000 milliseconds = 1 minute
  };
  useEffect(() => {
    handleStartPosting(); // Invoke the function once when the component mounts
  }, []); 
  return (
    <div>
      <h1>Uzbek News Bot</h1>
      <button onClick={handleStartPosting} disabled={posting}>
        {posting ? 'Posting...' : 'Start Posting News'}
      </button>
    </div>
  );
};

export default App;