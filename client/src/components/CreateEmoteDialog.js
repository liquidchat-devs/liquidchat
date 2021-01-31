import React from 'react';

export default class CreateEmoteDialog extends React.Component {
  state = {
    emoteName: "",
    emoteAvatar: "defaultAvatar.png",
    emoteCreationResult: 0
  };

  handleAvatar = async (box, e) => {
    if(e.target.files.length < 1) { return; }
    
    var file = e.target.files[0];
    e.target.value = ""
    this.setState({
      emoteAvatar: file,
    });

    var reader = new FileReader();
    reader.onload = function(e) {
      box.refs["emoteImage"].src = e.target.result;
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
    
    let res = -1;
    switch(this.props.type) {
      case 1:
        res = await this.props.API.API_createEmote(this.state.emoteAvatar, this.state.emoteName);
        break;

      case 0:
        res = await this.props.API.API_createServerEmote(this.state.emoteAvatar, this.state.emoteName, this.props.state.selectedServer);
        break;
    }

    this.setState({
      emoteCreationResult: res,
    });
    
    if(isNaN(res)) {
      this.props.functions.switchDialogState(-1);
      return true;
    } else {
      this.setState({
        emoteCreationResult: res,
      });
    }
  }

  getErrorText(code) {
    switch(code) {
      case -1:
        return "Emote name is too short-";

      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">Create new{this.props.type === 0 ? " server" : ""} emote-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <img alt="" className="avatar2 marginleft4 marginright1" ref="emoteImage" src={this.props.state.fileEndpoint + "/defaultAvatar.png"} onMouseEnter={() => this.refs["emoteEditOverlay"].style = "display: flex;" }/>
            <label for="avatar-input">
              <div className="avatar2 avatarOverlay marginleft4 alignmiddle" ref="emoteEditOverlay" onMouseLeave={() => this.refs["emoteEditOverlay"].style = "display: none;" }>
                <div className="white text4 nopointerevents">Change Image</div>
              </div>
            </label>
            <input id="avatar-input" className="hide" onChange={(e) => this.handleAvatar(this, e) } type='file' name="fileUploaded"/>
            <input className="inputfield1 marginleft2 margintop1" name="emoteName" type="text" placeholder="Name..." required={true} onChange={this.handleChange} /><br />
          </form>
          <div className="alignmiddle margintop1" style={{ height: 40 }}>
            <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Create!</div>
          </div>
          {
            (this.getErrorText(this.state.emoteCreationResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.emoteCreationResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}