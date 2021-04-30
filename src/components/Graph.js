/**
 * This component queries docs based off a
 * provided hostname and domain and
 * will render a graph component
 * 
 * Author:
 * Nicholas Prussen
 */

import React from 'react';
import { Line } from 'react-chartjs-2';
import DocumentViewer from './DocumentViewer.js';
import '../css/Graph.css';
import MachineNames from '../json/machine_names.json';
import { flask_url } from "../index.js";

/**
 * This renders the graph view in the graph form
 */
class Graph extends React.Component {
    /**
     * This constructs the graph object
     * @param {props} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            selectionConfiguration: this.props.selectionConfiguration,
            runDocs: {},
            graphData: {
                'labels': [],
                'datasets': [],
                'pointHitRadius': 1,
                'pointHoverRadius': 1,
                'pointRadius': 1,
            },
            graphCoreLabels: [],
            graphCoreCounts: [],
            documentClicked: false,
            machine_names: MachineNames,
            dataIsEmpty: false,
        };
        //Call this on construct to build an initial graph
        this.fetchDocs(this.props.selectionConfiguration);
    }

    /**
     * This rebuilds the graphs on props change
     * @param {props} prevProps 
     */
    componentDidUpdate(prevProps) {
        //make sure props changed
        if (prevProps.selectionConfiguration !== this.props.selectionConfiguration) {
            //reset graph data
            this.resetGraphData();
            //call function to build graph
            this.fetchDocs(this.props.selectionConfiguration);
        }
    }

    /**
     * This resets the graph data to avoid extra data
     * @param {props} e 
     */
    resetGraphData = (e) => {
        this.setState({
            runDocs: {},
            graphData: {
                'labels': [],
                'datasets': [],
                'pointHitRadius': 1,
                'pointHoverRadius': 1,
                'pointRadius': 1,
            },
            graphCoreCounts: [],
            graphCoreLabels: [],
            documentClicked: false,
            dataIsEmpty: false,
        });
    }

    /**
     * This calls the flask backend to get list of documents to populat graph
     * @param {selectionConfiguration} e 
     */
    fetchDocs(e) {
        fetch(flask_url + "/getdocumentsbyhostnamedomain", {
            method: "POST",
            cache: "no-cache",
            headers: {
                "content_type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify({
                'docParams': e
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    runDocs: responseJson,
                },
                    this.buildGraph({ runDocs: responseJson }));
            })
    }

    /**
     * This takes the dictionary of docs from flask and manipulates it
     * into usable graph data
     * @param {dictionary} runDocs 
     */
    buildGraph(runDocs) {

        if (Object.keys(runDocs['runDocs']).length === 0) {
            this.setState({
                dataIsEmpty: true,
            });
        }

        //Assign labels for all the different core counts
        for (var key in runDocs['runDocs']) {
            if (key === '1') {
                this.state.graphCoreLabels.push('Serial');
            } else {
                this.state.graphCoreLabels.push(key + " Cores");
            }

            if (!this.state.graphCoreCounts.includes(key)) {
                this.state.graphCoreCounts.push(key);
            }
        }

        //extra images that I don't have shapes for
        var badNumImage = new Image(15, 15);
        badNumImage.src = "https://toppng.com/uploads/preview/red-x-red-x-11563060665ltfumg5kvi.png";
        var starImage = new Image(20, 20);
        starImage.src = "https://www.pinclipart.com/picdir/middle/5-50759_druthers-clipart-yellow-star-transparent-background-png-download.png";

        //list of shapes to grab from
        var shapeList = ['rect', starImage, 'triangle', 'rectRounded', 'rectRot', 'circle'];

        //loop through all of the core labels to assign a shape and color
        for (var i = 0; i < this.state.graphCoreLabels.length; i++) {

            //define random color for the points per dataset
            var num1 = parseInt((Math.random() * 255));
            var num2 = parseInt((Math.random() * 255));
            var num3 = parseInt((Math.random() * 255));
            var ranColor = 'rgba(' + num1 + ', ' + num2 + ', ' + num3 + ', 1)';

            //check if still under the allowed amount shapes
            if (i < shapeList.length) {
                //dataset assignment
                this.state.graphData.datasets.push({
                    label: this.state.graphCoreLabels[i],
                    pointStyle: shapeList[i],
                    pointBackgroundColor: ranColor,
                    backgroundColor: ranColor,
                    border: ranColor,
                    radius: 6,
                    pointRadius: 6,
                    data: []
                });
            } //assign all outside of 6 shapes to a red X 
            else {
                //outlier dataset assignment
                this.state.graphData.datasets.push({
                    label: this.state.graphCoreLabels[i],
                    pointStyle: badNumImage,
                    radius: 6,
                    pointRadius: 6,
                    data: []
                });
            }
        }

        //iterate through every individual documents for dataset assignment
        for (key in runDocs['runDocs']) {
            for (var item in runDocs['runDocs'][key]) {

                //get runtime cut down string
                var runtimeInSeconds = runDocs['runDocs'][key][item]['timing_csv']['Total Runtime']['time_sec'];
                var runtimeInMinutes = String(parseFloat(parseFloat(runtimeInSeconds) / 60).toFixed(3));
                //get version seperated from chars
                var currVersion = runDocs['runDocs'][key][item]['pfmetadata']['parflow']['build']['version'];
                var verArray = currVersion.split("-");
                var versionNumberWithV = verArray[0];
                var versionNumber = versionNumberWithV.split("v")[1];

                //get objectid from doc
                var objectID = runDocs['runDocs'][key][item]['_id']['$oid'];

                //get original topology
                var original_topology = runDocs['runDocs'][key][item]['run_information']['run_specifications']['processor_topology']

                //get number of timesteps
                var numOfTimeSteps = runDocs['runDocs'][key][item]['run_information']['run_specifications']['timesteps']

                //fill out all the labels on the x-axis possible
                if (!this.state.graphData.labels.includes(versionNumber)) {
                    this.state.graphData.labels.push(versionNumber);
                }

                //datapoint to be inserted into appropriate dataset
                var dataPoint = {
                    x: versionNumber,
                    y: runtimeInMinutes,
                    objID: objectID,
                    topology: original_topology,
                    timesteps: numOfTimeSteps
                };

                //can probably do this elsewhere, but I need a formatted string for searching
                var idToSearchFor = "";
                if (key === "1") {
                    idToSearchFor = "Serial";
                } else {
                    idToSearchFor = key + " Cores";
                }

                //iterate through available datasets and push datapoint
                for (i = 0; i < this.state.graphData.datasets.length; i++) {
                    var datasetDict = this.state.graphData.datasets[i];
                    if (datasetDict['label'] === idToSearchFor) {
                        datasetDict['data'].push(dataPoint);
                    }
                }
            }
        }
    }

    /**
     * This renders out the graph component
     */
    render() {
        return (
            <div className="container-fullwidth">
                {this.state.dataIsEmpty && <p id="incomplete-form-error" className="text-danger graph-danger-text">No documents found</p>}
                <div>
                    <Line
                        data={this.state.graphData}
                        options={{
                            title: {
                                display: true,
                                text: 'Parflow Runtime vs. Version',
                                fontSize: 36
                            },
                            legend: {
                                display: true,
                                position: "right",
                                label: {
                                    usePointStyle: true
                                }
                            },
                            showLines: false,
                            scales: {
                                xAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Version Number',
                                        fontSize: 24
                                    }
                                }],
                                yAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Runtime (Minutes)',
                                        fontSize: 24
                                    }
                                }],
                            },
                            tooltips: {
                                enabled: true,
                                mode: 'nearest',
                                intersect: true,
                                callbacks: {
                                    beforeLabel: function (tooltipItem, data) {
                                        return 'Version Number: ' +
                                            data.datasets[tooltipItem.datasetIndex].data[0].x +
                                            '\nObjectID: ' + data.datasets[tooltipItem.datasetIndex].data[0].objID +
                                            '\nCore Count: ' + data.datasets[tooltipItem.datasetIndex].label +
                                            '\nProcessor Topology: ' +
                                            data.datasets[tooltipItem.datasetIndex].data[0].topology +
                                            '\nTimesteps: ' +
                                            data.datasets[tooltipItem.datasetIndex].data[0].timesteps;
                                    },
                                    label: function (tooltipItems, data) {
                                        return 'Runtime: ' + tooltipItems.yLabel + ' minutes';
                                    },
                                    title: function (toolTipItem, data) {
                                        return null;
                                    }
                                }
                            },
                            onClick: (evt, item) => {
                                if (!(item === undefined || item.length === 0)) {
                                    var index = item[0]["_datasetIndex"];
                                    var id = item[0]["_chart"].data.datasets[index].data[0].objID;

                                    this.setState({
                                        documentClicked: true,
                                        documentID: id,
                                    });
                                }

                            },
                            hover: {
                                mode: 'nearest',
                                intersect: true
                            }
                        }}
                    />
                    {this.state.documentClicked && <DocumentViewer documentID={this.state.documentID} />}
                    <div className="container-fullwidth bottom-spacer-div"></div>
                </div>
            </div>

        );
    }

}

export default Graph;