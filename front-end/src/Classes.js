import React, { Component } from "react";
import "./Classes.css"


class Classes extends Component {

    state = {
    }

    changeClasses(e) {
        if (this.props.state.clicked === null && this.props.state.newShape === null)
          return
        const annotations = this.props.state.annotations;
        if (this.props.state.clicked !== null) {
            let i = Object.keys(this.props.state.labels).indexOf(e.target.name)
            annotations[this.props.state.clicked]["label"][i] = e.target.value
            this.props.setAppState({annotations: annotations})
            this.props.setAppState({toStore: true})
        } else if (this.props.state.newShape !== null) {
            let i = Object.keys(this.props.state.labels).indexOf(e.target.name)
            let label = Array(this.props.state.labels.length).fill("")
            label[i] = e.target.value
            const newAnnotation = {
                "shape": this.props.state.newShape, "label": label
            }
            annotations.push(newAnnotation);
            this.props.setAppState({annotations: annotations})
            this.props.setAppState({newShape: null})
            this.props.setAppState({clicked: annotations.length - 1})
            this.props.setAppState({toStore: true})
        }
    }

    componentDidMount() {
    }

    render() {
        return Object.entries(this.props.state.labels).map(([category, classNames], i) => (
            <div className={category} key={category}>{category + ": "}
                {classNames.map(className =>
                    <label key={className}>
                        <input type="radio" name={category} value={className}
                        checked={this.props.state.clicked !== null &&
                            this.props.state.annotations[this.props.state.clicked]["label"][i] === className
                        }
                        onChange={e => this.changeClasses(e)}/>
                        {className + " "}
                    </label>
                )}
            </div>)
        );
    }
}

export default Classes;
