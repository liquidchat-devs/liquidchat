import React from 'react';
import { formatBytes } from './public/scripts/SizeFormatter';

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

    this.handleChange({ target: { value: "" }})
    if(await this.props.API.API_sendMessage(this.state.message)) {
      this.setState({
        message: "",
      });
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

  formatPercentage(in1, in2) {
    if(in1 === 0 || in2 === 0) { return "0%" }
    return Math.round((in1 / in2) * 100) + "%"
  }

  getUploadMessage(fileID, fileName, bytes1, bytes2) {
    if(fileID === -1) {
      return ""
    }

    if(bytes1 === bytes2) {
      return "Upload of " + fileName + " finished-"
    }

    return "Uploading " + fileName + "... " + formatBytes(this.props.uploadReceived) + "/" + formatBytes(this.props.uploadExpected, true) + " (" + this.formatPercentage(this.props.uploadReceived, this.props.uploadExpected) + ")"
  }

  render() {
    let channel = this.props.channels.get(this.props.currentChannel)
    if(channel === undefined || channel.type !== 0) { return null; }

    return (
      <div className="marginleft2 margintop1">
        <div className="white">
          {this.getUploadMessage(this.props.uploadFileID, this.props.uploadFileName, this.props.uploadReceived, this.props.uploadExpected)}
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