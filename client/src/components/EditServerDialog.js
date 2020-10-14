import React from 'react';

export default class EditServerDialog extends React.Component {
  state = {
    serverName: "",
    serverAvatar: -1,
    serverEditResult: 0,
    avatarChangeResult: 0
  };

  componentDidMount = () => {
    const server = this.props.getServer(this.props.selectedServer);
    if(server !== undefined) {
      this.setState({
        serverName: server.name
      })
    }
  }

  handleAvatar = async (box, e) => {
    if(e.target.files.length < 1) { return; }
    
    var file = e.target.files[0];
    e.target.value = ""
    this.setState({
      serverAvatar: file,
    });

    var reader = new FileReader();
    reader.onload = function(e) {
      box.refs["serverImage"].src = e.target.result;
    }
    reader.readAsDataURL(file);
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    let res = await this.props.API.API_editServer(this.props.selectedServer, this.state.serverName);
    this.setState({
      serverEditResult: res,
    });

    if(isNaN(res)) {
      if(this.state.serverAvatar !== -1) {
        res = await this.props.API.API_updateServerAvatar(this.props.selectedServer, this.state.serverAvatar)
        this.setState({
          serverEditResult: res,
        });
      }
    }
    
    if(isNaN(res)) {
      this.props.switchDialogState(-1);
      return true;
    } else {
      this.setState({
        serverEditResult: res,
      });
    }
  }

  getErrorText(code) {
    switch(code) {
      case -2:
        return "You're not this server's author-";

      case -3:
        return "Server name is too short-";

      default:
        return "";
    }
  }

  render() {
    const server = this.props.getServer(this.props.selectedServer);
    if(server === undefined) {
      return null;
    }

    let emotes = []
    server.emotes.forEach(emoteID => {
      if(this.props.emotes.has(emoteID)) {
        server.push(this.props.emotes.get(emoteID));
      }
    })

    let emoteList = emotes.map((emote, i) => {
      return <div key={i} className="emoteImage2 tooltipWrapper">
          <img alt="" className="emoteImage2" src={this.props.fileEndpoint + "/" + emote.file} />
          <span className="tooltipText">:{emote.name}:</span>
        </div>
    }, "")

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox4">
          <div className="white text3 marginleft2 margintop1a">> Edit server-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <img alt="" className="avatar2 marginleft4 marginright2" ref="serverImage" src={this.props.fileEndpoint + "/" + server.avatar} onMouseEnter={() => this.refs["serverEditOverlay"].style = "display: flex;" }/>
            <div className="cropButton alignmiddle" onClick={() => { this.props.setSelectedAvatar(server.avatar); this.props.switchDialogState(19) }}>
                <div className="white text7">Crop</div>
            </div>
            <label for="avatar-input">
              <div className="avatar2 avatarOverlay marginleft4 alignmiddle" ref="serverEditOverlay" onMouseLeave={() => this.refs["serverEditOverlay"].style = "display: none;" }>
                <div className="white text4 nopointer">Change Icon</div>
              </div>
            </label>
            <input id="avatar-input" className="hide" onChange={(e) => this.handleAvatar(this, e) } type='file' name="fileUploaded"/>
            <input className="inputfield1 marginleft2 margintop1" name="serverName" type="text" placeholder="Name..." required={true} value={this.state.serverName} onChange={this.handleChange} /><br />
          </form>
          <div className="white text3 marginleft2b margintop1a">Server Emotes ({emotes.length})</div>
          <div className="flex marginleft2b">
            {emoteList}
            <div className="button2 addEmoteButton alignmiddle chatColor" onClick={() => { this.props.switchDialogState(21); }}>
              +
            </div>
          </div>
          <div className="marginleft2 margintop1" style={{ height: 40 }}>
            <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }} value="vsvsd">Edit!</div>
          </div>
          {
            (this.getErrorText(this.state.serverEditResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.serverEditResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}