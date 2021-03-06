import React from 'react';
import { formatBytes } from '../public/scripts/SizeFormatter';
import Send from './Send';

export default class Chat extends React.Component {
  componentDidMount = async() => {
    this.setVideoRef = (element, type) => {
      this["video" + type] = element;
    };
    
    await this.props.API.endpoints["fetchFriendRequests"]({});
    await this.props.API.endpoints["fetchServers"]({});
    await this.props.API.endpoints["fetchDMChannels"]({});
  }

  handleEdit = async e => {
    e.preventDefault();

    const res = await this.props.API.endpoints["editMessage"]({ id: this.props.state.editingMessage.id, text: this.props.state.editedMessage })
    if(res === 1) {
      this.props.setEditedMesage("");
    }

    this.props.functions.endEditingMessage();
  }

  isFullScreen() {
    return !!(document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
  }

  videoAction(element, file, action) {
    switch(action) {
      case "playpause":
        if (element.paused || element.ended) {
          element.play();
          if(this.refs["videoOverlay-" + file.name] !== undefined) {
            this.refs["videoOverlay-" + file.name].classList.remove("stopped");
            this.refs["videoOverlay-" + file.name].classList.add("playing");
          }

          this.refs["playButtonWrapper-" + file.name].innerHTML  = `<svg aria-hidden="false" width="22" height="22" viewBox="0 0 22 22"><path fill="currentColor" d="M0,14 L4,14 L4,0 L0,0 L0,14 L0,14 Z M8,0 L8,14 L12,14 L12,0 L8,0 L8,0 Z" transform="translate(6 5)"></path></svg>`;
        } else {
          element.pause();
          if(this.refs["videoOverlay-" + file.name] !== undefined) {
            this.refs["videoOverlay-" + file.name].classList.add("stopped");
            this.refs["videoOverlay-" + file.name].classList.remove("playing");
          }

          this.refs["playButtonWrapper-" + file.name].innerHTML  = `<svg aria-hidden="false" width="22" height="22" viewBox="0 0 22 22"><polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon></svg>`;
        }
        break;

      case "pause":
        element.pause();
        if(this.refs["videoOverlay-" + file.name] !== undefined) {
          this.refs["videoOverlay-" + file.name].classList.add("stopped");
          this.refs["videoOverlay-" + file.name].classList.remove("playing");
        }

        this.refs["playButtonWrapper-" + file.name].innerHTML  = `<svg aria-hidden="false" width="22" height="22" viewBox="0 0 22 22"><polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon></svg>`;
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

      default:
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
            <div className="white">{text}</div>
        </div>
      </div>
    </div>
  }

  formatPercentage(in1, in2) {
    if(in1 === 0 || in2 === 0) { return "0%" }
    return Math.round((in1 / in2) * 100) + "%"
  }

  render() {
    let server = this.props.functions.getServer(this.props.state.selectedServer)
    let channel = this.props.functions.getChannel(this.props.state.currentChannel)
    if(this.props.functions.isInChannel() === false) {
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
      let messageHTML = this.props.functions.getFormattedMessage(this, message);
      return (
        <div key={i} className="paddingtop2 paddingbot2 flex message hover" onContextMenu={(e) => { this.props.functions.switchDialogState(2); this.props.functions.setSelectedMessage(message); this.props.functions.setBox(e.pageX, e.pageY); e.preventDefault(); } }>
          {messageHTML}
        </div>
      )
    });

    membersList = members === undefined ? -1 : members.map((memberID, i) => {
      const user = this.props.functions.getUser(memberID)

      return (
        <div key={i} className="paddingtop2 paddingbot2 flex message hover" onContextMenu={(e) => { this.props.functions.setSelectedUser(user.id); this.props.functions.setBox(e.pageX, e.pageY); this.props.functions.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }>
          <div className="flex marginleft2">
            <img alt="" className="avatar3" src={this.props.state.fileEndpoint + "/" + user.avatar}/>
            <div className="statusWrapper2">
              <div className="status2" style={{ backgroundColor: this.props.const.getStatusColor(user.userStatus) }}/>
            </div>
            <div className="marginleft2">
              <div className="flex">
                <div className="allignMiddle" style={{margin: 0, color: (user !== undefined && ((server !== undefined && server.author.id === user.id) || (server === undefined && channel.author.id === user.id)) ? "yellow" : "red"), fontSize: 16}}>
                  {user !== undefined ? user.username : "Loading"}
                </div>
              </div>
              {
                user !== undefined && user.customStatus !== undefined ?
                <div className="flex">
                  <div className="tooltipColor allignMiddle" style={{margin: 0, fontSize: 11}}>
                    {user.customStatus}
                  </div>
                </div>
              : ""
              }
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
            <div style={{ width: membersList === -1 ? "100%" : "calc(100% - var(--membersSize))" }}>
              <div className="chatContainer" id="chat-container" style={{ height: "calc(" + (this.props.state.pageHeight - 93 - this.props.state.pageHeightOffset) + "px - var(--channelHeaderSize))", overflowY: "scroll" }}>
                {messageList}
                <div className="white">
                  {this.getUploadMessage(this.props.state.uploadFileID, this.props.state.uploadFileName, this.props.state.uploadReceived, this.props.state.uploadExpected, this.props.state.uploadFailed)}
                </div>
              </div>
              <Send state={this.props.state} const={this.props.state.const} API={this.props.state.API} elements={this.props.state.elements} functions={this.props.state.functions} />
            </div>
            {membersList === -1 ? null :
            <div className="membersList">
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
              <div className="button2 hover alignmiddle chatColor" onClick={(e) => { this.setupScreenshare(); }}>
                <p className="white text1">Screenshare</p>
              </div>
              <div className="flex">
                <video width="800" height="600" autoPlay={true} ref={(e) => { this.setVideoRef(e, 0) }}/>
                <div className="video-overlay white marginleft2 margintop1" style={{ marginLeft: -790 }}>
                    Local
                    <br/>
                    <div className="tipColor">(test)</div>
                </div>
              </div>
              <div className="flex">
                <video width="800" height="600" autoPlay={true} ref={(e) => { this.setVideoRef(e, 1) }}/>
                <div className="video-overlay white marginleft2 margintop1" style={{ marginLeft: -790 }}>
                    Remote
                    <br/>
                    <div className="tipColor">(test)</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
}