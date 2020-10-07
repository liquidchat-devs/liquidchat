class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchDMChannels', (async(req, res) => {
            if(!this.app.isSessionValid(app, req, res)) { return; }
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var channels = [];
            user.dmChannelList.forEach(id => {
                channels.push(this.app.db.db_fetch.fetchChannel(this.app.db, id));
            })
            channels = await Promise.all(channels);
            channels = channels.filter(channel => { return channel !== undefined });
            res.send(JSON.stringify(channels));
        }).bind(this));
    }
}

module.exports = Endpoint;