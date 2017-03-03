import React, { Component } from 'react';
import './App.css';

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
        .then(data => this.setState({data}))
          .then(()=>setTimeout(this.callAPI.bind(this), 1000))
  }
  render() {

    const team1Goals = this.state.data.filter(goal => goal.player === "1").length % 10
    const team2Goals = this.state.data.filter(goal => goal.player === "2").length % 10

    return (
      <div className="App">
        <h2>Pöytäfutiksen tilanne</h2>
        <div className="container">
          <div className="country">Suomi</div>
          <div className="country">Ruotsi</div>
        </div>
        <div className="container">
          <div className="teambox team1">{team1Goals}</div>
          <div className="teambox">-</div>
          <div className="teambox team2">{team2Goals}</div>
        </div>
      </div>
    );
  }
}

export default App;
