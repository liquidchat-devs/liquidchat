import React from 'react';

export default class ChannelHeader extends React.Component {
  render() {
    let server = this.props.functions.getServer(this.props.state.selectedServer)
    let channel = this.props.functions.getChannel(this.props.state.currentChannel)
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
        tip = "." + channel.name + " " + (this.props.state.currentVoiceGroup !== -1 ? this.props.state.currentVoiceGroup.users.length : "Connecting...");
        break;
    }

    switch(channel.type) {
      case 0:
      case 1:
      case 2:
        return (
          <div className="chatColor fullwidth channelHeader">
            <div className="aligny fullheight marginleft3">
              <div className="white text2b">{tip}</div>
              {
                channel.description !== undefined ?
                <div className="tooltipColor marginleft2 text2b">- {channel.description}</div>
                : ""
              }
            </div>
          </div>
        );
    }
  }
}