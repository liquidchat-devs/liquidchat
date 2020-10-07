import React from 'react';
import Chat from './Chat'
import Send from './Send';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Account, ChannelHeader, ChannelSelector, DialogManager } from './Components.js';
import { API } from './public/scripts/API';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  state = {
    //Page size
    pageWidth: 0,
    pageHeight: 0,

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

    //Data
    users: new Map(),
    servers: new Map(),
    channels: new Map(),
    friendRequests: new Map(),

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

    //API
    API: new API(this),
    APIEndpoint: "https://nekonetwork.net:8080",
    fileEndpoint: "http://nekonetwork.net:8081",
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
    this.setState({
      channelTypes: 2,
      selectedServer: val
    });

    this.switchChannel(-1);
  }

  setSelectedChannel =  (channel) => {
    this.setState({
      selectedChannel: channel
    });
  }

  setBox = (x, y) => {
    this.setState({
      boxX: x,
      boxY: y
    });
  }

  setSelectedUser = (user, x, y) => {
    this.setState({
      selectedUser: user,
      boxX: x,
      boxY: y
    });
  }

  getUser = (id) => {
    if(this.state.users.has(id)) {
      return this.state.users.get(id)
    } else {
      return -1;
    }
  }

  getServer = (id) => {
    if(this.state.servers.has(id)) {
      return this.state.servers.get(id)
    } else {
      return -1;
    }
  }

  componentDidMount = () => {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);

    document.onkeydown = function(evt) {
      evt = evt || window.event;
      if (evt.keyCode === 27) {
        this.endEditingMessage();
      }
    }.bind(this);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions() {
    this.setState({ pageWidth: window.innerWidth, pageHeight: window.innerHeight });
  }

  render() {
    return (
      <div className="App">
        <div className="header0 headerColor">
          <div className="white text1 marginleft2">LiquidChat (dev) <a className="link marginleft1" href="https://github.com/LamkasDev/liquidchat" target="_blank">(Github)</a></div>
        </div>
        {this.state.waitingForSession === false ?
          <div>
            <DialogManager
            getServer={this.getServer} selectedServer={this.state.selectedServer} channels={this.state.channels} currentChannel={this.state.currentChannel} switchChannelTypes={this.switchChannelTypes} switchChannel={this.switchChannel} setSelectedChannel={this.setSelectedChannel} selectedChannel={this.state.selectedChannel} selectedImage={this.state.selectedImage} API={this.state.API}
            dialogState={this.state.dialogState} switchDialogState={this.switchDialogState} startEditingMessage={this.startEditingMessage} setSelectedUser={this.setSelectedUser} getUser={this.getUser} selectedUser={this.state.selectedUser}
            boxX={this.state.boxX} boxY={this.state.boxY} selectedMessage={this.state.selectedMessage} session={this.state.session} fileEndpoint={this.state.fileEndpoint} setEditedMessage={this.setEditedMessage} setSelectedMessage={this.setSelectedMessage}/>
            <Account
            API={this.state.API} fileEndpoint={this.state.fileEndpoint} switchDialogState={this.switchDialogState} setSelectedMessage={this.setSelectedMessage}
            session={this.state.session} getUser={this.getUser}/>
            <div className="flex">
              <ChannelSelector setBox={this.setBox} getServer={this.getServer} selectedServer={this.state.selectedServer} selectedChannel={this.state.selectedChannel} setSelectedServer={this.setSelectedServer} currentChannel={this.state.currentChannel}
              setSelectedChannel={this.setSelectedChannel} API={this.state.API} switchDialogState={this.switchDialogState} channelTypes={this.state.channelTypes} switchChannelTypes={this.switchChannelTypes}
              session={this.state.session} fileEndpoint={this.state.fileEndpoint} friendRequests={this.state.friendRequests} setSelectedUser={this.setSelectedUser}
              channels={this.state.channels} setFirstChannel={this.setFirstChannel} switchChannel={this.switchChannel} currentVoiceGroup={this.state.currentVoiceGroup} getUser={this.getUser}/>
              <div className="chat-wrapper">
                <ChannelHeader
                API={this.state.API} currentChannel={this.state.currentChannel} channels={this.state.channels} currentVoiceGroup={this.state.currentVoiceGroup}/>
                <Chat
                uploadReceived={this.state.uploadReceived} uploadExpected={this.state.uploadExpected}
                uploadFileID={this.state.uploadFileID} uploadFileName={this.state.uploadFileName} uploadFailed={this.state.uploadFailed}
                pageHeight={this.state.pageHeight} API={this.state.API} setSelectedUser={this.setSelectedUser} currentVoiceGroup={this.state.currentVoiceGroup} setSelectedImage={this.setSelectedImage}
                channels={this.state.channels} currentChannel={this.state.currentChannel} switchDialogState={this.switchDialogState} setSelectedMessage={this.setSelectedMessage}
                editingMessage={this.state.editingMessage} editedMessage={this.state.editedMessage} setEditedMessage={this.setEditedMessage} endEditingMessage={this.endEditingMessage} getUser={this.getUser} fileEndpoint={this.state.fileEndpoint}/>
                <Send
                API={this.state.API}
                currentChannel={this.state.currentChannel} channels={this.state.channels}/>
              </div>
            </div>
          </div> :
        (this.state.formState === 0 ?
          <div>
            <DialogManager dialogState={this.state.dialogState} switchDialogState={this.switchDialogState} />
            <div className="margintop2 fullwidth textcenter text0" style={{color: "white"}}>Login</div>
            <LoginForm
            API={this.state.API} switchDialogState={this.switchDialogState}
            session={this.state.session} getUser={this.getUser}
            formState={this.state.formState} switchFormState={this.switchFormState}/>
          </div> :
          <div>
            <div className="margintop2 fullwidth textcenter text0" style={{color: "white"}}>Register</div>
            <RegisterForm
            API={this.state.API}
            formState={this.state.formState} switchFormState={this.switchFormState}/>
          </div>
        )}
      </div>
    )
  }
}

export default App;