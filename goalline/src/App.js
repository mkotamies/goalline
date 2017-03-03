import React, { Component } from 'react';
import './App.css';
import classnames from 'classnames';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      data: []
    }
  }

  componentDidMount(){
    this.callAPI()
  }
  callAPI(){
    console.log("lol")
    return fetch("https://mw7qd5pah0.execute-api.us-east-1.amazonaws.com/dev/goal")
      .then(res => res.json())
        .then(data => {
          const team1Goal = this.goalsForTeam(data, "1") > this.goalsForTeam(this.state.data, "1")
          const team2Goal = this.goalsForTeam(data, "2") > this.goalsForTeam(this.state.data, "2")
          this.setState({data, team1Goal, team2Goal})
        })
          .then(()=>setTimeout(this.callAPI.bind(this), 1000))
  }

  goalsForTeam(data, team) {
    return data.filter(goal => goal.player === team).length
  }

  render() {
    const team1Goals = this.goalsForTeam(this.state.data, "1") 
    const team2Goals = this.goalsForTeam(this.state.data, "2")

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
        <div className="container">
          <div className="country">Suomi</div>
          <div className="country">Ruotsi</div>
        </div>
        <div className="container">
          <div className={team1Classes}>{team1Goals}</div>
          <div className="teambox">-</div>
          <div className={team2Classes}>{team2Goals}</div>
        </div>
      </div>
    );
  }
}

export default App;
