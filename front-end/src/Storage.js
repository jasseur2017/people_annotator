import React, { Component } from 'react';
import Axios from 'axios';
import './Storage.css'


class Storage extends Component {

    state = {
    }

    handleSubmit(e) {
        if (this.props.state.imageName === null) {
            alert("Nothing to submit")
            return
        }
        Axios.post(
            'http://' + process.env.REACT_APP_BACKEND_IP_ADDRESS + ':' +
            process.env.REACT_APP_BACKEND_PORT + '/save_annotations',
            {"image_name": this.props.state.imageName, "annotations": this.props.state.annotations}
        )
            .then((res) => {
                this.props.setAppState({toStore: false})
                alert("Successfully submitted")
            })
            .catch(err => {
                console.log(err)
                alert("Network Error")
            });
    }

    render() {
        return <input type="button" value="Submit" onClick={e => this.handleSubmit(e)}/>
    }
}

export default Storage;