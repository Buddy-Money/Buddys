import React, { Component } from 'react';

class Request extends Component {

  constructor(props) {
    super(props)
    this.state = {
      request: null,
      web3: null
    }
  }

  render() {
    return (
      <div>
        <div className="card-header">
          <small className="text-muted">
            Receiver Address: {this.props.request.receiverAddress}
          </small>
        </div>
        <li className="list-group-item">
          <p className="text-center">
            <img 
            src={`https://ipfs.infura.io/ipfs/${this.props.request.hash}`} 
            style={{ maxWidth: '800px' }} alt="" />
          </p>
          <p>{this.props.request.description}</p>
          <small className="text-muted">
            Outstanding Donations: {
              window.web3.utils.fromWei(this.props.request.unclaimedDonations.toString(), 'Ether')
            }
            {' '}ETH</small><br></br>
          <small className="text-muted">
            Accepted Donations: {
              window.web3.utils.fromWei(this.props.request.claimedDonations.toString(), 'Ether')
            }
            {' '}ETH</small>
        </li>
      </div>
    );
  }
}

export default Request;