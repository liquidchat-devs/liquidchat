import React from 'react';

export default class CreateChannelDialog extends React.Component {
  state = {
    channelName: "",
    channelDescription: "",
    channelType: 0,
    isNSFW: false,
    channelCreationResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleChangeType = val => {
    this.setState({
      channelType: val,
    });
  }

  handleSwitchNSFW = () => {
    this.setState({
      isNSFW: !this.state.isNSFW,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    const res = await this.props.API.API_createChannel({
      server: { id: this.props.state.selectedServer },
      name: this.state.channelName, 
      type: this.state.channelType,
      description: this.state.channelDescription,
      nsfw: this.state.isNSFW
    });
    this.setState({
      channelCreationResult: res,
    });
    
    if(isNaN(res)) { this.props.functions.switchDialogState(-1); }
    return true;
  }

  getErrorText(code) {
    switch(code) {
      case -1:
        return "Channel name is too short-";

      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">Create new channel-</div>
          <form onSubmit={this.handleSubmit} className="margintop1">
            <div className="flex">
              <input className="inputfield1 inputfield2 marginleft2" name="channelName" type="text" placeholder="Name..." required={true} onChange={this.handleChange} />
              <div className="inputfieldPrefix tooltipColor text3">{this.state.channelType === 1 ? "." : "#"}</div>
              <br />
              <div className="aligny marginleft2b" style={{ width: "50%" }}>
                <div className={this.state.channelType === 0 ? "button2 hover alignmiddle chatColor" : "button2 hover alignmiddle"} onClick={(e) => { this.handleChangeType(0); }}>
                  <p className="white text1">Text</p>
                </div>
                <div className={this.state.channelType === 1 ? "button2 hover alignmiddle chatColor" : "button2 hover alignmiddle"} onClick={(e) => { this.handleChangeType(1); }}>
                  <p className="white text1">Voice</p>
                </div>
              </div>
            </div>
            <div className="flex margintop1">
              <input className="inputfield1 inputfield2c marginleft2" name="channelDescription" type="text" placeholder="Description..." required={true} onChange={this.handleChange} />
            </div>
            <div className="flex margintop1">
              <div className="aligny marginleft2" style={{ width: "25%" }}>
                  <div className="button2 hover alignmiddle chatColor" onClick={(e) => { this.handleSwitchNSFW(); }}>
                    <p className="white text1">{this.state.isNSFW === true ? "NSFW" : "SFW"}</p>
                  </div>
                </div>
            </div>
          </form>
          <div className="alignmiddle margintop1" style={{ height: 40 }}>
            <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Create!</div>
          </div>
          {
            (this.getErrorText(this.state.channelCreationResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.channelCreationResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}