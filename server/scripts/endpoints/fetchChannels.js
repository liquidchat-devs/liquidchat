class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchChannels', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var server = await this.app.db.db_fetch.fetchServer(this.app.db, data.id);
            var channels = await this.app.db.db_fetch.fetchChannels(this.app.db, data.id);
            if(server === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else if(server.members.includes(user.id) === false) {
                res.send(JSON.stringify({ status: -2 }))
            } else {
                res.send(JSON.stringify(channels));
            }
        }).bind(this));
    }
}

module.exports = Endpoint;