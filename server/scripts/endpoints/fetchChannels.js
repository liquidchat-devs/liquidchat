module.exports = {
    handle(app) {
        app.get('/fetchChannels', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }
            const data = req.query;

            var channels = await app.db.db_fetch.fetchChannels(app.db, data.id);
            res.send(JSON.stringify(channels));
        });
    }
}