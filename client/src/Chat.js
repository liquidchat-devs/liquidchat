import React from 'react';
import { formatMessage } from './public/scripts/MessageFormatter';
import { formatDate } from './public/scripts/DateFormatter';
import { formatBytes } from './public/scripts/SizeFormatter';

export default class Chat extends React.Component {
  componentDidMount = async() => {
    this.setVideoRef = (element, type) => {
      this["video" + type] = element;
    };
    
    await this.props.API.API_fetchFriendRequests();
    await this.props.API.API_fetchServers();
    this.props.API.API_fetchDMChannels();
  }

  handleEdit = async e => {
    e.preventDefault();

    const res = await this.props.API.API_editMessage(this.props.editingMessage, this.props.editedMessage)
    if(res === 1) {
      this.props.setEditedMesage("");
    }

    this.props.endEditingMessage();
  }

  async setupScreenshare() {
    //Setups a testing MediaStream
    var localStream = await window.navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always"
      },
      audio: false
    });
    
    localStream.getTracks().forEach(track => this.props.API.pc.addTrack(track, localStream));
    this.video0.srcObject = localStream;
    
    const remoteStream = new MediaStream(this.props.API.pc.getReceivers().map(receiver => receiver.track));
    this.video1.srcObject = remoteStream;
  }

  isFullScreen() {
    return !!(document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
  }

  videoAction(element, file, action) {
    switch(action) {
      case "playpause":
        if (element.paused || element.ended) {
          element.play();
          this.refs["videoOverlay-" + file.name].classList.remove("stopped");
          this.refs["videoOverlay-" + file.name].classList.add("playing");
          this.refs["playButtonWrapper-" + file.name].innerHTML  = `<svg aria-hidden="false" width="22" height="22" viewBox="0 0 22 22"><path fill="currentColor" d="M0,14 L4,14 L4,0 L0,0 L0,14 L0,14 Z M8,0 L8,14 L12,14 L12,0 L8,0 L8,0 Z" transform="translate(6 5)"></path></svg>`;
        } else {
          element.pause();
          this.refs["videoOverlay-" + file.name].classList.add("stopped");
          this.refs["videoOverlay-" + file.name].classList.remove("playing");
          this.refs["playButtonWrapper-" + file.name].innerHTML  = `<svg aria-hidden="false" width="22" height="22" viewBox="0 0 22 22"><polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon></svg>`;
        }
        break;

      case "fullscreen":
        if (this.isFullScreen()) {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
          else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
          else if (document.msExitFullscreen) document.msExitFullscreen();
        } else {
            if (element.requestFullscreen) element.requestFullscreen();
            else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
            else if (element.webkitRequestFullScreen) element.webkitRequestFullScreen();
            else if (element.msRequestFullscreen) element.msRequestFullscreen();
        }
        break;
    }
  }

  getUploadMessage(fileID, fileName, bytes1, bytes2, failed) {
    var text = ""
    if(fileName === -1 || bytes1 === bytes2) {
      text = ""
    } else if(failed) {
      text = "Upload of " + fileName + " failed (" + formatBytes(bytes1) + "/100MB)-"
    } else {
      text = "Uploading " + fileName + "... " + formatBytes(bytes1) + "/" + formatBytes(bytes2, true) + " (" + this.formatPercentage(bytes1, bytes2) + ")"
    }

    return text.length < 1 ? null : <div className="paddingtop2 paddingbot2 flex message">
      <div className="flex marginleft2">
        <div className="marginleft2 file-wrapper chatColor">
            <a className="white">{text}</a>
        </div>
      </div>
    </div>
  }

  formatPercentage(in1, in2) {
    if(in1 === 0 || in2 === 0) { return "0%" }
    return Math.round((in1 / in2) * 100) + "%"
  }

  render() {
    let server = this.props.getServer(this.props.selectedServer)
    let channel = this.props.getChannel(this.props.currentChannel)
    if(channel === undefined || (server !== undefined && server.channels.includes(channel.id) === false) || (channel.type !== 2 && server === undefined)) {
      return (
        <div className="flex">
          <h3 className="white margin1 marginleft2"> No Channel Selected</h3>
        </div>
      );
    }

    let messages = channel.messages === undefined ? [] : channel.messages;
    let members = channel.members === undefined ? server.members : channel.members;
    let messageList = -1;
    let membersList = -1;

    messageList = messages.map((message, i) => {
      const user = this.props.getUser(message.author.id)

      return (
        <div key={i} className="paddingtop2 paddingbot2 flex message" onContextMenu={(e) => { this.props.switchDialogState(2); this.props.setSelectedMessage(message, e.pageX, e.pageY); e.preventDefault(); } } onMouseOver={(e) => e.currentTarget.classList.add("hoveredMessageColor")} onMouseLeave={(e) => e.currentTarget.classList.remove("hoveredMessageColor") }>
          <div className="flex marginleft2">
            <img alt="" className="avatar" src={this.props.fileEndpoint + "/" + user.avatar} onContextMenu={(e) => { this.props.setSelectedUser(user, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }/>
            <div className="marginleft2">
              <div className="flex">
                <div className="allignMiddle" style={{margin: 0, color: (user !== undefined && server !== undefined && server.author.id === user.id ? "yellow" : "red"), fontSize: 16}}>
                  {user !== undefined ? user.username : "Loading"}
                </div>
                <div className="allignMiddle margintop1a" style={{marginLeft: 5, fontSize: 10, color: "#acacac"}}>
                  {formatDate(message.createdAt)}
                </div>
              </div>
              <div className="flex">
                {message.id === this.props.editingMessage.id ?
                <div>
                    <form onSubmit={this.handleEdit} className="full">
                      <input className="input-message chatColor" type="text" value={this.props.editedMessage} required={true} onChange={(e) => { this.props.setEditedMessage(e.target.value) }}/>
                    </form>
                  </div>
                : formatMessage(this, message)
                }
              </div>
            </div>
          </div>
        </div>
      )
    });

    membersList = members === undefined ? -1 : members.map((memberID, i) => {
      const user = this.props.getUser(memberID)

      return (
        <div key={i} className="paddingtop2 paddingbot2 flex" onContextMenu={(e) => { this.props.setSelectedUser(user, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } } onMouseOver={(e) => e.currentTarget.classList.add("hoveredMessageColor")} onMouseLeave={(e) => e.currentTarget.classList.remove("hoveredMessageColor") }>
          <div className="flex marginleft2">
            <img alt="" className="avatar3" src={this.props.fileEndpoint + "/" + user.avatar}/>
            <div style={{ marginLeft: -12, marginTop: 18, backgroundColor: (user.status === 1 ? "#3baf3b" : "#f15252"), borderRadius: "50%", width: 12, height: 12 }}/>
            <div className="marginleft2">
              <div className="flex">
                <div className="allignMiddle" style={{margin: 0, color: (user !== undefined && server !== undefined && server.author.id === user.id ? "yellow" : "red"), fontSize: 16}}>
                  {user !== undefined ? user.username : "Loading"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    });

    switch(channel.type) {
      case 0:
      case 2:
        return (
          <div className="flex">
            <div style={{ overflowY: "scroll", height: this.props.pageHeight - 165, width: membersList === -1 ? "100%" : "calc(100% - 200px)" }}>
              {messageList}
              <div className="white">
                {this.getUploadMessage(this.props.uploadFileID, this.props.uploadFileName, this.props.uploadReceived, this.props.uploadExpected, this.props.uploadFailed)}
              </div>
            </div>
            {membersList === -1 ? null :
            <div className="membersList paddingtop2b">
              <div className="marginleft2">
                <div className="flex">
                  <div className="allignMiddle" style={{ margin: 0, color: "white", fontSize: 16, marginBottom: 5 }}>
                    Members ({members.length})
                  </div>
                </div>
              </div>
              {membersList}
            </div>
            }
          </div>
        );

      case 1:
        return (
          <div className="flex">
            <div>
              <div className="button2 alignmiddle chatColor" onClick={(e) => { this.setupScreenshare(); }}>
                <p className="white text1">Screenshare</p>
              </div>
              <div className="flex">
                <video width="800" height="600" autoPlay={true} ref={(e) => { this.setVideoRef(e, 0) }}/>
                <div className="video-overlay white marginleft2 margintop1" style={{ marginLeft: -790 }}>
                    Local
                    <br/>
                    <a className="tipColor">(test)</a>
                </div>
              </div>
              <div className="flex">
                <video width="800" height="600" autoPlay={true} ref={(e) => { this.setVideoRef(e, 1) }}/>
                <div className="video-overlay white marginleft2 margintop1" style={{ marginLeft: -790 }}>
                    Remote
                    <br/>
                    <a className="tipColor">(test)</a>
                </div>
              </div>
            </div>
          </div>
        );
    }
  }
}