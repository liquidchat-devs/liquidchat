class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.post('/logout', (async(req, res) => {
            res.clearCookie("sessionID");
            res.send(JSON.stringify({ status: 1 }))
        }).bind(this))
    }
}

module.exports = Endpoint;