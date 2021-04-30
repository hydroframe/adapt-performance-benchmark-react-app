/**
 * This component will query a doc from the API
 * based on an ObjectID provided by the user
 * 
 * Author:
 * Nicholas Prussen
 */

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DocumentViewer from './DocumentViewer.js';
import '../css/ObjectIdForm.css';

/**
 * This is the form that takes an ObjectId and returns a document viewer
 */
class Form extends React.Component {

    /**
     * construct the form
     * @param {props} props 
     */
    constructor(props) {
        super(props);

        //global state vars
        this.state = {
            enteredObjId: "",
            formFilled: false,
        }
    }


    /**
     * This handles submission of the objectid lookup form
     * @param {props} e 
     */
    submitForm = (e) => {
        //make sure the form is in a valid state
        if (this.state.validId) {
            //hide error label if visible
            document.getElementById("incomplete-form-error").style.display = "none";

            //get value entered by user
            var enteredId = document.getElementById("objIdInput").value;

            //set state vars
            this.setState({
                formFilled: true,
                finalizedId: enteredId,
            });

        } else {
            //show error message if form incomplete
            document.getElementById("incomplete-form-error").style.display = "block";
        }
    }

    /**
     * This runs everytime the user supplies input
     * @param {props} e 
     */
    handleInput=(e)=>{

        //reset filled var to avoid stuck boolean
        this.setState({
            formFilled: false,
        });

        //grab input value for validity checking
        var enteredId = document.getElementById("objIdInput").value;
        //var for keeping track of validity
        var validId = false;

        //check for conditions for form to be valid
        if(enteredId !== "" && enteredId.length === 24){
            validId = true;
        }
        this.setState({
            validId: validId,
            enteredObjId: enteredId,
        });
    }

    /**
     * render out the object id lookup form
     */
    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col">
                        <form>
                            <div className="form-group">
                                <label htmlFor="objIdInput">Enter an ObjectId</label>
                                <input id="objIdInput" type="text" className="form-control" placeholder="ex. 5f8927d9c0f3395acdf3c8d8" maxLength="24" onChange={this.handleInput}></input>
                            </div>
                        </form>
                        <p id="incomplete-form-error" className="text-danger form-danger-text">Please enter a valid ObjectId</p>
                    </div>
                    <div className="col">
                        <div className="card card-obj-form-height float-right">
                            <div className="card-body">
                                <h5 className="card-title">Selected Configuration</h5>
                                <hr className="my-4"></hr>
                                <ul className="list-group">
                                    <li className="list-group-item">
                                        <p className="card-text bold">ID: </p> <p>{this.state.enteredObjId}</p>
                                    </li>
                                </ul>
                                <button className="btn btn-primary button-margin-25" onClick={this.submitForm}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="margin-top-100">
                    {this.state.formFilled && (<DocumentViewer documentID={this.state.finalizedId} />)}
                </div>
            </div>

        )
    }
}

export default Form;


