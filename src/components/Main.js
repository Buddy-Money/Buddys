import React, { Component } from 'react';
import { InputGroup, FormControl, Button, Container } from 'react-bootstrap'
import './Main.css'

class Main extends Component {

  render() {
    return (
      <Container className="container">

        <p>&nbsp;</p>
        <h2>Request a Donation</h2>
        <form onSubmit={(event) => {
          event.preventDefault()
          const description = this.donationRequestDescription.value
          this.props.uploadDonationRequest(description)
        }} >
          <input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={this.props.captureFile} />
          <div className="form-group mr-sm-2">
            <br></br>
            <input
              id="donationRequestDescription"
              type="text"
              ref={(input) => { this.donationRequestDescription = input }}
              className="form-control"
              placeholder="Share your donation story..."
              required />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg">Submit!</button>
        </form>
        <p>&nbsp;</p>
        {this.props.donationRequests.map((donationRequest, key) => {
          return (
            <div className="card mb-4" key={key} >
              <div className="card-header">
                <small className="text-muted">{donationRequest.author}</small>
              </div>
              <ul id="donationRequestList" className="list-group list-group-flush">
                <li className="list-group-item">
                  <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${donationRequest.hash}`} style={{ maxWidth: '420px' }} /></p>
                  <p>{donationRequest.description}</p>
                </li>
                <li key={key} className="list-group-item py-2">
                  <small className="float-left mt-1 text-muted">
                    TIPS: {window.web3.utils.fromWei(donationRequest.donationAmount.toString(), 'Ether')} ETH
                  </small>
                  <button
                    className="btn btn-link btn-sm float-right pt-0"
                    name={donationRequest.id}
                    onClick={(event) => {
                      let donationAmount = window.web3.utils.toWei('0.1', 'Ether')
                      console.log(event.target.name, donationAmount)
                      this.props.donate(event.target.name, donationAmount)
                    }}
                  >
                    TIP 0.1 ETH
                  </button>
                </li>
                <li className="list-group-item py-2">
                </li>
              </ul>
            </div>
          )
        })}
      </Container>
    );
  }
}

export default Main;