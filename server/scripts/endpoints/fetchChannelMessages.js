class Endpoint {
    constructor(app) {
        this.app = this.app;
    }

    handle() {
        this.app.get('/fetchChannelMessages', async(req, res) => {
            if(!this.app.isSessionValid(req, res)) { return; }
            const data = req.query;

            var messages = await this.app.db.db_fetch.fetchMessages(this.app.db, data.id);
            res.send(JSON.stringify(messages));
        });
    }
}

module.exports = Endpoint;