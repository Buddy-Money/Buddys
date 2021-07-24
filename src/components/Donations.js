import React, { Component } from 'react';

class Donations extends Component {

  constructor(props) {
    super(props)
    this.state = {
      donations: [],
      web3: null
    }
  }

  render() {
    return (
      <div>
        {
          Array.from(this.props.donations).map((donation, key) => {
            return (<ul key={key} id="donationsList" className="list-group list-group-flush">
              <li key={key} className="list-group-item">
                <small className="float-left mt-1 text-muted">
                  Amount: {this.props.web3.utils.fromWei(donation.amount.toString(), 'Ether')} ETH <br></br>
                  {donation.description}
                </small></li>
            </ul>
            )
          })}
      </div>
    );
  }
}

export default Donations;