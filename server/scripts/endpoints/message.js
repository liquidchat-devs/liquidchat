class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/message', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.app.epFunc.sendMessage(req, res, req.body)
            console.log("> received message - " + req.body.text)
        }).bind(this));
    }
}

module.exports = Endpoint;