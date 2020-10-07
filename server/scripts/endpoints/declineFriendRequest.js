class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/declineFriendRequest', (async(req, res) => {
            if(!this.app.isSessionValid(app, req, res)) { return; }

            await this.app.epFunc.processFriendRequest(req, res, req.body, false)
            console.log("> declined friend request - " + req.body.id)
        }).bind(this));
    }
}

module.exports = Endpoint;