class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/auth_discord', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
            var data = req.query;

            //https://discord.com/api/oauth2/authorize?client_id=803587850762453072&redirect_uri=https://nekonetwork.net:8080/auth_discord&response_type=code&scope=identify
            this.app.axios.post("https://discord.com/api/v6/oauth2/token",
            "client_id=" + this.app.config["auth_discord_id"] + "&client_secret=" + this.app.config["auth_discord_token"] + "&code=" + data.code + "&grant_type=authorization_code&redirect_uri=https://nekonetwork.net:8080/auth_discord&scope=identify",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            }).then(res1 => {
                if(res1.data["access_token"] !== undefined) {
                    this.app.axios.get("https://discord.com/api/v6/users/@me", {
                        headers: {
                            "Authorization": "Bearer " + res1.data["access_token"]
                        }
                    }).then(res2 => {
                        this.app.epFunc.editUser(req, res, { "discord_token": res1.data["access_token"], "discord_username": res2.data["username"] });
                    });
                } else {
                    res.sendStatus(401)
                }
            });
        }).bind(this));
    }
}

module.exports = Endpoint;