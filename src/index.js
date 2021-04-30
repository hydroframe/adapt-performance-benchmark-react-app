/**
 * This is the main hub that will switch
 * between pages based on user input
 * 
 * Author:
 * Nicholas Prussen
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import GraphForm from './components/GraphForm.js';
import LandingPage from './components/LandingPage.js';
import ObjectIdForm from './components/ObjectIdForm.js';
import './css/index.css';
import logo from './img/adapt-icon-200x200.png';

export const flask_url = "https://tuolumne.princeton.edu/testapp";

/**
 * This is the main component of the benchmark results website.
 */
class App extends Component {

  /**
   * Constructor for the app
   * @param {props} props 
   */
  constructor(props) {
    super(props);

    this.state = {
      pageActive: "landingPage",
    };
  }

  /**
   * Takes a string from child components to change the active page
   * @param {string} paramClicked 
   */
  changePageState = (paramClicked) => {
    this.setState({
      pageActive: paramClicked
    });
  }

  /**
   * Handle home redirects by just reloading the page
   */
  forceReload() {
    window.location.reload();
  }

  /**
   * Changes to graph view
   * @param {props} e 
   */
  changeToGraphView=(e)=>{
    this.setState({
      pageActive: 'graphForm'
    });
  }

  /**
   * Changes to doc view
   * @param {props} e 
   */
  changeToDocumentView=(e)=>{
    this.setState({
      pageActive: 'documentViewer'
    });
  }


  /**
   * Render the main component
   */
  render() {
    //assign local var for calling function in children
    var changePageState = this.changePageState;

    return (
      <div className="root" id="root">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-xl">
            <a className="navbar-brand" href="" onClick={this.forceReload}>
              <img src={logo} width="35" height="35" alt="Adapt Lab"></img>
            </a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
              aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link" href="#" onClick={this.changeToGraphView}>Graph by Hostname<span className="sr-only">(current)</span></a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#" onClick={this.changeToDocumentView}>Lookup by ObjectID</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div id="root-index-container">{this.state.pageActive === "landingPage" && (<LandingPage changePageState={changePageState.bind(this)} />)}</div>
        <div id="root-index-container">{this.state.pageActive === "graphForm" && (<GraphForm />)}</div>
        <div id="root-index-container">{this.state.pageActive === "documentViewer" && (<ObjectIdForm />)}</div>
      </div>
    );
  }
}

export default App;
ReactDOM.render(<App />, document.getElementById('root'));
