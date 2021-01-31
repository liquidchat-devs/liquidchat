class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchServers', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);

            var servers = [];
            for(var i = 0; i < user.servers.length; i++) {
                var server = await this.app.db.db_fetch.fetchServer(this.app.db, user.servers[i]);
                servers.push(server);
            }
            res.send(JSON.stringify(servers));
        }).bind(this));
    }
}

module.exports = Endpoint;