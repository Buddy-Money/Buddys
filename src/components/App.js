import React, { Component } from 'react';
import NavbarComponent from './NavbarComponent'
import './App.css';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

class App extends Component {

  render() {
    return (
      <div>
        <NavbarComponent/>
      </div>
    );
  }
}

export default App;