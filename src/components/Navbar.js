import React, { Component } from 'react';
import Identicon from 'identicon.js';
import photo from '../photo.png'

class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0 text-center"
          href="https://github.com/baldwinr/Donator"
          target="_blank"
          rel="noopener noreferrer"
        >
          Donator
        </a>
      </nav>
    );
  }
}

export default Navbar;