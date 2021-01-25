class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/editNote', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.app.epFunc.editNote(req, res, req.body);
            console.log("> received note update - " + req.body.text);
        }).bind(this));
    }
}

module.exports = Endpoint;