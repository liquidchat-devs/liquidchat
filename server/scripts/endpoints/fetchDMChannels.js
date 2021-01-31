class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchDMChannels', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var channels = [];
            for(var i = 0; i < user.dmChannels.length; i++) {
                var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, user.dmChannels[i]);
                channels.push(channel);
            }
            res.send(JSON.stringify(channels));
        }).bind(this));
    }
}

module.exports = Endpoint;