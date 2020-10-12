import React from 'react';

export default class Send extends React.Component {
  state = {
    message: ""
  };

  handleChange = e => {
    this.setState({
      message: e.target.value
    });
  }

  handleSubmit = async e => {
    e.preventDefault();

    let a = this.state.message.substring(this.state.message.lastIndexOf(":") + 1)
    let possibleEmotes = Array.from(this.props.emotes.values()).filter(e => { return a.length > 0 && e.name.startsWith(a); })

    if(possibleEmotes.length < 1) {
      this.handleChange({ target: { value: "" }})
      if(await this.props.API.API_sendMessage(this.state.message)) {
        this.setState({
          message: "",
        });
      }
    } else {
      let b = this.state.message.substring(0, this.state.message.lastIndexOf(":"))
      this.handleChange({ target: { value: b + "<:" + possibleEmotes[0].id + ":>" }})
    }
  }

  handleFile = async e => {
    if(e.target.files.length < 1) { return; }
    
    var file = e.target.files[0];
    e.target.value = ""
    if(await this.props.API.API_sendFile(file, this.state.message)) {
      this.setState({
        message: "",
      });
    }
  }

  render() {
    let server = this.props.getServer(this.props.selectedServer)
    let channel = this.props.getChannel(this.props.currentChannel)
    if(channel === undefined || (server !== undefined && server.channels.includes(channel.id) === false) || (channel.type !== 2 && server === undefined) || channel.type === 1) {
      return null;
    }

    let a = this.state.message.substring(this.state.message.lastIndexOf(":") + 1)
    let possibleEmotes = Array.from(this.props.emotes.values()).filter(e => { return e.author.id === this.props.session.userID && a.length > 0 && e.name.startsWith(a); })
    let emoteList = possibleEmotes.map(emote => {
      return <div className="emoteItemWrapper">
        <div className="emoteItem">
          <img className="emoteImage marginleft2" src={this.props.fileEndpoint + "/" + emote.file} />
          <div className="white text5 marginleft2">
            :{emote.name}:
          </div>
        </div>
      </div>
    })

    return (
      <div className="marginleft2 margintop1" style={{ marginTop: possibleEmotes.length > 0 ? -200 : 10 }}>
        <div className="emoteSelector" style={{ display: possibleEmotes.length > 0 ? "block" : "none" }}>
          {emoteList}
        </div>
        <div className="flex">
          <label for="file-input">
            <div className="full alignmiddle chatColor">
              <i className="fa fa-image file-icon"></i>
            </div>
          </label>
          <input id="file-input" className="hide" onChange={this.handleFile} type='file' name="fileUploaded"/>
          <form onSubmit={this.handleSubmit} className="full">
            <input className="input-message chatColor" type="text" value={this.state.message} placeholder="Message..." required={true} onChange={this.handleChange}/>
          </form>
        </div>
      </div>
    );
  }
}