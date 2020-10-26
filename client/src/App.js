import React from 'react';
import API from './public/scripts/API';
import Constants from './public/scripts/Constants';
import DialogManager from './Components.js';
import * as c from './components/index';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  state = {
    //Page size
    pageWidth: 0,
    pageHeight: 0,
    pageHeightOffset: 0,

    //Authorization
    waitingForSession: true,
    session: -1,

    //UI utilities
    formState: 0,
    dialogState: -1,
    channelTypes: 1,
    boxX: 0,
    boxY: 0,

    //Selected IDs
    selectedMessage: -1,
    editingMessage: -1,
    editedMessage: "",
    selectedUser: -1,
    selectedImage: -1,
    selectedChannel: -1,
    selectedServer: -1,
    selectedAvatar: -1,

    //Data
    users: new Map(),
    servers: new Map(),
    channels: new Map(),
    friendRequests: new Map(),
    invites: new Map(),
    unreadMessages: new Map(),
    emotes: new Map(),
    typingIndicators: new Map(),

    //Channel selector
    firstChannelElement: -1,
    firstChannel: -1,
    previousChannel: -1,
    currentChannel: -1,
    currentVoiceGroup: -1,

    //Upload/Download utils
    uploadReceived: 0,
    uploadExpected: 0,
    uploadFileID: -1,
    uploadFileName: -1,
    uploadFailed: false,
    isFileDraggingOver: false,

    //API
    API: new API(this),
    APIEndpoint: "https://nekonetwork.net:8080",
    fileEndpoint: "https://nekonetwork.net:8081",
    
    //Utils
    const: new Constants(this),
    registeredHooks: false
  };

  setFirstChannel = (_e, _channelID) => {
    this.setState({
      firstChannel: _channelID,
      firstChannelElement: _e,
    }, () => {
      this.state.firstChannelElement.click();
    });
  }

  switchChannel = (_channelID) => {
    this.setState({
      previousChannel: this.state.currentChannel,
      currentChannel: _channelID
    });

    let channel = this.state.channels.get(_channelID)
    if(channel === undefined) { return; }

    switch(channel.type) {
      case 1:
        this.state.API.API_joinVoiceChannel(channel)
        break;
    }

    let chat = document.getElementById('chat-container');
    if(chat !== null) { chat.scrollTop = chat.scrollHeight; }
  }

  switchFormState = () => {
    this.setState({
      formState: this.state.formState === 0 ? 1 : 0,
    });
  }

  switchDialogState = (id) => {
    this.setState({
      dialogState: id
    });
  }

  switchChannelTypes = (id) => {
    this.setState({
      channelTypes: id,
      selectedServer: -1,
    });

    this.switchChannel(-1);
  }

  setSelectedMessage = (message, x, y) => {
    this.setState({
      selectedMessage: message,
      boxX: x,
      boxY: y
    });
  }

  startEditingMessage = (message) => {
    this.setState({
      editingMessage: message
    });
  }

  endEditingMessage = () => {
    this.setState({
      editingMessage: -1
    });
  }

  setEditedMessage = val => {
    this.setState({
      editedMessage: val
    });
  }

  setSelectedImage = val => {
    this.setState({
      selectedImage: val
    });
  }

  setSelectedServer = val => {
    if(this.state.selectedServer !== val) { this.switchChannel(-1); }
    this.setState({
      channelTypes: 2,
      selectedServer: val
    });
  }

  setSelectedChannel =  (channel) => {
    this.setState({
      selectedChannel: channel
    });
  }

  setSelectedAvatar =  (avatar) => {
    this.setState({
      selectedAvatar: avatar
    });
  }

  setBox = (x, y) => {
    this.setState({
      boxX: x,
      boxY: y
    });
  }

  setSelectedUser = (user) => {
    this.setState({
      selectedUser: user
    });
  }

  moveChannel = (channels, oldIndex, newIndex) => {
    //Sort the channels
    channels.splice(newIndex, 0, channels.splice(oldIndex, 1)[0]);
    channels.forEach((c, index) => {
      c.position = index;
    });

    //Find channels that has been sorted and assign the new position to them, so we don't lose channels not included in the sorting
    channels = new Map(channels.map(obj => [obj.id, obj]))
    let newChannels = Array.from(this.state.channels.values());
    newChannels = newChannels.reduce((acc, curr) => {
      if(channels.has(curr.id)) {
        curr.position = channels.get(curr.id).position;
      }
      
      acc.set(curr.id, curr);
      return acc;
    }, new Map())

    this.setState({
        channels: newChannels
    });
  }

  getUser = (id) => {
    return this.state.users.get(id)
  }

  getChannel = (id) => {
    return this.state.channels.get(id)
  }

  getServer = (id) => {
    return this.state.servers.get(id)
  }

  componentDidMount = () => {
    //Page dimensions hook
    if(this.state.registeredHooks === false) {
      this.updateWindowDimensions();
      window.addEventListener("resize", () => {
        this.updateWindowDimensions();
      });
    }

    //Keyboard hooks
    if(this.state.registeredHooks === false) {
      window.addEventListener("keydown", (evt) => {
        evt = evt || window.event;
        if (evt.keyCode === 27) { this.endEditingMessage(); }
      });
    }

    //Notification hooks
    if(this.state.registeredHooks === false) {
      window.addEventListener("focus", () => {
        if(window.navigator.userAgent.includes("LiquidChat")) {
          this.setState({
            unreadMessages: new Map()
          });

          window.setIcon(false);
        }
      });
    }

    //Drag hooks
    document.ondragstart = function() {
      return false;
    }

    document.ondragover = function(e) {
      e.preventDefault();
    }

    document.ondragenter = function(e) {
      this.onFileEnter(e);
    }.bind(this);

    //Setup page offsets
    this.setState({
      pageHeightOffset: window.navigator.userAgent.includes("LiquidChat") === false ? 0 : 0
    })

    //Setup menu bar
    if(window.navigator.userAgent.includes("LiquidChat")) {
      if(this.state.registeredHooks === true) {
        const minimizeButton = document.getElementById("minimize-btn");
        const maxUnmaxButton = document.getElementById("max-unmax-btn");
        const closeButton = document.getElementById("close-btn");
      
        minimizeButton.addEventListener("click", e => {
          window.minimizeWindow();
        });
      
        maxUnmaxButton.addEventListener("click", e => {
          const icon = maxUnmaxButton.querySelector("i.far");
          window.maxUnmaxWindow();

          if (window.isWindowMaximized()) {
            icon.classList.remove("fa-square");
            icon.classList.add("fa-clone");
          } else {
            icon.classList.add("fa-square");
            icon.classList.remove("fa-clone");
          }
        });
      
        closeButton.addEventListener("click", e => {
          window.closeWindow();
        });
        
        document.getElementById("web-header").remove();
      }
    } else {
      document.getElementById("app-header").remove();
    }

    this.setState({
      registeredHooks: true
    });
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions() {
    this.setState({ pageWidth: window.innerWidth, pageHeight: window.innerHeight });
  }

  onFileEnter = function(e) {
    if(this.isInChannel()) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ isFileDraggingOver: true });
    }
  }

  onFileLeave = function(e) {
    if(this.isInChannel()) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ isFileDraggingOver: false });
    }
  }.bind(this);

  onFileDrop = function(e) {
    if(this.isInChannel()) {
      e.preventDefault();
      e.stopPropagation();

      let droppedFiles = e.dataTransfer.files;
      if(droppedFiles.length < 1) { return; }

      var file = droppedFiles[0];
      this.state.API.API_sendFile(file, "")
      this.setState({ isFileDraggingOver: false });
    }
  }.bind(this);

  getOwnServers = function() {
    let servers = new Map();
    this.state.servers.forEach(server => {
      if(server.members.includes(this.state.session.userID)) {
        servers.set(server.id, server);
      }
    })

    return servers;
  }.bind(this);

  isInChannel = function() {
    let server = this.getServer(this.state.selectedServer)
    let channel = this.getChannel(this.state.currentChannel)
    return !(channel === undefined || (server !== undefined && server.channels.includes(channel.id) === false) || (channel.type !== 2 && server === undefined) || channel.type === 1);
  }.bind(this);

  isInServer = function(id) {
    return this.getOwnServers().has(id);
  }.bind(this);

  render() {
    let server = this.getServer(this.state.selectedServer)
    let channel = this.getChannel(this.state.currentChannel)

    return (
      <div className="App">
        {
          this.state.isFileDraggingOver === true && this.isInChannel() ?
          <div className="absolutepos overlay" onDragLeave={this.onFileLeave} onDrop={this.onFileDrop}>
              <div className="absolutepos overlaybox6">
                <div>
                  <div className="white text3 alignmiddle">Upload a file-</div>
                  <div className="tooltipColor text8 alignmiddle">(to #{channel.name}{server !== undefined ? ` in ${server.name}` : ""})</div>
                </div>
              </div>
          </div>
          :
          ""
        }
        <div id="web-header">
          <div className="header0 flex headerColor">
            <div className="white text1 marginleft2">LiquidChat</div>
            <a className="link text1 marginleft1" href="https://github.com/LamkasDev/liquidchat" target="_blank" rel="noopener noreferrer">-Github</a>
            <a className="link text1 marginleft1" href="https://nekonetwork.net/docs" target="_blank" rel="noopener noreferrer">-Docs</a>
            <a className="link text1 marginleft1" href="https://github.com/LamkasDev/liquidchat/releases/latest/download/LiquidChat.Installer.exe" target="_blank" rel="noopener noreferrer">(Download latest version)</a>
          </div>
        </div>
        <div id="app-header" className="header0 headerColor appHeader">
          <div className="fullwidth" style={{ "WebkitAppRegion": "drag", width: "calc(100% - 102px)" }}>
            <div className="white text1 marginleft2">LiquidChat</div>
          </div>
          <div className="appHeaderButtons">
            <div className="button appHeaderButton" id="minimize-btn" style={{ transform: "scale(0.55)" }}><i className="fas fa-window-minimize"></i></div>
            <div className="button appHeaderButton" id="max-unmax-btn"><i className="far fa-square"></i></div>
            <div className="button appHeaderButton" id="close-btn"><i className="fas fa-times"></i></div>
          </div>
       </div>
        {this.state.waitingForSession === false ?
          <div>
            <DialogManager
            const={this.state.const} emotes={this.state.emotes} setSelectedServer={this.setSelectedServer} setSelectedAvatar={this.setSelectedAvatar} selectedAvatar={this.state.selectedAvatar} getChannel={this.getChannel} getServer={this.getServer} selectedServer={this.state.selectedServer} channels={this.state.channels} currentChannel={this.state.currentChannel} switchChannelTypes={this.switchChannelTypes} switchChannel={this.switchChannel} setSelectedChannel={this.setSelectedChannel} selectedChannel={this.state.selectedChannel} selectedImage={this.state.selectedImage} API={this.state.API}
            dialogState={this.state.dialogState} switchDialogState={this.switchDialogState} startEditingMessage={this.startEditingMessage} setSelectedUser={this.setSelectedUser} getUser={this.getUser} selectedUser={this.state.selectedUser}
            boxX={this.state.boxX} boxY={this.state.boxY} selectedMessage={this.state.selectedMessage} session={this.state.session} fileEndpoint={this.state.fileEndpoint} setEditedMessage={this.setEditedMessage} setSelectedMessage={this.setSelectedMessage}/>
            <div className="flex">
              <c.ChannelSelector const={this.state.const} getChannel={this.getChannel} getOwnServers={this.getOwnServers} pageHeight={this.state.pageHeight} pageHeightOffset={this.state.pageHeightOffset} moveChannel={this.moveChannel} setBox={this.setBox} getServer={this.getServer} selectedServer={this.state.selectedServer} selectedChannel={this.state.selectedChannel} setSelectedServer={this.setSelectedServer} currentChannel={this.state.currentChannel}
              setSelectedChannel={this.setSelectedChannel} API={this.state.API} switchDialogState={this.switchDialogState} channelTypes={this.state.channelTypes} switchChannelTypes={this.switchChannelTypes}
              session={this.state.session} fileEndpoint={this.state.fileEndpoint} friendRequests={this.state.friendRequests} setSelectedUser={this.setSelectedUser}
              channels={this.state.channels} setFirstChannel={this.setFirstChannel} switchChannel={this.switchChannel} currentVoiceGroup={this.state.currentVoiceGroup} getUser={this.getUser}/>
              <div className="chat-wrapper">
                <c.ChannelHeader
                API={this.state.API} currentChannel={this.state.currentChannel} getChannel={this.getChannel} selectedServer={this.state.selectedServer} getServer={this.getServer} currentVoiceGroup={this.state.currentVoiceGroup}/>
                <c.Chat
                const={this.state.const} setBox={this.setBox} users={this.state.users} isInChannel={this.isInChannel} emotes={this.state.emotes} pageHeightOffset={this.state.pageHeightOffset}
                session={this.state.session} uploadReceived={this.state.uploadReceived} uploadExpected={this.state.uploadExpected}
                uploadFileID={this.state.uploadFileID} uploadFileName={this.state.uploadFileName} uploadFailed={this.state.uploadFailed}
                pageHeight={this.state.pageHeight} API={this.state.API} setSelectedUser={this.setSelectedUser} currentVoiceGroup={this.state.currentVoiceGroup} setSelectedImage={this.setSelectedImage}
                selectedServer={this.state.selectedServer} getChannel={this.getChannel} getServer={this.getServer} currentChannel={this.state.currentChannel} switchDialogState={this.switchDialogState} setSelectedMessage={this.setSelectedMessage}
                editingMessage={this.state.editingMessage} editedMessage={this.state.editedMessage} setEditedMessage={this.setEditedMessage} endEditingMessage={this.endEditingMessage} getUser={this.getUser} fileEndpoint={this.state.fileEndpoint}/>
                <c.Send
                typingIndicators={this.state.typingIndicators} getUser={this.getUser} getChannel={this.getChannel} getServer={this.getServer} isInServer={this.isInServer} isInChannel={this.isInChannel} session={this.state.session} fileEndpoint={this.state.fileEndpoint} emotes={this.state.emotes} API={this.state.API}
                currentChannel={this.state.currentChannel}
                selectedServer={this.state.selectedServer}/>
              </div>
            </div>
          </div> :
        (this.state.formState === 0 ?
          <div>
            <DialogManager dialogState={this.state.dialogState} switchDialogState={this.switchDialogState} />
            <c.LoginForm
            fileEndpoint={this.state.fileEndpoint} API={this.state.API} switchDialogState={this.switchDialogState}
            session={this.state.session} getUser={this.getUser}
            formState={this.state.formState} switchFormState={this.switchFormState}/>
          </div> :
          <div>
            <div className="margintop2 fullwidth textcenter text0" style={{color: "white"}}>Register</div>
            <c.RegisterForm
            fileEndpoint={this.state.fileEndpoint} API={this.state.API}
            formState={this.state.formState} switchFormState={this.switchFormState}/>
          </div>
        )}
      </div>
    )
  }
}

export default App;