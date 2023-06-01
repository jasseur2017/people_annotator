import React, { Component } from "react";
import Axios from 'axios';
import "./Dashboard.css";
import PlotBox from "./PlotBox";
import PlotPolyline from "./PlotPolyline";
import Classes from "./Classes";
import Storage from "./Storage";
import Filenames from "./Filenames";


class Dashboard extends Component {

    state = {
        task: null,
        labels: [],
        imageName: null,
        annotations: [],
        clicked: null,
        newShape: null,
        toStore: false
    }

    setAppState = (state) => {
        this.setState(state)
    }

    getConfigurations() {
        Axios.get(
            "http://" + process.env.REACT_APP_BACKEND_IP_ADDRESS + ":" +
            process.env.REACT_APP_BACKEND_PORT + "/get_configurations"
        ).then((res) => {
            this.setState({ task: res.data["task"], labels: res.data["labels"] })
        }).catch(err => {
            console.log(err)
        });
    }

    componentDidMount() {
        this.getConfigurations()
    }

    render() {
        return (
            <div style={{ "display": "flex" }}>
                <div>
                    <div style={{ "width": 800 }}>
                        {this.state.task === "object detection"?
                        <PlotBox state={this.state} setAppState={this.setAppState} />:
                        this.state.task === "polyline detection"?
                        <PlotPolyline state={this.state} setAppState={this.setAppState} />:
                        <div/>
                        }
                    </div>
                    <br/>
                    <div>
                        <Classes state={this.state} setAppState={this.setAppState} />
                    </div>
                    <br/>
                    <div>
                        <Storage state={this.state} setAppState={this.setAppState} />
                    </div>
                </div>
                <div style={{ "width": 200 }}>
                    <Filenames state={this.state} setAppState={this.setAppState}/>
                </div>
            </div>
        );
    }
}

export default Dashboard;
