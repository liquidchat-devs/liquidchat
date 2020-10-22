<p align="center">
  <img src="https://github.com/jasscod/liquidchat/blob/master/liquidchat_githublogo.png?raw=true">
</p>

<p align="center">
Open-source chat application similar to Discord-
</p>

<p align="center" style="display :flex;">
<img src="https://travis-ci.org/LamkasDev/liquidchat.svg?branch=master"/>
<img src="https://david-dm.org/LamkasDev/liquidchat.svg"/>
<img src="http://hits.dwyl.com/LamkasDev/liquidchat.svg"/>
</p>

<p align="center">
💛 Official website: <a href="https://nekonetwork.net">https://nekonetwork.net</a>
<br/>
✔️ Releases: <a href="https://github.com/LamkasDev/liquidchat/releases  ">https://github.com/LamkasDev/liquidchat/releases</a>  
</p>

<p align="center">
📓 Documentation: <a href="https://nekonetwork.net/docs">https://nekonetwork.net/docs</a>
<br/>
🔥 API: <a href="https://github.com/LamkasDev/liquidchat.js">https://github.com/LamkasDev/liquidchat.js</a>  
<br/>
🔴 Found a bug or want to contribute?:
<a href="https://github.com/LamkasDev/liquidchat/pulls">[Open a pull request]</a>
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
