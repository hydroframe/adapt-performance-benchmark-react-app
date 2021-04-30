/**
 * This component is where users
 * will choose to link to either look
 * up by hostname or by object id
 * 
 * Author:
 * Nicholas Prussen
 */

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/LandingPage.css';

/**
 * This is the landing page that displays on page load
 */
class App extends React.Component {

    /**
     * Construct the landing page
     * @param {props} props 
     */
    constructor(props) {
        super(props);
        this.state = {};
    }

    /**
     * Render out the landing page component
     */
    render() {
        //assign local var for calling upwards
        var changePageState = this.props.changePageState;

        return (
            <div className="container-fullwidth">
                <div className="jumbotron">
                    <div className="container">
                        <h1 className="display-4">Parflow Performance Benchmarks</h1>
                        <p className="lead">
                            This site queries benchmark data taken from the Parflow Performance Testing Suite, stored in MongoDB and
                            displays it in a convenient way for the end user.
                    </p>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-sm-6">
                            <div className="card card-custom-hover card-landing-page-height" onClick={() => changePageState('graphForm')}>
                                <div className="card-body">
                                    <h5 className="card-title">Graph by Hostname</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">Curated graph based off system hostname and domain</h6>
                                    <hr className="my-4"></hr>
                                    <p className="card-text">
                                        This option will display a graph of benchmark results plotted by Runtime vs. Version Number and seperated into a series by the core count associated with each run.
                                </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="card card-custom-hover card-landing-page-height" onClick={() => changePageState('documentViewer')}>
                                <div className="card-body">
                                    <h5 className="card-title">Lookup by ObjectID</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">See detailed benchmark data based on specific ObjectId</h6>
                                    <hr className="my-4"></hr>
                                    <p className="card-text">
                                        This option will show detailed run information based off a single selected benchmark as if you selected a single run from the graph option.
                                </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;