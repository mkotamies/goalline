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

  tweet(message) {
    return this.fetchApi("/gameOver", "post", true, {message})
  }

  fetchApi(path, method = "get", isResponseJson = true, request) {

    const body = request ? JSON.stringify(request) : null

    return fetch(BASE_URL + path, {method, body, headers: this._jsonHeaders()})
      .then(this._handleResponse(isResponseJson))
  }

  _handleResponse(isResponseJson) {
    return res => {
      if (res.status !== 200) throw new Error("Fetch failed")
      else return isResponseJson ? res.json() : res.text()
    }
  }

  _jsonHeaders() {
    return {
      'Content-Type': 'application/json'
    }
  }
}

export default new Api()