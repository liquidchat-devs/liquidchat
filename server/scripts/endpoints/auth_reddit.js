class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/auth_reddit', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
            var data = req.query;

            //https://www.reddit.com/api/v1/authorize?client_id=g8QfIB742iwMKw&response_type=code&state=a&redirect_uri=https://nekonetwork.net:8080/auth_reddit&duration=permanent&scope=identity
            this.app.axios.post("https://www.reddit.com/api/v1/access_token",
            "grant_type=authorization_code&code=" + data.code + "&redirect_uri=https://nekonetwork.net:8080/auth_reddit", {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + Buffer.from(this.app.config["auth_reddit_id"] + ":" + this.app.config["auth_reddit_token"]).toString("base64"),
                }
            }).then(res1 => {
                if(res1.data["access_token"] !== undefined) {
                    this.app.axios.get("https://oauth.reddit.com/api/v1/me", {
                        headers: { "Authorization": "bearer " + res1.data["access_token"] }
                    }).then(res2 => {
                        this.app.epFunc.editUser(req, res, { "reddit_token": res1.data["access_token"], "reddit_username": res2.data.name });
                    });
                } else {
                    res.sendStatus(401)
                }
            });
        }).bind(this));
    }
}

module.exports = Endpoint;