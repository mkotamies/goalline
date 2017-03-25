import React, { Component } from 'react'
import './App.css'
import classnames from 'classnames'
import Stopwatch from 'timer-stopwatch'

import Api from './Api'

const goalSound = new Audio('goalshort.mp3')

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      data: [],
      online: false,
      team1: localStorage.getItem('goalline.team1.name') || 'Suomi',
      team2: localStorage.getItem('goalline.team2.name') || 'Ruotsi',
      time: 0,
      timer: null,
      gameEnded: false
    }
  }

  componentDidMount() {
    this.getCurrentScore(false)
    this.getGameStatus()
    this.startGame()
  }

  getCurrentScore(shouldAnimateChange) {
    return Api.getCurrentScore()
      .then(data => this.updateScores(data, shouldAnimateChange))
      .then(this.postpone(this.getCurrentScore))
      .catch(this.postpone(this.getCurrentScore))
  }

  getGameStatus() {
    return Api.getGameStatus()
      .then(online => this.setState({online}))
      .then(this.postpone(this.getGameStatus))
      .catch(this.postpone(this.getGameStatus))

  }

  postpone(func) {
    return () => setTimeout(func.bind(this), 500)
  }

  restartGame() {
    return Api.restartGame()
      .then(this.updateScores.bind(this))
      .then(this.startGame.bind(this))
  }

  startGame() {
    if (this.state.timer) this.state.timer.stop()
    const timer = new Stopwatch()
    timer.onTime(time => this.setState({time: time.ms}))
    timer.start()
    this.setState({timer, gameEnded: false})
  }

  updateScores(data, shouldAnimateChange = true) {
    const team1Goal = shouldAnimateChange && this.goalsForTeam(data, "1") > this.goalsForTeam(this.state.data, "1")
    const team2Goal = shouldAnimateChange && this.goalsForTeam(data, "2") > this.goalsForTeam(this.state.data, "2")

    this.setState({data, team1Goal, team2Goal}, this.ifGameJustEnded.bind(this))
  }

  goalsForTeam(data, team) {
    return data.filter(goal => goal.player === team).length
  }

  updateTeamName(team, newName) {
    localStorage.setItem(`goalline.${team}.name`, newName)
    const state = {}
    state[team] = newName
    this.setState(state)
  }

  ifGameJustEnded() {

    const team1 = {name: this.state.team1, goals: this.goalsForTeam(this.state.data, "1")}
    const team2 = {name: this.state.team2, goals: this.goalsForTeam(this.state.data, "2")}

    let winner = null
    let looser = null

    if (team1.goals === 10 && team2.goals < 10) {
      winner = team1
      looser = team2
    }
    else if (team2.goals === 10 && team1.goals < 10) {
      winner = team2
      looser = team1
    }

    if(winner && looser) {
      const message = `${winner.name} beats ${looser.name} ${winner.goals} - ${looser.goals}! #wedogoalslive`
      if(!this.state.gameEnded) Api.tweet(message)
      this.setState({gameEnded: true})
    }
  }

  render() {
    const team1Goals = this.goalsForTeam(this.state.data, "1")
    const team2Goals = this.goalsForTeam(this.state.data, "2")

    const online = this.state.online === true ? "Yhdistetty Goal Liveen" : "Goal Live ei yhteydessä"

    const team1Classes = classnames({
      "teambox": true,
      "team1": true,
      "grows": this.state.team1Goal
    })

    const team2Classes = classnames({
      "teambox": true,
      "team2": true,
      "grows": this.state.team2Goal
    })

    if (this.state.team1Goal || this.state.team2Goal) goalSound.play()

    return (
      <div className="App">
        <div className="container teams">
          <input type="text" value={this.state.team1} onChange={e => this.updateTeamName('team1', e.target.value)}/>
          <input type="text" value={this.state.team2} onChange={e => this.updateTeamName('team2', e.target.value)}/>
        </div>
        <span className="timer">{this.renderTime()}</span>
        <div className="container score">
          <div className={team1Classes}>{team1Goals}</div>
          <div className="teambox">-</div>
          <div className={team2Classes}>{team2Goals}</div>
        </div>
        <div className={this.state.online ? "status on" : "status off"}>{online}</div>

        <h2 className="restart" onClick={this.restartGame.bind(this)}>Uusi peli</h2>
      </div>
    );
  }

  renderTime() {
    const time = this.state.time
    let minutes = parseInt(time / (60 * 1000), 10)
    let seconds = parseInt((time % (60 * 1000)) / 1000, 10)

    if (minutes < 10) minutes = "0" + minutes
    if (seconds < 10) seconds = "0" + seconds

    return `${minutes}:${seconds}`
  }
}

export default App
