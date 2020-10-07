module.exports = {
    handle(app) {
        app.post('/declineFriendRequest', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await app.epFunc.processFriendRequest(req, res, req.body, false)
            console.log("> declined friend request - " + req.body.id)
        });
    }
}