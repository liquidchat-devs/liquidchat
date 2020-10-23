import React from 'react';

export default class RegisterForm extends React.Component {
    state = {
      username: "",
      password: "",
      password2: "",
      clicked: false,
      registerResult: 0
    };
  
    handleChange = e => {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  
    handleSubmit = async e => {
      e.preventDefault();
      const res = await this.props.API.API_register(this.state.username, this.state.password, this.state.password2);
      this.setState({
        registerResult: res,
      });
    }
  
    getErrorText(code) {
      switch(code) {
        case -2:
          return "Passwords don't match-";
  
        case -1:
          return "Username already taken-";
  
        default:
          return "";
      }
    }
  
    render(){
      const form = (
        <form onSubmit={this.handleSubmit}  >
          <input className="inputfield1" name="username" type="text" autoComplete="username" placeholder="Username..." required={true} onChange={this.handleChange}  /><br />
          <input className="inputfield1 margintop1" name="password" type="password" autoComplete="current-password" placeholder="Password..." required={true} onChange={this.handleChange}  /><br />
          <input className="inputfield1 margin1" name="password2" type="password" autoComplete="current-password" placeholder="Repeat password..." required={true} onChange={this.handleChange}  />
        </form>
        );
      return (
        <div>
          <div className="absolutepos overlaybg"></div>
          <div className="absolutepos overlaybox0">
            <div style={{ width: "100%", padding: 24 }}>
              <div className="aligny marginbot2" style={{ height: 45 }}>
                <img alt="" className="avatar6 marginright2" src={this.props.fileEndpoint + "/defaultAvatar.png"}/>
                <div className="text0" style={{color: "white"}}>Register</div>
              </div>
              {form}
              <div className="margintop1" style={{ height: 40 }}>
                <div onClick={this.handleSubmit} className="button button1">Register!</div>
              </div>
              <div className="margintop1" style={{ height: 5 }}></div>
              <p className="text5 marginbot0 margintop0 link" onClick={() => { this.props.switchFormState(); }}>Login?</p>
              {
                (this.getErrorText(this.state.registerResult).length > 0 ?
                <div className="margintop1 errorColor textcenter">
                  {this.getErrorText(this.state.registerResult)}
                </div>
                : "")
              }
            </div>
          </div>
        </div>
      );
    }
}