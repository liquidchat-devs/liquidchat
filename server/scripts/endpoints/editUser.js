class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/editUser', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }

            await this.app.epFunc.editUser(req, res, req.body);
            console.log("> received user update - " + req.body.email);
        }).bind(this));
    }
}

module.exports = Endpoint;