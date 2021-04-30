/**
 * This component uses a provided
 * ObjectID to query a document
 * from the database and display it
 * 
 * Author:
 * Nicholas Prussen
 */

import React from 'react';
import ReactJson from 'react-json-view';
import '../css/DocumentViewer.css';
import { flask_url } from "../index.js";

/**
 * This provides a rendered view of a document provided an objectID
 */
class DocumentViewer extends React.Component {
    /**
     * constructor
     * @param {props} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            documentID: this.props.documentID,
            documentData: {},
            run_information: {},
            timing_csv: {},
            pfmetadata: {},
            docInfoGotten: false,
            documentError: false,
        }
        //this.fetchDoc(this.props.documentID);
    }

    componentDidMount(){
        this.fetchDoc(this.props.documentID);
    }

    /**
     * Check for props change and update document
     * @param {prevProps} prevProps 
     */
    componentDidUpdate(prevProps) {
        //check if props changed
        if (prevProps.documentID !== this.props.documentID) {
            this.fetchDoc(this.props.documentID);
        }
    }

    /**
     * this takes an object id and returns a full json doc
     * associated with that id
     * @param {string} e 
     */
    fetchDoc(e) {
        this.setState({
            documentID: e,
        });
        fetch(flask_url + "/getdocumentbyid", {
            method: "POST",
            cache: "no-cache",
            headers: {
                "content_type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify({
                'docID': e
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    documentData: responseJson,
                },
                    this.constructDocViewer({ documentData: responseJson }));
            })
    }

    /**
     * This takes the full mongo document and sets some easy access state variables
     * @param {dictionary} e 
     */
    constructDocViewer(e) {
        //see if mongo set an error condition
        if (!("valid" in e['documentData'])) {

            if ('run_information' in e['documentData']) {
                this.setState({
                    docInfoGotten: true,
                    run_information: e['documentData']['run_information'],
                    timing_csv: e['documentData']['timing_csv'],
                    pfmetadata: e['documentData']['pfmetadata'],
                    hostname: e['documentData']['run_information']['system_information']['hostname'],
                    domain: e['documentData']['run_information']['run_specifications']['domain'],
                    runDate: e['documentData']['run_date'],
                    versionNumber: e['documentData']['pfmetadata']['parflow']['build']['version'],
                    solverConfig: e['documentData']['run_information']['run_specifications']['solver_config'],
                    processorTopology: e['documentData']['run_information']['run_specifications']['processor_topology'],
                    timesteps: e['documentData']['run_information']['run_specifications']['timesteps'],
                    runtime: e['documentData']['timing_csv']['Total Runtime']['time_sec'],
                    runStatus: e['documentData']['run_information']['run_specifications']['test_results'],
                });
            } else {
                this.setState({
                    docInfoGotten: true,
                    timing_csv: e['documentData']['timing_csv'],
                    pfmetadata: e['documentData']['pfmetadata'],
                    runDate: e['documentData']['run_date'],
                    versionNumber: e['documentData']['pfmetadata']['parflow']['build']['version'],
                    runtime: e['documentData']['timing_csv']['Total Runtime']['time_sec'],
                });
            }


        } else {
            //set error if error condition found
            this.setState({
                documentError: true,
            });
        }
    }

    /**
     * render the document viewer component
     */
    render() {
        if (this.state.docInfoGotten) {
            return (
                <div className="container">
                    <div className="row margin-top-30">
                        <div className="col">
                            <ul id="data-list" className="list-group">
                                <li className="list-group-item li-item-title">
                                    <p className="bold">Relevant Information</p>
                                </li>
                                <li className="list-group-item">
                                    <p className="bold">ObjectID: </p><p>{this.state.docInfoGotten && this.state.documentID}</p>
                                </li>
                                <li className="list-group-item">
                                    <p className="bold">Hostname: </p><p>{this.state.docInfoGotten && this.state.hostname}</p>
                                </li>
                                <li className="list-group-item">
                                    <p className="bold">Domain: </p><p>{this.state.docInfoGotten && this.state.domain}</p>
                                </li>
                                <li className="list-group-item">
                                    <p className="bold">Solver Config: </p>{this.state.docInfoGotten && this.state.solverConfig}<p></p>
                                </li>
                                <li className="list-group-item">
                                    <p className="bold">Run Date: </p><p>{this.state.docInfoGotten && this.state.runDate}</p>
                                </li>
                                <li className="list-group-item">
                                    <p className="bold">Version Number: </p>{this.state.docInfoGotten && this.state.versionNumber}<p></p>
                                </li>
                                <li className="list-group-item">
                                    <p className="bold">Processor Topology: </p>{this.state.docInfoGotten && this.state.processorTopology}<p></p>
                                </li>
                                <li className="list-group-item">
                                    <p className="bold">Timesteps: </p>{this.state.docInfoGotten && this.state.timesteps}<p></p>
                                </li>
                                <li className="list-group-item">
                                    <p className="bold">Runtime (in seconds): </p>{this.state.docInfoGotten && this.state.runtime}<p></p>
                                </li>
                                <li className="list-group-item">
                                    <p className="bold">Run Status: </p>{this.state.docInfoGotten && this.state.runStatus}<p></p>
                                </li>
                            </ul>
                        </div>
                        <div className="col">
                            <ul id="data-list" className="list-group">
                                <li className="list-group-item">
                                    <p className="bold">run_information</p>
                                </li>
                                <li className="list-group-item">
                                    {this.state.docInfoGotten && (<ReactJson
                                        name={false}
                                        displayObjectSize={false}
                                        displayDataTypes={false}
                                        enableClipboard={false}
                                        src={this.state.run_information}
                                        collapsed={true}
                                    />)
                                    }
                                </li>
                            </ul>
                            <ul id="data-list" className="list-group margin-top-30">
                                <li className="list-group-item">
                                    <p className="bold">pfmetadata</p>
                                </li>
                                <li className="list-group-item">
                                    {this.state.docInfoGotten && (<ReactJson
                                        name={false}
                                        displayObjectSize={false}
                                        displayDataTypes={false}
                                        enableClipboard={false}
                                        src={this.state.pfmetadata}
                                        collapsed={true}
                                    />)
                                    }
                                </li>
                            </ul>
                            <ul id="data-list" className="list-group margin-top-30">
                                <li className="list-group-item">
                                    <p className="bold">timing_csv</p>
                                </li>
                                <li className="list-group-item">
                                    {this.state.docInfoGotten && (<ReactJson
                                        name={false}
                                        displayObjectSize={false}
                                        displayDataTypes={false}
                                        enableClipboard={false}
                                        src={this.state.timing_csv}
                                        collapsed={true}
                                    />)
                                    }
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        } else {
            if (this.state.documentError) {
                return (
                    <p className="text-danger">Invalid ObjectId</p>
                )
            } else {
                return (
                    <div></div>
                )
            }

        }

    }
}

export default DocumentViewer;