const BASE_URL = 'https://mw7qd5pah0.execute-api.us-east-1.amazonaws.com/dev'

class Api {

  getCurrentScore() {
    return this.fetchApi("/goal")
  }

  getGameStatus() {
    return this.fetchApi("/gameOn", "get", false).then(data => data === "true")
  }

  restartGame() {
    return this.fetchApi("/goal", "delete").then(this.getCurrentScore.bind(this))
  }

  fetchApi(path, method = "get", isJson = true) {
    return fetch(BASE_URL + path, {method})
      .then(res => {
        if(res.status !== 200) throw new Error("Fetch failed")
        else return res
      })
      .then(res => isJson ? res.json() : res.text())
  }
}

export default new Api()