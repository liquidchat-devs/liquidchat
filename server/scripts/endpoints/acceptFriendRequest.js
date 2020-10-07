module.exports = {
    handle(app) {
        app.post('/acceptFriendRequest', async(req, res) => {
            if(!app.isSessionValid(req, res)) { return; }

            await app.epFunc.processFriendRequest(req, res, req.body, true)
            console.log("> accepted friend request - " + req.body.id)
        });
    }
}