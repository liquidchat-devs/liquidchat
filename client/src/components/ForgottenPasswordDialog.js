import React from 'react';

export default class ForgottenPasswordDialog extends React.Component {
  state = {
    state: 0,
    code: "",
    passwordRecoveryResult: 0
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = async e => {
    e.preventDefault();
    /*const res = await this.props.API.API_editUser(this.state.email);
    this.setState({
      accountEditResult: res,
    });
    
    if(res === 1) { this.props.functions.switchDialogState(-1); }*/
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
          <div className="white text3 marginleft2b margintop1a">Password Recovery</div>
          {this.state.state === 1 ?
            <div>
              <form onSubmit={this.handleSubmit} className="flex margintop0b">
                <input className="inputfield1 marginleft2b" name="code" type="text" placeholder="Verification code..." required={true} onChange={this.handleChange} /><br />
              </form>
              <div onClick={this.handleSubmit} className="button button1 marginleft2b" style={{ marginTop: 15 }}>Enter-</div>
              {
                (this.getErrorText(this.state.passwordRecoveryResult).length > 0 ?
                <div className="marginleft2 margintop1 errorColor">
                  {this.getErrorText(this.state.passwordRecoveryResult)}
                </div>
                : "")
              }
            </div>
          :
            <div>
              <div className="marginleft2b" style={{ height: 40 }}>
                <p className="white text5 margintop0 margintop0b" onClick={() => { this.props.functions.switchDialogState(14); }}>To recover your account enter a code that was sent to your email-</p>
              </div>
              <div className="button button1 marginleft2b" style={{ marginTop: 15 }} onClick={() => { this.setState({ state: 1 }) }}>I'm ready!</div>
              {
                (this.getErrorText(this.state.passwordRecoveryResult).length > 0 ?
                <div className="marginleft2 margintop1 errorColor">
                  {this.getErrorText(this.state.passwordRecoveryResult)}
                </div>
                : "")
              }
            </div>
          }
        </div>
      </div>
    );
  }
}