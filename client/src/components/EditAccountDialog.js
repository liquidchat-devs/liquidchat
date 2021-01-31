import React from 'react';

export default class EditAccountDialog extends React.Component {
  state = {
    email: "",
    accountEditResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    const res = await this.props.API.API_editUser(this.state.email);
    this.setState({
      accountEditResult: res,
    });
    
    if(res === 1) { this.props.functions.switchDialogState(-1); }
    return true;
  }

  getErrorText(code) {
    switch(code) {
      default:
        return "";
    }
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox">
          <div className="white text3 marginleft2 margintop1a">Manage Account-</div>
          <form onSubmit={this.handleSubmit} className="flex margintop1">
            <input className="inputfield1 marginleft2" name="email" type="text" placeholder="Email..." required={true} onChange={this.handleChange} /><br />
          </form>
          <div onClick={this.handleSubmit} className="button button1" style={{ marginTop: 15, marginLeft: 10 }}>Edit!</div>
          {
            (this.getErrorText(this.state.accountEditResult).length > 0 ?
            <div className="marginleft2 margintop1 errorColor">
              {this.getErrorText(this.state.accountEditResult)}
            </div>
            : "")
          }
        </div>
      </div>
    );
  }
}