import React, { Component } from 'react'
import './App.css'
import classnames from 'classnames'

import Api from './Api'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      data: [],
      status: false
    }
  }

  componentDidMount(){
    this.getCurrentScore(false)
    this.getGameStatus()
  }

  getCurrentScore(shouldAnimateChange) {
    return Api.getCurrentScore()
      .then(data => this.updateScores(data, shouldAnimateChange))
      .then(this.postpone(this.getCurrentScore))
      .catch(this.postpone(this.getCurrentScore))
  }

  getGameStatus() {
    return Api.getGameStatus()
      .then(status  => this.setState({status}))
      .then(this.postpone(this.getGameStatus))
      .catch(this.postpone(this.getGameStatus))

  }

  postpone(func) {
    return () => setTimeout(func.bind(this), 1000)
  }

  restartGame() {
    return Api.restartGame()
      .then(this.updateScores.bind(this))
  }

  updateScores(data, shouldAnimateChange = true) {
    const team1Goal = shouldAnimateChange && this.goalsForTeam(data, "1") > this.goalsForTeam(this.state.data, "1")
    const team2Goal = shouldAnimateChange && this.goalsForTeam(data, "2") > this.goalsForTeam(this.state.data, "2")
    this.setState({data, team1Goal, team2Goal})
  }

  goalsForTeam(data, team) {
    return data.filter(goal => goal.player === team).length
  }

  render() {
    const team1Goals = this.goalsForTeam(this.state.data, "1") 
    const team2Goals = this.goalsForTeam(this.state.data, "2")

    const status = this.state.status === true ? "Yhdistetty Goal Liveen": "Goal Live ei yhteydessä"

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

    return (
      <div className="App">
        <h2>Pöytäfutiksen tilanne</h2>
        <div className="container teams">
          <span>Suomi</span>
          <span>Ruotsi</span>
        </div>
        <div className="container score">
          <div className={team1Classes}>{team1Goals}</div>
          <div className="teambox">-</div>
          <div className={team2Classes}>{team2Goals}</div>
        </div>
        <div className={this.state.status ? "status on" : "status off"}>{status}</div>

        <h2 className="restart" onClick={this.restartGame.bind(this)}>Uusi peli</h2>
      </div>
    );
  }
}

export default App
