class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchChannelMessages', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var channel = await this.app.db.db_fetch.fetchChannel(this.app.db, data.id);
            var messages = await this.app.db.db_fetch.fetchMessages(this.app.db, data.id);
            if(channel === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else if(channel.type === 2) {
                if(channel.members.includes(user.id) === false) {
                    res.send(JSON.stringify({ status: -2 }))
                } else {
                    res.send(JSON.stringify(messages));
                }
            } else {
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, channel.server.id);
                if(server.members.includes(user.id) === false) {
                    res.send(JSON.stringify({ status: -2 }))
                } else {
                    res.send(JSON.stringify(messages));
                }
            }
        }).bind(this));
    }
}

module.exports = Endpoint;