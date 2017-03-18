import moment from 'moment'
import querystring from 'querystring'
import Promise from 'bluebird'
import R from 'ramda'
import {dynamo} from './common/dynamodb'
import twitter from 'twitter'

const twitterClient = new Twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
})

Promise.promisifyAll(dynamo)

export function listGoals(req, context, cb) {
  loadGoals()
    .then(items => {cb(null, items)})
    .catch(err => {cb(err)})
}

function loadGoals() {
  return dynamo.scanAsync({TableName: 'goals'})
    .then(result => result.Items)
}

function sendScoreToTwitter(ply1Goals, ply2Goals) {
  const ply1Name = 'Suomi'
  const ply2Name = 'Ruotsi'

  let tweet

  if(ply1Goals > ply1Goals) {
    tweet = `${ply1Name} beats ${ply2Name} ${ply1Goals} - ${ply2Goals}`
  } else {
    tweet = `${ply2Name} beats ${ply1Name} ${ply2Goals} - ${ply1Goals}`
  }

  return twitterClient.post('statuses/update', {status: tweet})
    .then(console.log, console.log)
}

export function addGoal(req, context, cb) {
  console.log(req.body)
  const time = moment()
  const player = (req.body && req.body.player) || 'none'

  const checkIfGameEnded = () => {

    loadGoals()
      .then(result => result.Items)
      .then(goals => {
        const ply1Goals = goals.filter(goal => goal.player === "1").sum
        const ply2Goals = goals.filter(goal => goal.player === "2").sum

        if((ply1Goals === 10 && ply2Goals < 10) || (ply2Goals === 10 && ply1Goals < 10)) {
         return sendScoreToTwitter(ply1Goals, ply2Goals)
        }
        else return null
      })
      .then(() => cb(null, {message: `Goal Saved for player ${player}! Time is ${time.toString()}`}))
  }

  dynamo.putItem(
    {TableName: 'goals', Item: {player, time: time.valueOf(), humanTime: time.toString()}},
    function(err, result) {
      if(err) cb(err)
      else checkIfGameEnded()
    }
  )
}

export function removeGoals(req, context, cb) {
  loadGoals()
    .then(R.map(removeGoal))
    .then(R.all)
    .then(wasRemoved => {cb(null, wasRemoved ? 'Removed' : 'Not removed')})
    .catch(err => {cb(err)})
}

function removeGoal({player, time}) {
  console.log('remove goals for', player)
  return dynamo.deleteItemAsync({
      TableName: 'goals',
      Key: {player, time}
  })
    .tap(() => console.log('item removed'))
    .then(() => true)
}

export function isGameOn(req, context, cb) {
  const time = moment()
  Promise.all([getLastPingForPlayer('1'), getLastPingForPlayer('2')])
    .then(R.pipe(
      R.map(result => result.Item),
      R.all(item => item && (time.valueOf() - item.time < 5000))
    ))
    .then(isOn => {cb(null, isOn)})
    .catch(err => {cb(err)})
}

function getLastPingForPlayer(player) {
  return dynamo.getItemAsync({
      TableName: 'pings',
      Key: {player}
  }).tap(result => console.log('got item', result.Item))
}

export function addPing(req, context, cb) {
  const time = moment()
  const player = (req.body && req.body.player) || 'none'

  return dynamo.putItemAsync(
    {TableName: 'pings', Item: {player, time: time.valueOf(), humanTime: time.toString()}},
  )
    .tap(saved => console.log('saved'))
    .then(() => {cb(null, {message: `Pinged`})})
    .catch(err => {cb(err)})
}
