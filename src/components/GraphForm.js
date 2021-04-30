/**
 * This component requests hostnames from the API
 * and fills domains based on the chosen hostname
 * and will then toggle the graph component to query 
 * all docs based off hostname and domain
 * 
 * Author:
 * Nicholas Prussen
 */

import React from 'react';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import Graph from './Graph.js';
import '../css/GraphForm.css';
import MachineNames from '../json/machine_names.json';
import { flask_url } from "../index.js";

/**
 * This renders out the form that queries for graph configuration
 */
class Form extends React.Component {

    /**
     * Graph form constructor
     * @param {props} props 
     */
    constructor(props) {
        super(props);

        //global state vars
        this.state = {
            isLoaded: false,
            selectionConfiguration: {},
            selectedHostname: "",
            selectedDomain: "",
            hostnameSelected: false,
            domainSelected: false,
            formFilled: false,
            auto_entry: true,
            manual_entry: false,
            hostnameList: [],
            domainList: [],
            error: null,
        }
    }

    //executes on page load
    //used to fill hostnames selection menu
    componentDidMount() {
        //fetch hostnames from flask
        fetch(flask_url + '/gethostnames').then(res => res.json())
            .then(
                (data) => {

                    var finalHostnameList = []

                    //This checks the list of known machine names to combine
                    //compute nodes having a different hostname
                    for(var i = 0; i < data.hostnames.length; i++){
                        var foundInList = false;
                        for(var key in MachineNames){
                            if(data.hostnames[i].includes(MachineNames[key]["hostname"])){
                                foundInList = true;
                                if(!finalHostnameList.includes(MachineNames[key]["hostname"])){
                                    finalHostnameList.push(MachineNames[key]["hostname"]);

                                }
                            }
                        }

                        if(!foundInList){
                            finalHostnameList.push(data.hostnames[i]);
                        }
                    }

                    this.setState({
                        hostnameList: finalHostnameList,
                        isLoaded: true
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: false,
                        error
                    })
                }
            )
    }

    /**
     * Takes a hostname and queries flask for list of domains associated
     * @param {string} e 
     */
    fetchRuns(e) {
        fetch(flask_url + "/getdomainsbyhostname", {
            method: "POST",
            cache: "no-cache",
            headers: {
                "content_type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify({
                'hostname': e['value']
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ domainList: responseJson.domains });
            });
    }

    /**
     * This fills the select field with hostnames queried
     */
    fillSelectHostnames() {
        if (this.state.isLoaded) {
            return this.state.hostnameList.map(hostname => ({ label: hostname, value: hostname }));
        }
    }

    /**
     * This fills the select field with domain names connected to hostname
     */
    fillSelectDomains() {
        if (this.state.hostnameSelected) {
            return this.state.domainList.map(domain => ({ label: domain, value: domain }));
        }
    }

    /**
     * This takes the hostname picked and sets the state
     * @param {props} e 
     */
    handleSelectedHostname = (e) => {
        this.setState({
            selectedHostname: e['value'],
            hostnameSelected: true,
            selection: "",
            selectedDomain: "",
        });
        //fetch the runs that apply to hostname
        this.fetchRuns(e);
    }

    /**
     * This handles the selected domain
     * @param {props} e 
     */
    handleSelectedDomain = (e) => {
        this.setState({
            selectedDomain: e['value'],
            domainSelected: true,
            selection: e
        });
    }

    /**
     * This handles the submit button action and
     * will flag if form isn't correctly filled
     * @param {props} e 
     */
    submitForm = (e) => {
        //make sure a hostname and domain were selected
        if (this.state.auto_entry) {
            if (this.state.selectedHostname && this.state.selectedDomain && this.state.selection !== "") {
                //make sure to hide the error if visible
                document.getElementById("incomplete-form-error").style.display = "none";

                //var used for sending data to flask
                var selectionConfiguration = {
                    'hostname': this.state.selectedHostname,
                    'runname': this.state.selectedDomain
                };

                //set state vars
                this.setState({
                    formFilled: true,
                    selectionConfiguration: selectionConfiguration
                });

            } else {
                //show error if button pushed and form not filled out
                document.getElementById("incomplete-form-error").style.display = "block";
            }
        } else if (this.state.manual_entry) {
            if (this.state.selectedHostname !== "" && this.state.selectedDomain !== "") {
                document.getElementById("incomplete-form-error").style.display = "none";

                // var selectionConfiguration = {
                //     'hostname': this.state.selectedHostname,
                //     'runname': this.state.selectedDomain,
                //     'wilcard': true,
                // }

                this.setState({
                    formFilled: true,
                    selectionConfiguration: {
                        'hostname': this.state.selectedHostname,
                        'runname': this.state.selectedDomain,
                        'wilcard': true,
                    }
                })
            } else {
                //show error if button pushed and form not filled out
                document.getElementById("incomplete-form-error").style.display = "block";
            }
        }

    }

    /**
     * This handles switching from list of auto generated hostnames
     * to manual entry
     * @param {*} e 
     */
    switchEntryMode = (e) => {
        if (this.state.auto_entry) {
            this.setState({
                auto_entry: false,
                manual_entry: true,
                selectedHostname: "",
                selectedDomain: "",
                selection: "",
                formFilled: false,
            });
            document.getElementById("switchEntryMode").innerHTML = "Switch to Auto-Entry Mode";
        } else {
            this.setState({
                auto_entry: true,
                manual_entry: false,
                selectedHostname: "",
                selectedDomain: "",
                formFilled: false,
            });
            document.getElementById("switchEntryMode").innerHTML = "Switch to Manual Entry Mode";
        }
    }

    /**
     * This handles the manual entry of hostnames
     * @param {*} e 
     */
    handleEntry = (e) => {
        var hostname = document.getElementById("hostnameInputText").value;
        var domain = document.getElementById("domainInputText").value;
        this.setState({
            selectedHostname: hostname,
            selectedDomain: domain,
            hostnameSelected: true,
            domainSelected: true,
        });
    }

    /**
     * render out the graph form
     */
    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col">
                        <div className="custom-control custom-switch button-margin-25">
                            <input type="checkbox" className="custom-control-input" id="customSwitch" onChange={this.switchEntryMode}></input>
                            <label id="switchEntryMode" className="custom-control-label" htmlFor="customSwitch">Manual Entry Mode</label>
                        </div>
                        {(this.state.auto_entry &&
                            <div id="auto-form-holder">
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="hostnameInput">Select a hostname</label>
                                        <Select id="hostnameInput" options={this.fillSelectHostnames()} onChange={this.handleSelectedHostname} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="domainInput">Select a domain</label>
                                        <Select id="domainInput" options={this.fillSelectDomains()} onChange={this.handleSelectedDomain} value={this.state.selection} />
                                    </div>
                                </form>
                                <p id="incomplete-form-error" className="text-danger form-danger-text">Please select a hostname and domain</p>
                            </div>
                        )}
                        {(this.state.manual_entry &&
                            <div id="manual-form-holder">
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="hostnameInputText">Enter a hostname (partial match works)</label>
                                        <input id="hostnameInputText" type="text" className="form-control" placeholder="ex. r2.boisestate.edu" onChange={this.handleEntry}></input>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="domainInputText">Enter a domain name (case sensitive)</label>
                                        <input id="domainInputText" type="text" className="form-control" placeholder="ex. conus_tfg" onChange={this.handleEntry}></input>
                                    </div>
                                </form>
                                <p id="incomplete-form-error" className="text-danger form-danger-text">Please enter a hostname and domain</p>
                            </div>
                        )}
                    </div>
                    <div className="col">
                        <div className="card card-form-height float-right">
                            <div className="card-body">
                                <h5 className="card-title">Selected Configuration</h5>
                                <hr className="my-4"></hr>
                                <ul className="list-group">
                                    <li className="list-group-item">
                                        <p className="card-text bold">Hostname: </p> <p>{this.state.selectedHostname}</p>
                                    </li>
                                    <li className="list-group-item">
                                        <p className="card-text bold">Domain: </p> <p>{this.state.selectedDomain}</p>
                                    </li>
                                </ul>
                                <button className="btn btn-primary button-margin-25" onClick={this.submitForm}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="margin-top-100">
                    {this.state.formFilled && (<Graph selectionConfiguration={this.state.selectionConfiguration} />)}
                </div>
            </div>

        )
    }
}

export default Form;


