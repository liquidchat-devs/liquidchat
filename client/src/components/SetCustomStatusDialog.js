import React from 'react';

export default class SetCustomStatusDialog extends React.Component {
  state = {
    status: "",
    statusChangeResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    const res = await this.props.API.API_updateCustomStatus(this.state.status);
    this.setState({
        statusChangeResult: res,
    });
    
    if(isNaN(res)) { this.props.switchDialogState(-1); }
    return true;
  }

  getErrorText(code) {
    switch(code) {
      case -1:
        return "Status is too short-";

      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">Set a custom status</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <input className="inputfield1 inputfield2 marginleft2" name="channelName" type="text" placeholder="Status..." required={true} onChange={this.handleChange} />
            <div className="inputfieldPrefix tooltipColor text3">~</div>
            <br />
          </form>
          <div className="margintop1" style={{ height: 40 }}>
            <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Change!</div>
          </div>
          {
            (this.getErrorText(this.state.statusChangeResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.statusChangeResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}