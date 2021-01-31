import React from 'react';
import ElementBuilder from './public/scripts/ElementBuilder';
import API from './public/scripts/API';
import Functions from './public/scripts/Functions';
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
    notes: new Map(),

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
    APIEndpoint: "http://localhost:8080",
    fileEndpoint: "http://localhost:8081",
    
    //Utils
    const: new Constants(this),
    elements: new ElementBuilder(this),
    functions: new Functions(this),
    registeredHooks: false,
    copiedID: -1
  };

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
        if (evt.keyCode === 27) { this.state.functions.endEditingMessage(); }
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
      if(this.state.registeredHooks === false) {
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
      }

      document.getElementById("web-header").remove();
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
    if(this.state.functions.isInChannel()) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ isFileDraggingOver: true });
    }
  }

  onFileLeave = function(e) {
    if(this.state.functions.isInChannel()) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ isFileDraggingOver: false });
    }
  }.bind(this);

  onFileDrop = function(e) {
    if(this.state.functions.isInChannel()) {
      e.preventDefault();
      e.stopPropagation();

      let droppedFiles = e.dataTransfer.files;
      if(droppedFiles.length < 1) { return; }

      var file = droppedFiles[0];
      this.state.API.API_sendFile(file, "")
      this.setState({ isFileDraggingOver: false });
    }
  }.bind(this);

  

  render() {
    let server = this.state.functions.getServer(this.state.selectedServer)
    let channel = this.state.functions.getChannel(this.state.currentChannel)

    return (
      <div className="App">
        {
          this.state.isFileDraggingOver === true && this.state.functions.isInChannel() ?
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
            <DialogManager state={this.state} const={this.state.const} API={this.state.API} elements={this.state.elements} functions={this.state.functions} />
            <div className="flex">
              <c.ChannelSelector state={this.state} const={this.state.const} API={this.state.API} elements={this.state.elements} functions={this.state.functions} />
              <div className="chat-wrapper">
                <c.ChannelHeader state={this.state} const={this.state.const} API={this.state.API} elements={this.state.elements} functions={this.state.functions} />
                <c.Chat state={this.state} const={this.state.const} API={this.state.API} elements={this.state.elements} functions={this.state.functions} />
              </div>
            </div>
          </div> :
        (this.state.formState === 0 ?
          <div>
            <DialogManager state={this.state} const={this.state.const} API={this.state.API} elements={this.state.elements} functions={this.state.functions} />
            <c.LoginForm state={this.state} const={this.state.const} API={this.state.API} elements={this.state.elements} functions={this.state.functions} />
          </div> :
          <div>
            <div className="margintop2 fullwidth textcenter text0" style={{color: "white"}}>Register</div>
            <c.RegisterForm state={this.state} const={this.state.const} API={this.state.API} elements={this.state.elements} functions={this.state.functions} />
          </div>
        )}
      </div>
    )
  }
}

export default App;