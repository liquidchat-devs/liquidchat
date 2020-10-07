module.exports = {
    handle(app) {
        app.get('/fetchUser', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }
            const data = req.query;
            var session = app.sessions.get(req.cookies['sessionID']);
            var user = await app.db.db_fetch.fetchUser(app.db, data.id, data.containSensitive && session.userID === data.id);

            if(user === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else {
                res.send(JSON.stringify(user))
            }
        });
    }
}