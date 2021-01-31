class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchFriendRequest', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var friendRequest = await this.app.db.db_fetch.fetchFriendRequest(this.app.db, data.id);
            if(friendRequest === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else if(friendRequest.author.id !== user.id && friendRequest.target.id !== user.id) {
                res.send(JSON.stringify({ status: -2 }))
            } else {
                res.send(JSON.stringify(friendRequest));
            }
        }).bind(this));
    }
}

module.exports = Endpoint;