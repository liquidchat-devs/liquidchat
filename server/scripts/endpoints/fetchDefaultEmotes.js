class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchDefaultEmotes', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var emotes = await this.app.db.db_fetch.fetchDefaultEmotes(this.app.db, data.id);

            if(emotes === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else {
                res.send(JSON.stringify(emotes))
            }
        }).bind(this));
    }
}

module.exports = Endpoint;