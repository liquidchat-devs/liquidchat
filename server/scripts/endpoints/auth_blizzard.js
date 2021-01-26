class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/auth_blizzard', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
            var data = req.query;

            //https://us.battle.net/oauth/authorize?client_id=24428d45ed4b42448c9a33f1161585c5&redirect_uri=https://nekonetwork:8080/auth_blizzard&response_type=code&scope=openid
            this.app.axios.post("https://us.battle.net/oauth/token",
            "code=" + data.code + "&grant_type=authorization_code&redirect_uri=https://nekonetwork:8080/auth_blizzard&scope=openid",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + Buffer.from(this.app.config["auth_blizzard_id"] + ":" + this.app.config["auth_blizzard_token"]).toString("base64"),
                }
            }).then(res1 => {
                if(res1.data["access_token"] !== undefined) {
                    this.app.axios.get("https://us.battle.net/oauth/userinfo", {
                        headers: {
                            "Authorization": "Bearer " + res1.data["access_token"]
                        }
                    }).then(res2 => {
                        this.app.epFunc.editUser(req, res, { "blizzard_token": res1.data["access_token"], "blizzard_username": res2.data["battletag"] });
                    });
                } else {
                    res.sendStatus(401)
                }
            });
        }).bind(this));
    }
}

module.exports = Endpoint;