require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const bodyParser = require('body-parser')
app.use('/', bodyParser.urlencoded({ extended: false }))
const dns = require('dns');

const Schema = mongoose.Schema;
const urlSchema = new Schema({ original_url: String, short_url: Number });
const ShortUrl = mongoose.model('ShortUrl', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  let url = new URL(req.body.url);
  dns.lookup(url.hostname, (error, address, family) => {
    if (error) { res.json({ error: 'invalid url' }) } else {
      console.log(`address: ${address} family: IPv${family}`);
      ShortUrl.find()
        .then((data) => {
          new ShortUrl({ original_url: req.body.url, short_url: data.length + 1 }).save()
            .then(res.json({ original_url: req.body.url, short_url: data.length + 1 }))
            .catch((error) => { console.log(error) })
        })
        .catch((error) => { console.log(error) })
    }
  });
});

app.get('/api/shorturl/:num', (req, res) => {
  ShortUrl.find({ short_url: req.params.num })
    .then((data) => {
      res.redirect(data[0]['original_url'])
    })
    .catch((error) => { console.log(error) })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
