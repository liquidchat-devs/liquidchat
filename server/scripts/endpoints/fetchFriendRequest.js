module.exports = {
    handle(app) {
        app.get('/fetchFriendRequest', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }
            const data = req.query;

            var friendRequest = await app.db.db_fetch.fetchFriendRequest(app.db, data.id);
            res.send(JSON.stringify(friendRequest));
        });
    }
}