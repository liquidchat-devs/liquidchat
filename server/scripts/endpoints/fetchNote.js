class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchNote', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var note = await this.app.db.db_fetch.fetchNote(this.app.db, data.id);

            if(note === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else {
                res.send(JSON.stringify(note))
            }
        }).bind(this));
    }
}

module.exports = Endpoint;