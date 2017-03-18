import moment from 'moment'
import querystring from 'querystring'
import Promise from 'bluebird'
import R from 'ramda'
import {dynamo} from './common/dynamodb'

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

export function addGoal(req, context, cb) {
  console.log(req.body)
  const time = moment()
  const player = (req.body && req.body.player) || 'none'

  dynamo.putItem(
    {TableName: 'goals', Item: {player, time: time.valueOf(), humanTime: time.toString()}},
    function(err, result) {
      if(err) cb(err)
      else cb(null, {message: `Goal Saved for player ${player}! Time is ${time.toString()}`})
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
