module.exports = {
    handle(app) {
        app.get('/fetchChannelMessages', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }
            const data = req.query;

            var messages = await app.db.db_fetch.fetchMessages(app.db, data.id);
            res.send(JSON.stringify(messages));
        });
    }
}