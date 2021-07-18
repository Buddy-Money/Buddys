import Donator from '../abis/Donator.json'
import React, { Component } from 'react';
import Identicon from 'identicon.js';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {

  async componentWillMount() {
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
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = Donator.networks[networkId]
    if(networkData) {
      const donator = new web3.eth.Contract(Donator.abi, networkData.address)
      this.setState({ donator })
      const donationRequestsCount = await donator.methods.donationRequestsCount().call()
      this.setState({ donationRequestsCount })

      for (var i = 1; i <= donationRequestsCount; i++) {
        const donationRequest = await donator.methods.donationRequests(i).call()
        this.setState({
          donationRequests: [...this.state.donationRequests, donationRequest]
        })
      }
      // Sort donationRequests. Show highest tipped donationRequests first
      this.setState({
        donationRequests: this.state.donationRequests.sort((a,b) => b.donationAmount - a.donationAmount )
      })
      this.setState({ loading: false})
    } else {
      window.alert('Donator contract not deployed to detected network.')
    }
  }

  captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
    }
  }

  uploadDonationRequest = description => {
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.donator.methods.uploadDonationRequest(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  donate(id, donationAmount) {
    this.setState({ loading: true })
    this.state.donator.methods.donate(id).send({ from: this.state.account, value: donationAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      donator: null,
      donationRequests: [],
      loading: true
    }

    this.uploadDonationRequest = this.uploadDonationRequest.bind(this)
    this.donate = this.donate.bind(this)
    this.captureFile = this.captureFile.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              donationRequests={this.state.donationRequests}
              captureFile={this.captureFile}
              uploadDonationRequest={this.uploadDonationRequest}
              donate={this.donate}
            />
        }
      </div>
    );
  }
}

export default App;