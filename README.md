<p align="center">
  <img src="https://github.com/jasscod/liquidchat/blob/master/liquidchat_githublogo.png?raw=true">
</p>

<p align="center">
Open-source chat application similar to Discord-
</p>

![Build](https://travis-ci.org/LamkasDev/liquidchat.svg?branch=master)
![Dependencies](https://david-dm.org/LamkasDev/liquidchat.svg)
[![HitCount](http://hits.dwyl.com/LamkasDev/liquidchat.svg)](http://hits.dwyl.com/LamkasDev/liquidchat)

<p align="center">
💛 Official website: https://nekonetwork.net (need to get a domain, but you know i'm broke)™️  
✔️ Releases: https://github.com/LamkasDev/liquidchat/releases  
</p>

<p align="center">
📓 Documentation: https://nekonetwork.net/docs  
🔥 API: https://github.com/LamkasDev/liquidchat.js  
🔴 Found a bug or want to contribute?: [Open a pull request!](https://github.com/LamkasDev/liquidchat/pulls)
</p>


🏁 **Features:**
- [x] Servers with Text Channels
- [x] DM Channels 
- [x] Group Chats
- [x] File Support (up to 100MB by default)
- [x] Personal Emotes (max. 500) 
- [x] Server Emotes (max. 400)
- [x] Idle/DND/Invisible Status 
- [x] Friend Features (Adding/Removing friends)  
- [ ] Better Server Management (Built-in bans, mutes, assigning server moderators) 
- [ ] Server Discovery
- [ ] Voice Channels
- [ ] Custom Statuses 
- [ ]  a lot more...


### Build instructions:
##### a) How to build client (Windows)
> run `npm run createproduction-win`  
> the installer will be built into `client/dist`  

##### b) How to build web version (Windows)
> run `npm run build`  
> all website's assets will be packed into `client/build`

##### c) How to test client (Windows)
> run `yarn start`  

##### d) How to host server yourself
> run `node server.js`  
> run `http-server -p 8081` in a separate directory outside `/server`

##### e) Additional setup
> change `APIEndpoint` in `App.js` to your server's adress:8080  
> change `fileEnpoint` in `App.js` to your server's adress:8081  
> change `filesStorage` in `server.js` to directory where you run your file server  

### Example Screenshots:  
> Client (2020/10/11)
![example1](https://qtlamkas.why-am-i-he.re/4h4YAh.png)

> Documentation (2020/10/11)
![example2](https://qtlamkas.why-am-i-he.re/3LsFwA.png)
