import React, { Component } from "react";
import Axios from "axios";
import "./PlotBox.css"


class PlotBox extends Component {

    canvasRef = React.createRef()
    state = {
        image: null,
        selectedEdge: null,
        startPoint: null
    }

    clickRubber(e) {
        this.props.setAppState({ clicked: null })
        const eps = 5
        const canvas = this.canvasRef.current
        const x = e.pageX - canvas.offsetLeft;
        const y = e.pageY - canvas.offsetTop;
        const ratioX = canvas.width / this.state.image.width
        const ratioY = canvas.height / this.state.image.height
        for (const [i, annotation] of this.props.state.annotations.entries()) {
            const dx = ratioX * annotation.shape[2] / 4
            const dy = ratioY * annotation.shape[3] / 4
            const xMin = ratioX * annotation.shape[0]
            const xMax = ratioX * (annotation.shape[0] + annotation.shape[2])
            const yMin = ratioY * annotation.shape[1]
            const yMax = ratioY * (annotation.shape[1] + annotation.shape[3])
            if (
                ((xMin - eps <= x && x < xMin + dx) && (yMin <= y && y <= yMax)) ||
                ((xMax - dx < x && x <= xMax + eps) && (yMin <= y && y <= yMax)) ||
                ((yMin - eps <= y && y < yMin + dy) && (xMin <= x && x <= xMax)) ||
                ((yMax - dy < y && y <= yMax + eps) && (xMin <= x && x <= xMax))
            ) {
                this.props.setAppState({ clicked: i })
                break
            }
        }
    }

    startRubber(e) {
        this.props.setAppState({ newShape: null })
        const eps = 5
        const canvas = this.canvasRef.current
        const x = e.pageX - canvas.offsetLeft;
        const y = e.pageY - canvas.offsetTop;
        const ratioX = canvas.width / this.state.image.width
        const ratioY = canvas.height / this.state.image.height
        if (this.props.state.clicked !== null) {
            const annotation = this.props.state.annotations[this.props.state.clicked]
            const xMin = ratioX * annotation.shape[0]
            const xMax = ratioX * (annotation.shape[0] + annotation.shape[2])
            const yMin = ratioY * annotation.shape[1]
            const yMax = ratioY * (annotation.shape[1] + annotation.shape[3])
            if ((xMin - eps <= x && x <= xMin + eps) && (yMin <= y && y <= yMax)) {
                this.setState({ selectedEdge: "left" })
            } else if ((xMax - eps <= x && x <= xMax + eps) && (yMin <= y && y <= yMax)) {
                this.setState({ selectedEdge: "right" })
            } else if ((yMin - eps <= y && y <= yMin + eps) && (xMin <= x && x <= xMax)) {
                this.setState({ selectedEdge: "top" })
            } else if ((yMax - eps <= y && y <= yMax + eps) && (xMin <= x && x <= xMax)) {
                this.setState({ selectedEdge: "bottom" })
            } else {
                // this.props.setAppState({clicked: null})
            }
        } else {
            this.setState({ startPoint: [x / ratioX, y / ratioY] })
        }
    }

    moveRubber(e) {
        const canvas = this.canvasRef.current
        const x = e.pageX - canvas.offsetLeft;
        const y = e.pageY - canvas.offsetTop;
        const ratioX = canvas.width / this.state.image.width
        const ratioY = canvas.height / this.state.image.height
        if (this.state.selectedEdge !== null) {
            const annotation = this.props.state.annotations[this.props.state.clicked];
            if (this.state.selectedEdge === "left") {
                annotation.shape[2] = annotation.shape[0] + annotation.shape[2] - parseInt(x / ratioX)
                annotation.shape[0] = parseInt(x / ratioX)
            } else if (this.state.selectedEdge === "right") {
                annotation.shape[2] = parseInt(x / ratioX) - annotation.shape[0]
            } else if (this.state.selectedEdge === "top") {
                annotation.shape[3] = annotation.shape[1] + annotation.shape[3] - parseInt(y / ratioY)
                annotation.shape[1] = parseInt(y / ratioY)
            } else if (this.state.selectedEdge === "bottom") {
                annotation.shape[3] = parseInt(y / ratioY) - annotation.shape[1]
            }
            this.props.setAppState({ toStore: true })
            this.drawImage()
        } else if (this.state.startPoint !== null) {
            this.props.setAppState({
                newShape: [
                    parseInt(this.state.startPoint[0]),
                    parseInt(this.state.startPoint[1]),
                    parseInt(x / ratioX - this.state.startPoint[0]),
                    parseInt(y / ratioY - this.state.startPoint[1])
                ]
            })
        }
    }

    stopRubber(e) {
        this.setState({ selectedEdge: null })
        this.setState({ startPoint: null })
        if (this.props.state.clicked !== null) {
            let annotation = this.props.state.annotations[this.props.state.clicked];
            annotation.shape = [
                Math.min(annotation.shape[0], annotation.shape[0] + annotation.shape[2]),
                Math.min(annotation.shape[1], annotation.shape[1] + annotation.shape[3]),
                Math.abs(annotation.shape[2]),
                Math.abs(annotation.shape[3])
            ]
        } else if (this.props.state.newShape !== null) {
            let bbox = this.props.state.newShape
            this.props.state.newShape = [
                Math.min(bbox[0], bbox[0] + bbox[2]),
                Math.min(bbox[1], bbox[1] + bbox[3]),
                Math.abs(bbox[2]),
                Math.abs(bbox[3])
            ]
        }
    }

    pressKey(e) {
        if (e.code === "Delete" && this.props.state.clicked !== null) {
            this.props.state.annotations.splice(this.props.state.clicked, 1)
            this.props.state.clicked = null
            this.props.state.toStore = true
            this.drawImage()
        }
    }

    getImage(imageName) {
        if (imageName == null)
            return;
        const canvas = this.canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.props.setAppState({ clicked: null })
        this.props.setAppState({ newShape: null })
        Axios.get(
            "http://" + process.env.REACT_APP_BACKEND_IP_ADDRESS + ":" +
            process.env.REACT_APP_BACKEND_PORT + "/get_image?image_name=" + imageName
        )
            .then((res) => {
                this.props.setAppState({ imageName: res.data.image_name })
                var img = new Image();
                img.addEventListener("load", e => {
                    this.drawImage()
                });
                img.src = `data:image/png;base64,${res.data.image}`
                this.setState({ image: img })
                this.props.setAppState({ annotations: res.data.annotations })
            })
            .catch(err => {
                console.log(err)
                this.setState({ image: new Image() })
                this.props.setAppState({ annotations: [] })
                alert("Netwrok Error")
            });
    }

    // getColor(idx){
    //   idx = idx * 3;
    //   const color = "rgb(" + (37 * idx) % 255 + "," + (17 * idx) % 255 + "," + (29 * idx) % 255 + ")";
    //   return color;
    // }

    drawImage() {
        const canvas = this.canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // ctx.canvas.width = this.state.image.width
        // ctx.canvas.height = this.state.image.height
        ctx.drawImage(this.state.image, 0, 0, ctx.canvas.width, ctx.canvas.height);
        const ratioX = ctx.canvas.width / this.state.image.width
        const ratioY = ctx.canvas.height / this.state.image.height
        this.props.state.annotations.forEach((annotation, i) => {
            ctx.beginPath();
            ctx.rect(
                ratioX * annotation.shape[0],
                ratioY * annotation.shape[1],
                ratioX * annotation.shape[2],
                ratioY * annotation.shape[3]
            )
            // TODO
            ctx.strokeStyle = "red";
            if (parseInt(this.props.state.clicked) === i)
                ctx.lineWidth = 3
            else
                ctx.lineWidth = 1
            // ctx.closePath();
            ctx.fillText(
                annotation.label.join(" "),
                ratioX * (annotation.shape[0] + 0.5 * annotation.shape[2]),
                ratioY * annotation.shape[1] - 10
            )
            ctx.stroke();
        });
        const bbox = this.props.state.newShape;
        if (bbox !== null) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(ratioX * bbox[0], ratioY * bbox[1], ratioX * bbox[2], ratioY * bbox[3]);
        }
    }

    componentDidMount() {
        const canvas = this.canvasRef.current
        canvas.addEventListener("click", e => this.clickRubber(e))
        canvas.addEventListener("mousedown", e => this.startRubber(e))
        canvas.addEventListener("mousemove", e => this.moveRubber(e))
        canvas.addEventListener("mouseup", e => this.stopRubber(e))
        document.addEventListener("keydown", e => this.pressKey(e))
        this.setState({ image: new Image() })
        this.props.setAppState({ imageName: null })
        this.props.setAppState({ annotations: [] })
        this.props.setAppState({ clicked: null })
        this.props.setAppState({ newShape: null })
        this.props.setAppState({ toStore: false })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.state.imageName !== this.props.state.imageName) {
            this.getImage(this.props.state.imageName)
        }
        else if (prevProps.state.clicked !== this.props.state.clicked ||
            prevProps.state.annotations !== this.props.state.annotations ||
            prevProps.state.newShape !== this.props.state.newShape
        ) {
            this.drawImage()
        }
    }

    render() {
        return (
            <div>
                Image: {this.props.state.imageName} ; {this.props.state.annotations.length} boxes
                <canvas className="canvas" ref={this.canvasRef} width="700" height="400" />
            </div>
        )
    }
}

export default PlotBox;
