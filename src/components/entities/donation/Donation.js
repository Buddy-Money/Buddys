import React, { Component } from 'react';

class Donation extends Component {

  constructor(props) {
    super(props)
    this.state = {
      donation: null,
      web3: null
    }
  }

  render() {
    return (
      <div>
        <small className="float-left mt-1 text-muted">
          Amount: {this.props.web3.utils.fromWei(this.props.donation.amount.toString(), 'Ether')} ETH <br></br>
          {this.props.donation.description}
        </small>
      </div>
    );
  }
}

export default Donation;