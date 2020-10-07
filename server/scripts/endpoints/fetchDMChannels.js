module.exports = {
    handle(app) {
        app.get('/fetchDMChannels', async(req, res) => {
            if(!this.isSessionValid(req, res)) { return; }
            var session = app.sessions.get(req.cookies['sessionID']);
            var user = await app.db.db_fetch.fetchUser(app.db, session.userID);

            var channels = [];
            user.dmChannelList.forEach(id => {
                channels.push(app.db.db_fetch.fetchChannel(app.db, id));
            })
            channels = await Promise.all(channels);
            channels = channels.filter(channel => { return channel !== undefined });
            res.send(JSON.stringify(channels));
        });
    }
}