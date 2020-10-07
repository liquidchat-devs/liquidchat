class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.get('/fetchFriendRequest', async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }
            const data = req.query;

            var friendRequest = await this.app.db.db_fetch.fetchFriendRequest(this.app.db, data.id);
            res.send(JSON.stringify(friendRequest));
        });
    }
}