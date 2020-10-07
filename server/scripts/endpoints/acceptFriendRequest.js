class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.post('/acceptFriendRequest', (async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }

            await this.app.epFunc.processFriendRequest(req, res, req.body, true)
            console.log("> accepted friend request - " + req.body.id)
        }).bind(this));
    }
}

module.exports = Endpoint;