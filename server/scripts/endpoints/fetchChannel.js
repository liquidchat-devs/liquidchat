class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchChannel', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, data.id);
            if(channel === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else {
                res.send(JSON.stringify(channel))
            }
        }).bind(this));
    }
}

module.exports = Endpoint;