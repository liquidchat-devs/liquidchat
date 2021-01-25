import React from 'react';

export default class ImageDialog extends React.Component {
  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
          <img alt="" className="absolutepos overlaybox3" src={this.props.state.selectedImage.link === undefined ? this.props.state.fileEndpoint + "/" + this.props.state.selectedImage.name : this.props.state.selectedImage.link} style={{ width: "auto", height: "auto", maxWidth: "90%", maxHeight: "90%", borderRadius: 0 }} onContextMenu={(e) => { this.props.switchDialogState(9); this.props.setSelectedMessage(undefined, e.pageX, e.pageY); e.preventDefault(); }}/>
          {this.props.isMenuOpen === true ?
            <div className="absolutepos overlaybox2" style={{ left: this.props.state.boxX, top: this.props.state.boxY, height: 40 }}>
            <div className="button2 hover alignmiddle chatColor" onClick={(e) => { this.props.copyID(this.props.state.fileEndpoint + "/" + this.props.state.selectedImage.name); }}>
                <p className="white text1">&gt; Copy Link</p>
            </div>
            <div className="button2 hover alignmiddle chatColor" onClick={() => { window.open(this.props.state.fileEndpoint + "/" + this.props.state.selectedImage.name); }}>
                <p className="white text1">&gt; Open Link</p>
            </div>
            </div>
            : ""
          }
      </div>
    );
  }
}