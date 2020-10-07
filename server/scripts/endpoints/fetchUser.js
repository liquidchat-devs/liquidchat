class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.get('/fetchUser', (async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }
            const data = req.query;
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, data.id, data.containSensitive && session.userID === data.id);

            if(user === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else {
                res.send(JSON.stringify(user))
            }
        }).bind(this));
    }
}

module.exports = Endpoint;