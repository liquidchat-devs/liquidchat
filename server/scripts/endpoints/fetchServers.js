module.exports = {
    handle(app) {
        app.get('/fetchServers', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }
            var session = app.sessions.get(req.cookies['sessionID']);
            var user = await app.db.db_fetch.fetchUser(app.db, session.userID);
            var servers = [];

            for(var i = 0; i < user.serverList.length; i++) {
                var server = await app.db.db_fetch.fetchServer(app.db, user.serverList[i]);
                servers.push(server);
            }

            res.send(JSON.stringify(servers));
        });
    }
}