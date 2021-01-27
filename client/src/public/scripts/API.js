import axios from 'axios';
import io from "socket.io-client";
import { Device } from "mediasoup-client";

export default class API {
    constructor(_main) {
        this.mainClass = _main;
        this.socket = -1;
        this.wrtc = -1;
        this.pc = [];
        this.device = -1;
        this.consumerTransport = -1;
        this.producerTransport = -1;
        this.consumerParameters = -1;
        this.producerParameters = -1;

        this.queuedServers = [];
        this.queuedInvites = [];

        this.typingTimeoutIDs = -1;
    }

    async API_initWebsockets(userID) {
        //Setups the websocket client
        const socket = io(this.mainClass.state.APIEndpoint, {
            transports: ['websocket']
        });

        socket.on('connect', async() => {
            console.log("> socket.io connected!");
            let user = await this.API_fetchUser(userID, true);
            await this.API_fetchUsersForFriends(userID);
            await this.API_fetchEmotesForIDs(user.emotes);
            await this.API_fetchDefaultEmotes();
            await this.API_fetchNotes();
        });
        
        socket.on('message', (messageData) => {
            var message = JSON.parse(messageData);
            var channel = this.mainClass.state.channels.get(message.channel.id);
            channel.messages.push(message);

            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });
            if(document.hasFocus() === false && window.navigator.userAgent.includes("LiquidChat")) {
                window.setIcon(true);
            } else {
                let chat = document.getElementById('chat-container');
                if(chat !== null) { chat.scrollTop = chat.scrollHeight; }
            }

            this.API_fetchEmotesForMessages([ message ])
            this.API_fetchUsersForMessages([ message ])
        });
        socket.on('editMessage', (messageData) => {
            var message = JSON.parse(messageData);
            var channel = this.mainClass.state.channels.get(message.channel.id);

            var i = -1;
            channel.messages.forEach((m, _i) => {
                if(m.id === message.id) {
                    i = _i
                }
            });
            channel.messages[i] = message

            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });
        });
        socket.on('deleteMessage', (messageData) => {
            var message = JSON.parse(messageData);
            var channel = this.mainClass.state.channels.get(message.channel.id);

            var i = -1;
            channel.messages.forEach((m, _i) => {
                if(m.id === message.id) {
                    i = _i
                }
            });
            channel.messages.splice(i, 1)

            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            this.mainClass.setState({
                channels: newChannels
            });
        });

        socket.on('createServer', (serverData) => {
            var server = JSON.parse(serverData);
            var newServers = this.mainClass.state.servers.set(server.id, server);

            this.API_fetchChannelsForServer(server);
            this.API_fetchEmotesForIDs(server.emotes)
            if(server.members !== undefined) { this.API_fetchUsersForIDs(server.members); }
            this.mainClass.setState({
                servers: newServers
            });
        });
        socket.on('updateServer', (serverData) => {
            var _server = JSON.parse(serverData);

            var newServers = new Map(this.mainClass.state.servers)
            var server = newServers.get(_server.id);
            server.name = _server.name;
            server.avatar = _server.avatar;
            server.members = _server.members;
            server.channels = _server.channels;
            server.invites = _server.invites;
            server.emotes = _server.emotes;
            newServers.set(server.id, server);

            this.API_fetchEmotesForIDs(server.emotes)
            if(server.members !== undefined) { this.API_fetchUsersForIDs(server.members); }
            this.mainClass.setState({
                servers: newServers
            });
        });
        socket.on('deleteServer', (serverData) => {
            var server = JSON.parse(serverData);

            var newServers = new Map(this.mainClass.state.servers)
            newServers.delete(server.id);
            this.mainClass.setState({
                servers: newServers
            });
        });

        socket.on('createChannel', (channelData) => {
            var channel = JSON.parse(channelData);
            channel.messages = [];
            var newChannels = this.mainClass.state.channels.set(channel.id, channel);
            var currentIndicators = this.mainClass.state.typingIndicators;
            currentIndicators.set(channel.id, [])

            this.mainClass.setState({
                channels: newChannels,
                typingIndicators: currentIndicators
            });
        });
        socket.on('updateChannel', (channelData) => {
            var _channel = JSON.parse(channelData);

            var newChannels = new Map(this.mainClass.state.channels)
            var channel = newChannels.get(_channel.id);
            channel.name = _channel.name;
            channel.members = _channel.members;
            newChannels.set(channel.id, channel);
            
            this.mainClass.setState({
                channels: newChannels
            });
        });
        socket.on('deleteChannel', (channelData) => {
            var channel = JSON.parse(channelData);

            var newChannels = new Map(this.mainClass.state.channels)
            newChannels.delete(channel.id);
            this.mainClass.setState({
                channels: newChannels
            });
        });

        socket.on('uploadStart', (fileID, fileName) => {
            console.log("> upload start")
            this.mainClass.setState({
                uploadFileID: fileID,
                uploadFileName: fileName,
                uploadFailed: false
            });
        });
        socket.on('uploadProgress', (fileID, fileName, bytesReceived, bytesExpected) => {
            console.log("> upload progress")
            this.mainClass.setState({
                uploadReceived: bytesReceived,
                uploadExpected: bytesExpected
            });
        });
        socket.on('uploadFail', (fileID, fileName, fileSize) => {
            console.log("> upload fail")
            this.mainClass.setState({
                uploadFailed: true,
                uploadReceived: 0,
                uploadExpected: fileSize
            });
        });
        socket.on('uploadFinish', (fileID, fileName) => {
            console.log("> upload finish")
        });

        socket.on('updateUser', (userData) => {
            var user = JSON.parse(userData);
            if(this.mainClass.state.users.has(user.id)) {
                var newUsers = this.mainClass.state.users.set(user.id, user);
                if(this.mainClass.state.session.userID === user.id) { this.API_fetchEmotesForIDs(user.emotes); }

                this.mainClass.setState({
                    users: newUsers
                });
            }
        });
        socket.on('updateVoiceGroup', (voiceGroupData) => {
            var voiceGroup = JSON.parse(voiceGroupData);
            this.mainClass.setState({
                currentVoiceGroup: voiceGroup
            });
        });
        socket.on('newProducer', async(producerData) => {
            var producer = JSON.parse(producerData);
            var data = await this.API_consumeVoiceTransports(producer.channel.id, producer.id, this.device.rtpCapabilities);
            var a = await this.consumerTransport.consume({ id: data.id, producerId: data.producerID, kind: data.kind, rtpParameters: data.rtpParameters, codecOptions: data.codecOptions });
            const stream = new MediaStream();
            stream.addTrack(a.track);

            const audio = document.createElement("audio");
            audio.id = "remoteaudio-" + producer.id;
            audio.srcObject = stream;
        });
        socket.on('updateFriendRequests', (friendRequestsData) => {
            var friendRequests = JSON.parse(friendRequestsData);
            this.API_fetchUsersForFriendRequests(friendRequests);
            this.mainClass.setState({
                friendRequests: friendRequests
            });
        });

        socket.on('startTyping', async(typingData) => {
            var typing = JSON.parse(typingData);
            var newIndicators = this.mainClass.state.typingIndicators;
            newIndicators.get(typing.channel.id).push(typing.user.id);
            this.mainClass.setState({
                typingIndicators: newIndicators
            });
        });
        socket.on('endTyping', async(typingData) => {
            var typing = JSON.parse(typingData);
            var newIndicators = this.mainClass.state.typingIndicators;
            newIndicators.get(typing.channel.id).splice(newIndicators.get(typing.channel.id).indexOf(typing.user.id), 1);
            this.mainClass.setState({
                typingIndicators: newIndicators
            });
        });
        socket.on('editNote', (noteData) => {
            var note = JSON.parse(noteData);
            var newNotes = this.mainClass.state.notes.set(note.id, note);
            this.mainClass.setState({
                notes: newNotes
            });
        });

        //let stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: false });
        this.socket = socket;
        //this.localStream = stream;
        window.localStream = this.localStream;
    }
    
    //#region Fetching
    async API_fetchUser(id, containSensitive) {
        if(this.mainClass.state.users.has(id)) {
          return this.mainClass.state.users.get(id)
        } else {
          //Fetch user
          const reply = await axios.get(this.mainClass.state.APIEndpoint + '/fetchUser?id=' + id + (containSensitive === true ? "&containSensitive=true" : ""), { withCredentials: true });
          var user = reply.data
    
          //Cache user
          var newUsers = this.mainClass.state.users.set(user.id, user);
          this.mainClass.setState({
            users: newUsers
          });

          return user;
        }
    }

    async API_fetchServer(id) {
        if(this.mainClass.state.servers.has(id)) {
            return this.mainClass.state.servers.get(id)
        } else {
            //Fetch user
            const reply = await axios.get(this.mainClass.state.APIEndpoint + '/fetchServer?id=' + id, { withCredentials: true });
            var server = reply.data
      
            //Cache user
            var newServers = this.mainClass.state.servers.set(server.id, server);
            this.mainClass.setState({
                servers: newServers
            });
  
            return server;
        }
    }

    API_fetchServerSync(id) {
        if(this.mainClass.state.servers.has(id)) {
            return this.mainClass.state.servers.get(id)
        } else {
            if(this.queuedServers.includes(id)) {
                return -1;
            } else {
                this.API_fetchServer(id);
                return -1
            }
        }
    }

    async API_fetchFriendRequests() {
        const reply = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchFriendRequests', { withCredentials: true }));
        var friendRequests = reply.data;
        friendRequests = new Map(friendRequests.map(obj => [obj.id, obj]));

        this.API_fetchUsersForFriendRequests(friendRequests)
        this.mainClass.setState({
            friendRequests: friendRequests
        });
    }

    async API_fetchInvite(id) {
        if(this.mainClass.state.invites.has(id)) {
            return this.mainClass.state.invites.get(id)
        } else {
            //Fetch user
            const reply = await axios.get(this.mainClass.state.APIEndpoint + '/fetchInvite?id=' + id, { withCredentials: true });
            var invite = reply.data
      
            //Cache user
            var newInvites = this.mainClass.state.invites.set(invite.id, invite);
            this.API_fetchAllForInvites([ invite ])
            this.mainClass.setState({
                invites: newInvites
            });
  
            return invite;
        }
    }

    API_fetchInviteSync(id) {
        if(this.mainClass.state.invites.has(id)) {
            return this.mainClass.state.invites.get(id)
        } else {
            if(this.queuedInvites.includes(id)) {
                return -1;
            } else {
                this.API_fetchInvite(id);
                return -1
            }
        }
    }

    async API_fetchEmote(id) {
        if(this.mainClass.state.emotes.has(id)) {
          return this.mainClass.state.emotes.get(id)
        } else {
            //Fetch emote
            const reply = await axios.get(this.mainClass.state.APIEndpoint + '/fetchEmote?id=' + id, { withCredentials: true });
            var emote = reply.data
        
            //Cache emote
            if(emote.status === undefined) {
                var newEmotes = this.mainClass.state.emotes.set(emote.id, emote);
                this.mainClass.setState({
                    emotes: newEmotes
                });
            }

            return emote;
        }
    }

    async API_fetchDefaultEmotes() {
        //Fetch emotes
        const reply = await axios.get(this.mainClass.state.APIEndpoint + '/fetchDefaultEmotes', { withCredentials: true });
        var defaultEmotes = reply.data;
    
        //Cache emotes
        if(defaultEmotes.status === undefined) {
            defaultEmotes = new Map(defaultEmotes.map(obj => [obj.id, obj]))
            var newEmotes = new Map([...this.mainClass.state.emotes, ...defaultEmotes]);
            this.mainClass.setState({
                emotes: newEmotes
            });
        }

        return defaultEmotes;
    }

    async API_fetchNotes() {
        const reply = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchNotes', { withCredentials: true }));
        var notes = reply.data;
        notes = new Map(notes.map(obj => [obj.id, obj]));

        this.mainClass.setState({
            notes: notes
        });
    }
    //#endregion

    //#region Fetching Utils
    async API_fetchUsersForFriendRequests(friendRequests) {
        friendRequests.forEach(friendRequest => {
            var id = friendRequest.author.id === this.mainClass.state.session.userID ? friendRequest.target.id : friendRequest.author.id;
            this.API_fetchUser(id)
        })
    }

    async API_fetchUsersForFriends(userID) {
        var user = this.mainClass.getUser(userID);
        user.friends.forEach(friendID => {
            this.API_fetchUser(friendID);
        });
    }

    async API_fetchUsersForMessages(messages) {
        const queue = new Map();
        messages.forEach(message => {
          if(!queue.has(message.author.id)) {
            this.API_fetchUser(message.author.id)
            queue.set(message.author.id, 1)
          }
        })
    }

    async API_fetchUsersForIDs(obj) {
        const queue = new Map();
        obj.forEach(userID => {
            if(!queue.has(userID)) {
                this.API_fetchUser(userID);
                queue.set(userID, 1);
            }
        });
    }

    async API_fetchEmotesForIDs(obj) {
        const queue = new Map();
        obj.forEach(emoteID => {
            if(!queue.has(emoteID)) {
                this.API_fetchEmote(emoteID);
                queue.set(emoteID, 1);
            }
        });
    }

    async API_fetchEmotesForMessages(obj) {
        obj.forEach(message => {
            if(message.text !== undefined) {
                let i = 0;
                while(i < message.text.length) {
                    let currMessage = message.text.substring(i);
                    let a = currMessage.indexOf("<:")
                    let b = currMessage.indexOf(":>")
                    
                    if(a === -1 || b === -1) {
                        i = message.text.length;
                    } else {
                        let id = currMessage.substring(a + "<:".length, b)
                        if(id.length !== 32) {
                            i = message.text.length;
                            break;
                        }

                        this.API_fetchEmote(id);
                        i += b + 2;
                    }
                }
            }
        })
    }

    async API_fetchMentionsForMessages(obj) {
        obj.forEach(message => {
            if(message.text !== undefined) {
                let i = 0;
                while(i < message.text.length) {
                    let currMessage = message.text.substring(i);
                    let a = currMessage.indexOf("<@")
                    let b = currMessage.indexOf(">")
                    
                    if(a === -1 || b === -1) {
                        i = message.text.length;
                    } else {
                        let id = currMessage.substring(a + "<@".length, b)
                        if(id.length !== 32) {
                            i = message.text.length;
                            break;
                        }

                        this.API_fetchUser(id);
                        i += b + 1;
                    }
                }
            }
        })
    }

    async API_fetchAllForInvites(invites) {
        const queue = new Map();
        invites.forEach(invite => {
          if(!queue.has(invite.server.id)) {
            this.API_fetchServer(invite.server.id)
            queue.set(invite.server.id, 1)
          }

          if(!queue.has(invite.author.id)) {
            this.API_fetchUser(invite.author.id)
            queue.set(invite.author.id, 1)
          }
        })
    }
    //#endregion

    //#region User Actions
    async API_updateAvatar(file) {
        var data = new FormData();
        data.append("fileUploaded", file)

        const reply = await axios({
            method: 'post',
            url: this.mainClass.state.APIEndpoint + '/updateAvatar?fileName=' + file.name,
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            data: data,
            withCredentials: true
        });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_editUser(email) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editUser', {
            email: email
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_updateStatus(type) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editUser', {
            status: type
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_updateCustomStatus(status) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editUser', {
            customStatus: status
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_sendFriendRequest(userID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/sendFriendRequest', {
            target: {
                id: userID
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_removeFriend(userID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/removeFriend', {
            target: {
                id: userID
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_sendFriendRequestByUsername(username) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/sendFriendRequest', {
            target: {
                username: username
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_acceptFriendRequest(id) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/acceptFriendRequest', {
            id: id
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_declineFriendRequest(id) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/declineFriendRequest', {
            id: id
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_createEmote(file, emoteName) {
        var data = new FormData();
        data.append("fileUploaded", file)

        const reply = await axios({
            method: 'post',
            url: this.mainClass.state.APIEndpoint + '/createEmote?fileName=' + file.name + '&emoteName=' + emoteName + '&type=1',
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            data: data,
            withCredentials: true
        });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }
    //#endregion

    //#region Authorization
    async API_login(_username, _password, _type) {
        this.mainClass.setState({
          waitingForSession: true
        })
    
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/login', {
          authType: _type,
          username: _username,
          password: _password
        }, { withCredentials: true });
    
        if(reply.data.status !== undefined) {
          return reply.data.status;
        } else {
          this.mainClass.setState({
            session: reply.data
          })
    
          setTimeout(() => {
            this.mainClass.setState({
              waitingForSession: false
            })
          }, 3000)

          this.API_initWebsockets(reply.data.userID);
          return reply.data;
        }
    }

    async API_register(_username, _password, _password2) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/register', {
            username: _username,
            password: _password,
            password2: _password2
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            this.mainClass.setState({
                session: reply.data
            });

            setTimeout(() => {
                this.mainClass.setState({
                  waitingForSession: false
                })
            }, 3000)

            this.API_initWebsockets(reply.data.userID);
            return reply.data;
        }
    }

    async API_logout() {
        await axios.post(this.mainClass.state.APIEndpoint + '/logout', {}, { withCredentials: true });
        window.location.reload(false);
        return true;
    }
    //#endregion

    //#region Messages
    async API_getSuitableDMChannel(userID) {
        var suitableChannels = Array.from(this.mainClass.state.channels.values()).filter(channel => { return channel.members !== undefined && channel.members.length === 2 && channel.members.includes(this.mainClass.state.session.userID) && channel.members.includes(userID); });
        var channel = -1;
        if(suitableChannels.length < 1) {
            channel = await this.API_createChannelDM("autogenerated DM", [ this.mainClass.state.session.userID, userID ])
            if(isNaN(channel) === false) {
                return undefined;
            } else {
                suitableChannels = [ channel ]
            }
        }

        return suitableChannels[0];
    }

    async API_sendWebsocketMessage(channelID, text) {
        return new Promise((res, rej) => {
            this.socket.emit('message', {
                text: text,
                channel: {
                    id: channelID
                }
            }, (string) => {
                res(JSON.parse(string))
            })
        });
    }

    async API_sendMessage(channelID, text) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/message', {
            text: text,
            channel: {
                id: channelID
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_sendDM(userID, text) {
        var channel = await this.API_getSuitableDMChannel(userID)
        if(channel === undefined) { return false; }

        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/message', {
            text: text,
            channel: {
                id: channel.id
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_sendFile(file, text) {
        var data = new FormData();
        data.append("fileUploaded", file)
        data.append("text", text)
        data.append("channel.id", this.mainClass.state.currentChannel)

        const reply = await axios({
            method: 'post',
            url: this.mainClass.state.APIEndpoint + '/upload?fileName=' + file.name,
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            data: data,
            withCredentials: true
        });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_editMessage(originalMessageID, newText) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editMessage', {
            id: originalMessageID,
            text: newText
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_deleteMessage(messageID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/deleteMessage', {
            id: messageID
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_joinVoiceChannel(channelID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/joinVoiceChannel', {
            channel: {
                id: channelID
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            var voiceGroup = reply.data;
            this.device = new Device();
            await this.device.load({ routerRtpCapabilities: voiceGroup.rtpCapabilities })
            await this.API_createVoiceTransports(channelID);
            return voiceGroup;
        }
    }

    async API_createVoiceTransports(channelID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/createVoiceTransports', {
            channel: { id: channelID }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            const transportData = reply.data;
            transportData.consumerData.iceServers = [ { urls: "turn:nekonetwork.net:3478", username: "username1", credential: "password1" }, {"urls": "stun:stun.l.google.com:19302"} ]
            transportData.producerData.iceServers = [ { urls: "turn:nekonetwork.net:3478", username: "username1", credential: "password1" }, {"urls": "stun:stun.l.google.com:19302"} ]

            const consumerTransport = this.device.createRecvTransport(transportData.consumerData);
            const producerTransport = this.device.createSendTransport(transportData.producerData);
            consumerTransport.on('connect', async({ dtlsParameters }, callback, errback) => {
                this.consumerParameters = dtlsParameters;
                if(this.consumerParameters !== -1 && this.producerParameters !== -1) {
                    await this.API_connectVoiceTransports(channelID, this.consumerParameters, this.producerParameters);
                }
                callback();
            });
            producerTransport.on('connect', async({ dtlsParameters }, callback, errback) => {
                this.producerParameters = dtlsParameters;
                if(this.consumerParameters !== -1 && this.producerParameters !== -1) {
                    await this.API_connectVoiceTransports(channelID, this.consumerParameters, this.producerParameters);
                }
                callback();
            });
            producerTransport.on('produce', async({ kind, rtpParameters }, callback, errback) => {
                const data = await this.API_produceVoiceTransports(channelID, kind, rtpParameters);
                callback(data.id);
            });
            consumerTransport.on('connectionstatechange', (state) => {
                console.log("con: " + state);
            });
            producerTransport.on('connectionstatechange', (state) => {
                console.log("prod: " + state);
            });

            this.consumerTransport = consumerTransport;
            this.producerTransport = producerTransport;
            const track = this.localStream.getAudioTracks()[0];
            var a = await this.producerTransport.produce({ track: track });

            window.transports = [];
            window.transports.push(consumerTransport);
            window.transports.push(producerTransport);
            console.log(this.device);
            console.log(consumerTransport);
            console.log(producerTransport);

            return { consumerTransport, producerTransport };
        }
    }

    async API_connectVoiceTransports(channelID, consumerDTLS, producerDTLS) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/connectVoiceTransports', {
            channel: { id: channelID },
            consumerDTLS: consumerDTLS,
            producerDTLS: producerDTLS
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_produceVoiceTransports(channelID, kind, rtpParameters) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/produceVoiceTransports', {
            channel: { id: channelID },
            kind: kind,
            rtpParameters : rtpParameters 
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_consumeVoiceTransports(channelID, id, rtpCapabilities) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/consumeVoiceTransports', {
            channel: { id: channelID },
            producerID: id,
            rtpCapabilities : rtpCapabilities 
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_leaveVoiceChannel(channel) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/leaveVoiceChannel', {
            channel: {
                id: channel.id
            }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            this.mainClass.setState({ currentVoiceGroup: -1 });
            return 1;
        }
    }
    //#endregion

    //#region Servers
    async API_createServer(serverName) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/createServer', {
            name: serverName
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_updateServerAvatar(serverID, file) {
        var data = new FormData();
        data.append("fileUploaded", file)

        const reply = await axios({
            method: 'post',
            url: this.mainClass.state.APIEndpoint + '/updateServerAvatar?serverID=' + serverID + '&fileName=' + file.name,
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            data: data,
            withCredentials: true
        });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_editServer(serverID, serverName) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editServer', {
            id: serverID, name: serverName
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_deleteServer(serverID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/deleteServer', {
            id: serverID
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_leaveServer(serverID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/leaveServer', {
            id: serverID
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_joinServer(serverID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/joinServer', {
            id: serverID
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_kickFromServer(serverID, userID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/kickFromServer', {
            server: { id: serverID }, user: { id: userID }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_createServerEmote(file, emoteName, serverID) {
        var data = new FormData();
        data.append("fileUploaded", file)

        const reply = await axios({
            method: 'post',
            url: this.mainClass.state.APIEndpoint + '/createEmote?fileName=' + file.name + '&emoteName=' + emoteName + '&type=0&serverID=' + serverID,
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            data: data,
            withCredentials: true
        });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }
    //#endregion

    //#region Channels
    async API_createChannel(channel) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/createChannel', {
            server: channel.server,
            name: channel.name,
            type: channel.type,
            description: channel.description.length > 0 ? channel.description : undefined,
            nsfw: channel.nsfw
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_createChannelDM(channelName, channelMembers) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/createChannel', {
            name: channelName,
            type: 2,
            members: channelMembers
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_removeFromDMChannel(channelID, userID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/removeFromDMChannel', {
            channel: { id: channelID }, user: { id: userID }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_addToDMChannel(channelID, userID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/addToDMChannel', {
            channel: { id: channelID }, user: { id: userID }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_editChannel(channel) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editChannel', {
            id: channel.id,
            name: channel.name,
            description: channel.description !== undefined && channel.description.length > 0 ? channel.description : undefined,
            nsfw: channel.nsfw,
            position: channel.position
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }

    async API_deleteChannel(channelID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/deleteChannel', {
            id: channelID
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return 1;
        }
    }

    async API_fetchDMChannels() {
        const reply = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchDMChannels', { withCredentials: true }));
        var newChannels = reply.data;
        newChannels = new Map(newChannels.map(obj => [obj.id, obj]));

        newChannels.forEach(async(channel) => {
            const reply2 = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchChannelMessages?id=' + channel.id, { withCredentials: true }));
            var messages = reply2.data;
            channel.messages = messages;

            var currentChannels = this.mainClass.state.channels;
            currentChannels.set(channel.id, channel);
            var currentIndicators = this.mainClass.state.typingIndicators;
            currentIndicators.set(channel.id, [])

            if(channel.members !== undefined) { this.API_fetchUsersForIDs(channel.members); }
            this.API_fetchEmotesForMessages(messages)
            this.API_fetchUsersForMessages(messages)
            this.mainClass.setState({
                channels: currentChannels,
                typingIndicators: currentIndicators
            }, () => { console.log("set dm channels"); });
        });
    }

    async API_fetchServers() {
        const reply0 = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchServers', { withCredentials: true }));
        var newServers = reply0.data;
        newServers = new Map(newServers.map(obj => [obj.id, obj]));
        newServers.forEach(async(server) => {
            this.API_fetchChannelsForServer(server);

            this.API_fetchEmotesForIDs(server.emotes)
            if(server.members !== undefined) { this.API_fetchUsersForIDs(server.members); }
            this.mainClass.setState({
                servers: newServers
            });
        });
    }

    async API_fetchChannelsForServer(server) {
        const reply = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchChannels?id=' + server.id, { withCredentials: true }));
        var newChannels = reply.data;
        newChannels = new Map(newChannels.map(obj => [obj.id, obj]));

        newChannels.forEach(async(channel) => {
            const reply2 = (await axios.get(this.mainClass.state.APIEndpoint + '/fetchChannelMessages?id=' + channel.id, { withCredentials: true }));
            var messages = reply2.data;
            channel.messages = messages;

            var currentChannels = this.mainClass.state.channels;
            currentChannels.set(channel.id, channel)
            var currentIndicators = this.mainClass.state.typingIndicators;
            currentIndicators.set(channel.id, [])

            this.API_fetchEmotesForMessages(messages)
            this.API_fetchUsersForMessages(messages)
            this.API_fetchMentionsForMessages(messages)
            this.mainClass.setState({
                channels: currentChannels,
                typingIndicators: currentIndicators
            }, () => { console.log("set server channels"); });
        });
    }
    //#endregion

    //#region Invites
    async API_createInvite(serverID) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/createInvite', {
            server: { id: serverID }
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }
    //#endregion

    //#region Typing
    async API_typingIndicator(channelID) {
        if(this.typingTimeoutID === -1) {
            this.socket.emit('startTyping', { channel: { id: channelID } })
        } else {
            clearTimeout(this.typingTimeoutID);
        }

        this.typingTimeoutID = setTimeout(() => {
            this.typingTimeoutID = -1;
            this.socket.emit('endTyping', { channel: { id: channelID } })
        }, 2000);
    }
    //#endregion

    //#region Notes
    async API_editNote(targetID, text) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/editNote', {
            author: { id: this.mainClass.state.session.userID }, target: { id: targetID }, text: text
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    }
    //#endregion

    //#region Connections
    async API_removeConnection(type) {
        const reply = await axios.post(this.mainClass.state.APIEndpoint + '/removeConnection', {
            type: type
        }, { withCredentials: true });

        if(reply.data.status !== undefined) {
            return reply.data.status;
        } else {
            return reply.data;
        }
    } 
    //#endregion
}

export { API }