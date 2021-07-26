import React, { Component } from 'react';
import Donator from '../abis/Donator.json'
import Request from './Request.js'
import Donation from './Donation.js'
import Web3 from 'web3';
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'

class MyRequests extends Component {

  constructor(state) {
    super(state)
    this.state = {
      web3: null,
      account: '',
      donator: null,
      donationRequests: [],
      donationRequestsCount: 0,
      donations: [],
      donationsCount: 0,
      donationsListsForRequests: [],
      loading: true
    }
  }

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
    this.setState({ web3: window.web3 })
  }

  async loadBlockchainData() {
    this.setState({ loading: true })
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = Donator.networks[networkId]

    if (networkData) {
      const donator = new web3.eth.Contract(Donator.abi, networkData.address)
      this.setState({ donator })

      const donationRequestsCount = await donator.methods.donationRequestsCount().call()
      this.setState({ donationRequestsCount })

      const donationsCount = await donator.methods.donationsCount().call()
      this.setState({ donationsCount })

      await this.buildDonationRequestsList()
      await this.buildDonationsList()
      await this.buildDonationsListForEachRequest()

      this.setState({ loading: false })
    }
    else {
      window.alert('Donator contract not deployed to detected network.')
    }
  }

  /*
  * Build the list of DonationRequests from the smart contract.
  */
  async buildDonationRequestsList() {
    for (var i = 1; i <= this.state.donationRequestsCount; i++) {
      const donationRequest = await this.state.donator.methods.donationRequests(i).call()
      this.setState({
        donationRequests: [...this.state.donationRequests, donationRequest]
      })
    }

    // Filter donationRequests. Only show requests issued by the active account.
    this.setState({
      donationRequests: this.state.donationRequests.filter(request => {
        return request.receiverAddress === this.state.account
      })
    })

    // Sort donationRequests. Show requests with the most donations first.
    this.setState({
      donationRequests: this.state.donationRequests.sort((a, b) => b.unclaimedDonations - a.unclaimedDonations)
    })
  }

  /*
  * Build the list of Donations from the smart contract.
  */
  async buildDonationsList() {
    for (var i = 1; i <= this.state.donationsCount; i++) {
      const donation = await this.state.donator.methods.donations(i).call()
      this.setState({
        donations: [...this.state.donations, donation]
      })
    }

    console.log(this.state.donations)
  }

  /*
  * Build a separate list of Donations for each DonationRequest.
  */
  async buildDonationsListForEachRequest() {
    for (var i = 0; i < this.state.donationRequestsCount; i++) {
      const list = await this.buildDonationsByRequestId(i + 1)
      this.setState({
        donationsListsForRequests: [...this.state.donationsListsForRequests, list]
      })
    }
  }

  /*
  * Used to build a list of Donations for a single DonationRequest.
  */
  async buildDonationsByRequestId(donationRequestId) {
    let donations = []
    for (var i = 0; i < this.state.donationsCount; i++) {
      if (this.state.donations[i].donationRequestId == donationRequestId) {
        donations.push(this.state.donations[i])
      }
    }
    return donations
  }

  receiveDonation(donationId) {
    this.setState({ loading: true })
    this.state.donator.methods.receiveDonation(donationId).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  handlereceiveDonation(evt) {
    let donationId = evt.target.name
    this.receiveDonation(donationId)
  }

  render() {
    if (this.state.loading) {
      return (<label className="text-center">Loading...</label>)
    }
    else if (this.state.donationRequests.length !== 0) {
      return (
        <Container className="container">

          {this.state.donationRequests.map((donationRequest, key) => {
            return (
              <div className="card mb-4" key={key} >

                <ul id="donationRequestList" className="list-group list-group-flush">
                  <Request
                    request={donationRequest}
                    web3={this.state.web3}
                  />

                  {Array.from(this.state.donationsListsForRequests[donationRequest.id - 1]).map((donation, key) => {
                    return (<ul key={key} id="donationsList" className="list-group list-group-flush">
                      <li key={key} className="list-group-item">
                        <Donation
                          donation={donation}
                          web3={this.state.web3}
                        />
                        <small>
                          <Button
                            name={donation.id}
                            onClick={(event) => { this.handleReceiveDonation(event) }}>
                            Receive Donation
                          </Button>
                        </small>
                      </li>
                    </ul>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </Container>
      );
    }
    else {
      return (null)
    }
  }
}

export default MyRequests;