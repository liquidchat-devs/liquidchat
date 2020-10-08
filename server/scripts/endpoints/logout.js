class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/logout', (async(req, res) => {
            res.clearCookie("sessionID");
            res.sendStatus(200);
        }).bind(this))
    }
}

module.exports = Endpoint;