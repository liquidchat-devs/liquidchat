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

        this.queues = {
            servers: [],
            users: [],
            emotes: [],
            invites: []
        };

        this.endpoints = {};
        this.endpoints["removeFromDMChannel"] = this.createAPIEndpoint("/removeFromDMChannel", "POST", true);
        this.endpoints["addToDMChannel"] = this.createAPIEndpoint("/addToDMChannel", "POST", true);
        this.endpoints["editChannel"] = this.createAPIEndpoint("/editChannel", "POST", true);
        this.endpoints["deleteChannel"] = this.createAPIEndpoint("/deleteChannel", "POST", true);
        this.endpoints["cloneChannel"] = this.createAPIEndpoint("/cloneChannel", "POST", false);
        this.endpoints["editServer"] = this.createAPIEndpoint("/editServer", "POST", true);
        this.endpoints["deleteServer"] = this.createAPIEndpoint("/deleteServer", "POST", false);
        this.endpoints["leaveServer"] = this.createAPIEndpoint("/leaveServer", "POST", true);
        this.endpoints["joinServer"] = this.createAPIEndpoint("/joinServer", "POST", true);
        this.endpoints["kickFromServer"] = this.createAPIEndpoint("/kickFromServer", "POST", false);
        this.endpoints["createChannel"] = this.createAPIEndpoint("/createChannel", "POST", true);
        this.endpoints["createChannelDM"] = this.createAPIEndpoint("/createChannel", "POST", true);
        this.endpoints["updateStatus"] = this.createAPIEndpoint("/updateStatus", "POST", true);
        this.endpoints["updateCustomStatus"] = this.createAPIEndpoint("/updateCustomStatus", "POST", true);
        this.endpoints["sendFriendRequest"] = this.createAPIEndpoint("/sendFriendRequest", "POST", true);
        this.endpoints["sendFriendRequestByUsername"] = this.createAPIEndpoint("/sendFriendRequest", "POST", true);
        this.endpoints["removeFriend"] = this.createAPIEndpoint("/removeFriend", "POST", false);
        this.endpoints["acceptFriendRequest"] = this.createAPIEndpoint("/acceptFriendRequest", "POST", false);
        this.endpoints["declineFriendRequest"] = this.createAPIEndpoint("/declineFriendRequest", "POST", false);
        this.endpoints["editMessage"] = this.createAPIEndpoint("/editMessage", "POST", true);
        this.endpoints["deleteMessage"] = this.createAPIEndpoint("/deleteMessage", "POST", false);
        this.endpoints["createInvite"] = this.createAPIEndpoint("/createInvite", "POST", true);
        this.endpoints["createServer"] = this.createAPIEndpoint("/createServer", "POST", true);
        this.endpoints["editNote"] = this.createAPIEndpoint("/editNote", "POST", true);
        this.endpoints["removeConnection"] = this.createAPIEndpoint("/removeConnection", "POST", true);
        this.endpoints["editUser"] = this.createAPIEndpoint("/editUser", "POST", true);
        this.endpoints["searchMessages"] = this.createAPIEndpoint("/fetchChannelMessages", "POST", true);
        this.endpoints["deleteEmote"] = this.createAPIEndpoint("/deleteEmote", "POST", false);
        this.endpoints["sendMessage"] = this.createAPIEndpoint("/message", "POST", true);
        this.endpoints["produceVoiceTransports"] = this.createAPIEndpoint("/produceVoiceTransports", "POST", true);
        this.endpoints["consumeVoiceTransports"] = this.createAPIEndpoint("/consumeVoiceTransports", "POST", true);
        this.endpoints["leaveVoiceChannel"] = this.createAPIEndpoint("/leaveVoiceChannel", "POST", false);
        this.endpoints["connectVoiceTransports"] = this.createAPIEndpoint("/connectVoiceTransports", "POST", true);
        this.endpoints["joinVoiceChannel"] = this.createAPIEndpoint("/joinVoiceChannel", "POST", true, async(voiceGroup, data) => {
            this.device = new Device();
            await this.device.load({ routerRtpCapabilities: voiceGroup.rtpCapabilities })
            await this.endpoints["createVoiceTransports"]({ channel: { id: data.channel.id }});
        });
        this.endpoints["createVoiceTransports"] = this.createAPIEndpoint("/createVoiceTransports", "POST", true, async(transportData, requestData) => {
            transportData.consumerData.iceServers = [ { urls: "turn:nekonetwork.net:3478", username: "username1", credential: "password1" }, {"urls": "stun:stun.l.google.com:19302"} ]
            transportData.producerData.iceServers = [ { urls: "turn:nekonetwork.net:3478", username: "username1", credential: "password1" }, {"urls": "stun:stun.l.google.com:19302"} ]

            const consumerTransport = this.device.createRecvTransport(transportData.consumerData);
            const producerTransport = this.device.createSendTransport(transportData.producerData);
            consumerTransport.on('connect', async({ dtlsParameters }, callback, errback) => {
                this.consumerParameters = dtlsParameters;
                if(this.consumerParameters !== -1 && this.producerParameters !== -1) {
                    await this.endpoints["connectVoiceTransports"]({ channel: { id: requestData.channel.id }, consumerDTLS: this.consumerParameters, producerDTLS: this.producerParameters });
                }
                callback();
            });
            producerTransport.on('connect', async({ dtlsParameters }, callback, errback) => {
                this.producerParameters = dtlsParameters;
                if(this.consumerParameters !== -1 && this.producerParameters !== -1) {
                    await this.endpoints["connectVoiceTransports"]({ channel: { id: requestData.channel.id }, consumerDTLS: this.consumerParameters, producerDTLS: this.producerParameters });
                }
                callback();
            });
            producerTransport.on('produce', async({ kind, rtpParameters }, callback, errback) => {
                const data = await this.endpoints["produceVoiceTransports"]({ channel: { id: requestData.channel.id }, kind: kind, rtpParameters: rtpParameters });
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
        });

        this.endpoints["updateServerAvatar"] = this.createAPIFileEndpoint("/updateServerAvatar", "POST", false);
        this.endpoints["updateServerBanner"] = this.createAPIFileEndpoint("/updateServerBanner", "POST", false);
        this.endpoints["updateAvatar"] = this.createAPIFileEndpoint("/updateAvatar", "POST", false);
        this.endpoints["createEmote"] = this.createAPIFileEndpoint("/createEmote", "POST", true);
        this.endpoints["createServerEmote"] = this.createAPIFileEndpoint("/createServerEmote", "POST", true);
        this.endpoints["sendFile"] = this.createAPIFileEndpoint("/upload", "POST", true);

        this.endpoints["fetchServer"] = this.createFetchEndpoint("/fetchServer", "servers");
        this.endpoints["fetchUser"] = this.createFetchEndpoint("/fetchUser", "users");
        this.endpoints["fetchEmote"] = this.createFetchEndpoint("/fetchEmote", "emotes");
        this.endpoints["fetchInvite"] = this.createFetchEndpoint("/fetchInvite", "invites", (invite) => {
            this.endpoints["fetchServer"](invite.server.id)
            this.endpoints["fetchUser"](invite.author.id)
        });

        this.endpoints["fetchFriendRequests"] = this.createFetchMultipleEndpoint("/fetchFriendRequests", "friendRequests", (friendRequests) => { this.endpoints["fetchUsersForFriendRequests"](friendRequests); });
        this.endpoints["fetchDefaultEmotes"] = this.createFetchMultipleEndpoint("/fetchDefaultEmotes", "emotes");
        this.endpoints["fetchNotes"] = this.createFetchMultipleEndpoint("/fetchNotes", "notes");
        this.endpoints["fetchServers"] = this.createFetchMultipleEndpoint("/fetchServers", "servers", (servers) => {
            servers.forEach(server => {
                this.endpoints["fetchServerChannels"]({ id: server.id });
                this.endpoints["fetchEmotesForIDs"](server.emotes);
                if(server.members !== undefined) { this.endpoints["fetchUsersForIDs"](server.members); }
            });
        });
        this.endpoints["fetchDMChannels"] = this.createFetchMultipleEndpoint("/fetchDMChannels", "channels", (channels) => {
            channels.forEach(async(channel) => {
                const messages = await this.endpoints["fetchChannelMessages"]({ id: channel.id });
                channel.messages = messages;
    
                var currentChannels = this.mainClass.state.channels;
                currentChannels.set(channel.id, channel);
                var currentIndicators = this.mainClass.state.typingIndicators;
                currentIndicators.set(channel.id, [])
    
                if(channel.members !== undefined) { this.endpoints["fetchUsersForIDs"](channel.members); }
                this.endpoints["fetchEmotesForMessages"](messages)
                this.endpoints["fetchUsersForMessages"](messages)
                this.endpoints["fetchMentionsForMessages"](messages)
                this.mainClass.setState({
                    channels: currentChannels,
                    typingIndicators: currentIndicators
                }, () => { console.log("set dm channels"); });
            });
        });
        this.endpoints["fetchServerChannels"] = this.createFetchMultipleEndpoint("/fetchChannels", "channels", (channels) => {
            channels.forEach(async(channel) => {
                const messages = await this.endpoints["fetchChannelMessages"]({ id: channel.id });
                channel.messages = messages;
    
                var currentChannels = this.mainClass.state.channels;
                currentChannels.set(channel.id, channel);
                var currentIndicators = this.mainClass.state.typingIndicators;
                currentIndicators.set(channel.id, [])
    
                if(channel.members !== undefined) { this.endpoints["fetchUsersForIDs"](channel.members); }
                this.endpoints["fetchEmotesForMessages"](messages)
                this.endpoints["fetchUsersForMessages"](messages)
                this.endpoints["fetchMentionsForMessages"](messages)
                this.mainClass.setState({
                    channels: currentChannels,
                    typingIndicators: currentIndicators
                }, () => { console.log("set server channels"); });
            });
        });
        this.endpoints["fetchChannelMessages"] = this.createAPIEndpoint("/fetchChannelMessages", "POST", true);

        this.endpoints["fetchEmotesForMessages"] = (messages) => {
            messages.forEach(message => {
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
    
                            this.endpoints["fetchEmote"]({ id: id });
                            i += b + 2;
                        }
                    }
                }
            })
        }
        this.endpoints["fetchMentionsForMessages"] = (messages) => {
            messages.forEach(message => {
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

                            this.endpoints["fetchUser"]({ id: id })
                            i += b + 1;
                        }
                    }
                }
            })
        }
        this.endpoints["getSuitableDMChannel"] = async(userID) => {
            var suitableChannels = Array.from(this.mainClass.state.channels.values()).filter(channel => { return channel.members !== undefined && channel.members.length === 2 && channel.members.includes(this.mainClass.state.session.userID) && channel.members.includes(userID); });
            var channel = -1;
            if(suitableChannels.length < 1) {
                channel = await this.endpoints["createChannelDM"]({ name: "autogenerated DM", type: 2, members: [ this.mainClass.state.session.userID, userID ]})
                if(isNaN(channel) === false) {
                    return undefined;
                } else {
                    suitableChannels = [ channel ]
                }
            }
    
            return suitableChannels[0];
        }

        this.endpoints["fetchServerSync"] = this.createFetchSync("servers", this.endpoints["fetchServer"]);
        this.endpoints["fetchInviteSync"] = this.createFetchSync("invites", this.endpoints["fetchInvite"]);

        this.endpoints["sendDMPre"] = this.createAPIEndpoint("/message", "POST", true);
        this.endpoints["sendDM"] = async(data) => {
            var channel = await this.endpoints["getSuitableDMChannel"](data.user.id)
            if(channel === undefined) { return false; }
            
            data.channel = { id: channel.id }
            var reply = await this.endpoints["sendDMPre"](data);
            return reply;
        }

        this.endpoints["authPost"] = async(session) => {
            this.mainClass.setState({
                session: session
            })
    
            setTimeout(() => {
                this.mainClass.setState({
                    waitingForSession: false
                })
            }, 3000)

            this.API_initWebsockets(session.userID);
        }

        this.endpoints["loginPre"] = this.createAPIEndpoint("/login", "POST", true, this.endpoints["authPost"]);
        this.endpoints["login"] = async(data) => {
            this.mainClass.setState({
                waitingForSession: true
            })
            
            this.endpoints["loginPre"](data);
        }

        this.endpoints["registerPre"] = this.createAPIEndpoint("/register", "POST", true, this.endpoints["authPost"]);
        this.endpoints["register"] = async(data) => {
            this.mainClass.setState({
                waitingForSession: true
            })
            
            this.endpoints["registerPre"](data);
        }

        this.endpoints["fetchUsersForMessages"] = async(messages) => {
            messages.forEach(message => {
                this.endpoints["fetchUser"]({ id: message.author.id });
            })
        }
        this.endpoints["fetchUsersForIDs"] = async(ids) => {
            ids.forEach(id => {
                this.endpoints["fetchUser"]({ id: id});
            })
        }
        this.endpoints["fetchEmotesForIDs"] = async(ids) => {
            ids.forEach(id => {
                this.endpoints["fetchEmote"]({ id: id});
            })
        }
        this.endpoints["fetchUsersForFriendRequests"] = async(friendRequests) => {
            friendRequests.forEach(friendRequest => {
                var id = friendRequest.author.id === this.mainClass.state.session.userID ? friendRequest.target.id : friendRequest.author.id;
                this.endpoints["fetchUser"]({ id: id });
            })
        }
        this.endpoints["fetchUsersForFriends"] = async(userID) => {
            var user = this.mainClass.state.functions.getUser(userID);
            user.friends.forEach(friendID => {
                this.endpoints["fetchUser"]({ id: friendID });
            })
        }

        this.endpoints["logout"] = this.createAPIEndpoint("/logout", "POST", true, () => { window.location.reload(false); });
    }

    async lc_fetch(url, opts = {}) {
        const response = await fetch(url, {
            ...opts,
            headers: {
                ...opts.headers
            },
        });
        
        return response;
    }

    createFetchSync(mapName, fetchEndpoint) {
        var func = (id) => {
            if(this.mainClass.state[mapName].has(id)) {
                return this.mainClass.state[mapName].get(id)
            } else {
                if(this.queues[mapName].includes(id)) {
                    return -1;
                } else {
                    fetchEndpoint({ id: id });
                    return -1
                }
            }
        }

        return func;
    }

    createAPIEndpoint(path, type, returnsData, additionalFunc) {
        var endpoint = async(data) => {
            var reply = await this.lc_fetch(this.mainClass.state.APIEndpoint + path + (type === "GET" ? this.createQuery(data) : ""), {
                method: type,
                headers: {
                    "Origin": "https://nekonetwork.net",
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: (type === "POST" ? JSON.stringify(data) : null)
            });
            reply = await reply.json();

            if(reply.status !== undefined) {
                return reply.status;
            } else {
                if(additionalFunc !== undefined) { additionalFunc(reply, data); }
                return returnsData ? reply : 1;
            }
        }

        return endpoint;
    }

    createAPIFileEndpoint(path, type, returnsData) {
        var endpoint = async(file, data) => {
            var reply = await this.lc_fetch(this.mainClass.state.APIEndpoint + path + this.createQuery(data), {
                method: type,
                headers: {
                    "Origin": "https://nekonetwork.net",
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            reply = await reply.json();

            if(reply.status !== undefined) {
                return reply.status;
            } else {
                return returnsData ? reply : 1;
            }
        }

        return endpoint;
    }

    createFetchEndpoint(path, mapName, additionalFetchFunc) {
        var endpoint = async(data) => {
            if(this.mainClass.state[mapName].has(data.id)) {
                return this.mainClass.state[mapName].get(data.id)
            } else {
                var reply = await this.lc_fetch(this.mainClass.state.APIEndpoint + path + this.createQuery(data), {
                    method: "GET",
                    headers: {
                        "Origin": "https://nekonetwork.net",
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                reply = await reply.json();

                if(reply.status === undefined) {
                    //Cache item
                    var newItems = this.mainClass.state[mapName].set(reply.id, reply);
                    if(additionalFetchFunc !== undefined) { additionalFetchFunc(reply, data); }
                    this.mainClass.setState({
                        [mapName]: newItems
                    });
        
                    return reply;
                } else {
                    return undefined;
                }
            }
        }

        return endpoint;
    }

    createFetchMultipleEndpoint(path, mapName, additionalFetchFunc) {
        var endpoint = async(data) => {
            var reply = await this.lc_fetch(this.mainClass.state.APIEndpoint + path + this.createQuery(data), {
                method: "GET",
                headers: {
                    "Origin": "https://nekonetwork.net",
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            reply = await reply.json();

            if(reply.status === undefined) {
                let items = new Map(reply.map(obj => [obj.id, obj]));
                if(additionalFetchFunc !== undefined) { additionalFetchFunc(items, data); }
    
                //Cache items
                let newItems = new Map([...this.mainClass.state[mapName], ...items]);
                this.mainClass.setState({
                    [mapName]: newItems
                });
                return items;
            } else {
                return undefined;
            }
        }

        return endpoint;
    }

    createQuery(data) {
        var query = "";
        for (let key in data) {
            let value = data[key];
            query += (key + "=" + value) + "&";
        }

        return query.length > 0 ? "?" + query.substring(0, query.length - 1) : query;
    }

    async API_initWebsockets(userID) {
        //Setups the websocket client
        const socket = io(this.mainClass.state.APIEndpoint, {
            transports: ['websocket']
        });
        
        socket.on('connect', async() => {
            console.log("> socket.io connected!");
            let user = await this.endpoints["fetchUser"]({ id: userID, containSensitive: true });
            await this.endpoints["fetchUsersForFriends"](userID);
            await this.endpoints["fetchEmotesForIDs"](user.emotes);
            await this.endpoints["fetchDefaultEmotes"]({});
            await this.endpoints["fetchNotes"]({});
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

            this.endpoints["fetchEmotesForMessages"]([ message ])
            this.endpoints["fetchUsersForMessages"]([ message ])
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

            this.endpoints["fetchServerChannels"]({ id: server.id });
            this.endpoints["fetchEmotesForIDs"](server.emotes)
            if(server.members !== undefined) { this.endpoints["fetchUsersForIDs"](server.members); }
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
            server.banner = _server.banner;
            server.members = _server.members;
            server.channels = _server.channels;
            server.invites = _server.invites;
            server.emotes = _server.emotes;
            newServers.set(server.id, server);

            this.endpoints["fetchEmotesForIDs"](server.emotes)
            if(server.members !== undefined) { this.endpoints["fetchUsersForIDs"](server.members); }
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
        socket.on('deleteEmote', (emoteData) => {
            var emote = JSON.parse(emoteData);

            var newEmotes = new Map(this.mainClass.state.emotes)
            newEmotes.delete(emote.id);
            this.mainClass.setState({
                emotes: newEmotes
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
                if(this.mainClass.state.session.userID === user.id) { this.endpoints["fetchEmotesForIDs"](user.emotes); }

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
            var data = await this.endpoints["consumeVoiceTransports"]({ channel: { id: producer.channel.id }, producerID: producer.id, rtpCapabilities: this.device.rtpCapabilities });
            var a = await this.consumerTransport.consume({ id: data.id, producerId: data.producerID, kind: data.kind, rtpParameters: data.rtpParameters, codecOptions: data.codecOptions });
            const stream = new MediaStream();
            stream.addTrack(a.track);

            const audio = document.createElement("audio");
            audio.id = "remoteaudio-" + producer.id;
            audio.srcObject = stream;
        });
        socket.on('updateFriendRequests', (friendRequestsData) => {
            var friendRequests = JSON.parse(friendRequestsData);
            this.endpoints["fetchUsersForFriendRequests"](friendRequests);
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
}

export { API }