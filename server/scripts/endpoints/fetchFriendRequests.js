class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.get('/fetchFriendRequests', async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var friendRequestsOut = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 0);
            var friendRequestsIn = await this.app.db.db_fetch.fetchFriendRequests(this.app.db, user.id, 1);
            var friendRequests = friendRequestsOut.concat(friendRequestsIn);
            res.send(JSON.stringify(friendRequests));
        });
    }
}

module.exports = Endpoint;