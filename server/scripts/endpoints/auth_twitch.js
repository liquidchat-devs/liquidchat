class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/auth_twitch', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            var session = this.app.sessions.get(req.cookies['sessionID']);
            var user = await this.app.db.db_fetch.fetchUser(this.app.db, session.userID);
            var data = req.query;

            //https://id.twitch.tv/oauth2/authorize?client_id=3oxkg8rjxqox7kkx4qu9b7d441mzse&redirect_uri=https://nekonetwork.net:8080/auth_twitch&response_type=code&scope=user:read:email
            this.app.axios.post("https://id.twitch.tv/oauth2/token",
            "client_id=" + this.app.config["auth_twitch_id"] + "&client_secret=" + this.app.config["auth_twitch_token"] + "&code=" + data.code + "&grant_type=authorization_code&redirect_uri=https://nekonetwork.net:8080/auth_twitch",{
                headers: { "Accept": "application/json" }
            }).then(res1 => {
                if(res1.data["access_token"] !== undefined) {
                    this.app.axios.get("https://api.twitch.tv/helix/users", {
                        headers: {
                            "Authorization": "Bearer " + res1.data["access_token"],
                            "Client-Id": this.app.config["auth_twitch_id"]
                        }
                    }).then(res2 => {
                        this.app.epFunc.editUser(req, res, { "twitch_token": res1.data["access_token"], "twitch_username": res2.data.data[0]["login"] });
                    });
                } else {
                    res.sendStatus(401)
                }
            });
        }).bind(this));
    }
}

module.exports = Endpoint;