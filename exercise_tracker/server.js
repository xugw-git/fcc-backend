const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const bodyParser = require('body-parser')
app.use('/', bodyParser.urlencoded({ extended: false }))

const Schema = mongoose.Schema;
const userSchema = new Schema({ username: String, count: Number, log: [{ description: String, duration: Number, date: String }] });
const UserInfo = mongoose.model('UserInfo', userSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//Create a New User
app.post('/api/users', (req, res) => {
  new UserInfo({ username: req.body.username, count: 0, log: [] }).save()
    .then((data) => { res.json({ username: req.body.username, _id: data._id }) })
    .catch((error) => { console.log(error) })
});

//Add exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  UserInfo.findById(req.params._id)
    .then((data) => {
      let date = new Date().toDateString();
      if (req.body.date) {
        date = new Date(req.body.date).toDateString()
      }
      data.count += 1;
      data.log.push({ description: req.body.description, duration: req.body.duration, date: date })
      data.save()
        .then((data) => { res.json({ username: data.username, _id: data._id, description: data.log.slice(-1)[0].description, duration: data.log.slice(-1)[0].duration, date: data.log.slice(-1)[0].date }) })
        .catch((error) => { console.log(error) })
    })
    .catch((error) => { console.log(error) })
});

//GET all users
app.get('/api/users', (req, res) => {
  UserInfo.find()
    .then((data) => {
      let usersarr = []
      for (let i = 0; i < data.length; i++) {
        usersarr.push({
          _id: data[i]._id, username
            : data[i].username
        })
        res.json(usersarr)
      }
    })
    .catch((error) => { console.log(error) })
})

//GET user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  UserInfo.findById(req.params._id)
    .then((data) => {
      let logarr = data.log
      if (req.query.from) {
        logarr = logarr.filter(i => Date.parse(i.date) >= Date.parse(req.query.from))
      }
      if (req.query.to) {
        logarr = logarr.filter(i => Date.parse(i.date) <= Date.parse(req.query.to))
      }
      if (req.query.limit) {
        logarr = logarr.slice(0, req.query.limit)
      }
      res.json({ username: data.username, _id: data._id, count: data.count, log: logarr })
    })
    .catch((error) => { console.log(error) })
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
