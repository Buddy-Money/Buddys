import React, { Component } from 'react';
import Donator from '../../abis/Donator.json'
import Request from '../entities/request/Request.js'
import Donation from '../entities/donation/Donation.js'
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
      requests: [],
      requestsCount: 0,
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
    const web3 = this.state.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = Donator.networks[networkId]

    if (networkData) {
      const donator = new web3.eth.Contract(Donator.abi, networkData.address)
      this.setState({ donator })

      const requestsCount = await donator.methods.requestsCount().call()
      this.setState({ requestsCount })

      const donationsCount = await donator.methods.donationsCount().call()
      this.setState({ donationsCount })

      await this.buildRequestsList()
      await this.buildDonationsList()
      await this.buildDonationsListForEachRequest()

      this.setState({ loading: false })
    }
    else {
      window.alert('Donator contract not deployed to detected network.')
    }
  }

  /*
  * Build the list of Requests from the smart contract.
  */
  async buildRequestsList() {
    for (var i = 1; i <= this.state.requestsCount; i++) {
      const request = await this.state.donator.methods.requests(i).call()
      this.setState({
        requests: [...this.state.requests, request]
      })
    }

    // Filter requests. Only show requests issued by the active account.
    this.setState({
      requests: this.state.requests.filter(request => {
        return request.requester === this.state.account
      })
    })

    // Sort requests. Show requests with the most donations first.
    this.setState({
      requests: this.state.requests.sort((a, b) => b.outstandingDonations - a.outstandingDonations)
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
  }

  /*
  * Build a separate list of Donations for each Request.
  */
  async buildDonationsListForEachRequest() {
    for (var i = 0; i < this.state.requestsCount; i++) {
      const list = await this.buildDonationsByRequestId(i + 1)
      this.setState({
        donationsListsForRequests: [...this.state.donationsListsForRequests, list]
      })
    }
  }

  /*
  * Used to build a list of Donations for a single Request.
  */
  async buildDonationsByRequestId(requestId) {
    let donations = []
    for (var i = 0; i < this.state.donationsCount; i++) {
      if (this.state.donations[i].requestId == requestId) {
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

  handleReceiveDonation(evt) {
    let donationId = evt.target.name
    this.receiveDonation(donationId)
  }

  render() {
    if (this.state.loading) {
      return (<label className="text-center">Loading...</label>)
    }
    else if (this.state.requests.length !== 0) {
      return (
        <Container className="container">

          {this.state.requests.map((request, key) => {
            if (request.active) {
              return (
                <div className="card mb-4" key={key} >

                  <ul id="requestList" className="list-group list-group-flush">
                    <Request
                      request={request}
                      web3={this.state.web3}
                    />

                    {Array.from(this.state.donationsListsForRequests[request.id - 1]).map((donation, key) => {
                      if (donation.active) {
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
                      }
                    })}
                  </ul>
                </div>
              )
            }
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