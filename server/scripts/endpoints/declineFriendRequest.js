class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.post('/declineFriendRequest', async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }

            await this.app.epFunc.processFriendRequest(req, res, req.body, false)
            console.log("> declined friend request - " + req.body.id)
        });
    }
}

module.exports = Endpoint;