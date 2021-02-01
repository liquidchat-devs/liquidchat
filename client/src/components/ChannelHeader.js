import React from 'react';

export default class ChannelHeader extends React.Component {
  state = {
    searchResult: -1,
    searches: -1,
    searchTerm: ""
  }

  handleChange = e => {
    let term = e.target.value;
    this.setState({
      searchTerm: term
    })
  }

  handleSubmit = async e => {
    e.preventDefault();

    var res = await this.props.API.API_searchMessages({ channels: [ this.props.state.currentChannel ], term: this.state.searchTerm });
    if(isNaN(res) || res.length === 0) {
      this.props.functions.setSearches(res);
      this.props.functions.setSearchedTerm(this.state.searchTerm);
    } else {
      this.setState({
        searchResult: res,
      });
    }
  }

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

      default:
        break;
    }

    switch(channel.type) {
      default:
        return (
          <div className="chatColor fullwidth channelHeader">
            <div className="aligny fullheight channelSection1">
              <div className="white text2b">{tip}</div>
              {
                channel.description !== undefined ?
                <div className="tooltipColor marginleft2 text2b">- {channel.description}</div>
                : ""
              }
            </div>
            <div className="aligny fullheight channelSection2">
              <div className="searchbar alignmiddle" onClick={(e) => { this.props.functions.switchDialogState(26); }}>
                <form className="full" onSubmit={this.handleSubmit}>
                  <input className="searchbarInputfield" placeholder="Search..." onChange={this.handleChange} />
                </form>
                <svg className="headerButton2" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" fill="rgba(108,108,108,1)"/></svg>
              </div>
          </div>
        );
    }
  }
}