import React from 'react';
import { formatMessage } from './public/scripts/MessageFormatter';
import { formatDate } from './public/scripts/DateFormatter';

export default class Chat extends React.Component {
  componentDidMount = () => {
    this.setVideoRef = (element, type) => {
      this["video" + type] = element;
    };

    this.props.API.API_fetchChannels();
    this.props.API.API_fetchFriendRequests();
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

  render() {
    let channel = this.props.channels.get(this.props.currentChannel)
    if(channel === undefined) {
      return (
        <div className="Chat">
          <h3 className="white margin1 marginleft2"> No Channel Selected</h3>
        </div>
      );
    }
    
    switch(channel.type) {
      case 0:
        let messages = channel.messages === undefined ? [] : channel.messages;
        const messageList = messages.map((message, i) => {
          const user = this.props.getUser(message.author.id)

          return (
            <div className="paddingtop2 paddingbot2 flex" key={i} onContextMenu={(e) => { this.props.switchDialogState(2); this.props.setSelectedMessage(message, e.pageX, e.pageY); e.preventDefault(); } } onMouseOver={(e) => e.currentTarget.classList.add("hoveredMessageColor")} onMouseLeave={(e) => e.currentTarget.classList.remove("hoveredMessageColor") }>
              <div className="flex marginleft2">
                <img className="avatar" src={this.props.fileEndpoint + "/" + user.avatar} key={i} onContextMenu={(e) => { this.props.setSelectedUser(user, e.pageX, e.pageY); this.props.switchDialogState(6); e.preventDefault(); e.stopPropagation(); } }/>
                <div className="marginleft2">
                  <div className="flex">
                    <div className="allignMiddle" style={{margin: 0, color: message.color, fontSize: 16}}>
                      {user !== -1 ? user.username : "Loading"}
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

        return (
          <div className="Chat">
            <div style={{ overflowY: "scroll", height: this.props.pageHeight - 165 }}>
              {messageList}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="Chat">
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