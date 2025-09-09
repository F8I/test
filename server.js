const express = require('express');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = 3000;


const delay = ms => new Promise(res => setTimeout(res, ms));


async function scrapeImages(username) {
  const baseURL = 'https://fapello.com/ajax/model/" + username + "/page-';
  let page = 1;
  let allImageURLs = [];

  while (true) {
    const url = `${baseURL}${page}`;
    console.log(`Fetching: ${url}`);

    try {
      const res = await fetch(url);
      const html = await res.text();

      if (!html.trim()) {
        console.log('Empty HTML detected. Stopping.');
        break;
      }

      const dom = new JSDOM(html);
      const images = dom.window.document.querySelectorAll('img');

      images.forEach(img => {
        allImageURLs.push(img.src);
      });


      await delay(100);
      page++;

    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      break;
    }
  }

  return allImageURLs;
}



app.get('/get/:username', async (req, res) => {
  try {
    const imageUrls = await scrapeImages(req.param.username);
    res.json({ images: imageUrls });
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Ready")
})


module.exports = app;
