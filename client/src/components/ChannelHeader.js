import React from 'react';

export default class ChannelHeader extends React.Component {
  render() {
    let server = this.props.getServer(this.props.selectedServer)
    let channel = this.props.getChannel(this.props.currentChannel)
    if(channel === undefined || (server !== undefined && server.channels.includes(channel.id) === false) || (channel.type !== 2 && server === undefined)) {
      return null;
    }

    let tip = -1;
    let messages = -1;
    switch(channel.type) {
      case 0:
      case 2:
        messages = channel.messages === undefined ? [] : channel.messages;
        tip = "#" + channel.name + " (" + messages.length + ")";
        break;

      case 1:
        tip = "." + channel.name + " " + (this.props.currentVoiceGroup !== -1 ? this.props.currentVoiceGroup.users.length : "Connecting...");
        break;
    }

    switch(channel.type) {
      case 0:
      case 1:
      case 2:
        return (
          <div className="chatColor fullwidth channelHeader">
            <div className="flex marginleft3">
              <div className="text2" style={{color: "white"}}>{tip}</div>
            </div>
          </div>
        );
    }
  }
}