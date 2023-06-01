import React, { Component } from "react";
import Axios from "axios";
import "./PlotPolyline.css"


class PlotPolyline extends Component {

    canvasRef = React.createRef()
    state = {
        image: null,
        selectedVertex: null,
        selectedEdge: null,
        selectedPolyline: null,
        isDragging: false
    }

    clickRubber(e) {
        // this.props.setAppState({clicked: null})
        const canvas = this.canvasRef.current
        const x = e.pageX - canvas.offsetLeft;
        const y = e.pageY - canvas.offsetTop;
        const ratioX = canvas.width / this.state.image.width
        const ratioY = canvas.height / this.state.image.height
        if (this.props.state.newShape !== null) {
            this.props.state.newShape.push(parseInt(x / ratioX), parseInt(y / ratioY))
        } else if (this.state.selectedPolyline !== null) {
            this.props.setAppState({ clicked: this.state.selectedPolyline })
        } else if (this.state.selectedVertex !== null) {
        } else if (this.state.selectedEdge !== null) {
        } else {
            this.props.setAppState({ clicked: null })
            this.props.state.newShape = [
                parseInt(x / ratioX), parseInt(y / ratioY),
                parseInt(x / ratioX), parseInt(y / ratioY)
            ]
        }
    }

    startRubber(e) {
        if (this.state.selectedVertex !== null) {
            this.props.setAppState({ clicked: this.state.selectedVertex[0] })
            this.setState({ isDragging: true })
        } else if (this.state.selectedEdge !== null) {
            const i = this.state.selectedEdge[0]
            const j = this.state.selectedEdge[1]
            const point = this.props.state.annotations[i].shape.slice(2 * j, 2 * (j + 1))
            const nextPoint = this.props.state.annotations[i].shape.slice(2 * (j + 1), 2 * (j + 2))
            const newPoint = [0.5 * (point[0] + nextPoint[0]), 0.5 * (point[1] + nextPoint[1])]
            this.props.state.annotations[i].shape.splice(2 * (j + 1), 0, ...newPoint)
            this.setState({ selectedVertex: [i, j + 1] })
            this.setState({ selectedEdge: null })
            this.setState({ isDragging: true })
            this.props.setAppState({ toStore: true })
        }
    }

    moveRubber(e) {
        const canvas = this.canvasRef.current
        const x = e.pageX - canvas.offsetLeft;
        const y = e.pageY - canvas.offsetTop;
        const ratioX = canvas.width / this.state.image.width
        const ratioY = canvas.height / this.state.image.height
        if (this.props.state.newShape !== null) {
            this.props.state.newShape[this.props.state.newShape.length - 2] = parseInt(x / ratioX)
            this.props.state.newShape[this.props.state.newShape.length - 1] = parseInt(y / ratioY)
        } else if (this.state.isDragging) {
            const i = this.state.selectedVertex[0]
            const j = this.state.selectedVertex[1]
            this.props.state.annotations[i].shape[2 * j] = parseInt(x / ratioX)
            this.props.state.annotations[i].shape[2 * j + 1] = parseInt(y / ratioY)
            this.props.setAppState({ toStore: true })
        } else {
            this.setState({ selectedVertex: null })
            this.setState({ selectedEdge: null })
            this.setState({ selectedPolyline: null })
            document.body.style.cursor = ""
            const eps = 5
            for (const [i, annotation] of this.props.state.annotations.entries()) {
                let n = annotation.shape.length / 2
                for (let j = 0; j < n; j++) {
                    let point = annotation.shape.slice(2 * j, 2 * (j + 1))
                    if (Math.sqrt((ratioX * point[0] - x) ** 2 + (ratioY * point[1] - y) ** 2) < eps) {
                        this.setState({ selectedVertex: [i, j] })
                        document.body.style.cursor = ""
                        break
                    }
                    if (j < n - 1) {
                        const nextPoint = annotation.shape.slice(2 * (j + 1), 2 * (j + 2))
                        if (Math.sqrt((ratioX * 0.5 * (point[0] + nextPoint[0]) - x) ** 2 +
                            (ratioY * 0.5 * (point[1] + nextPoint[1]) - y) ** 2) < eps) {
                            this.setState({ selectedEdge: [i, j] })
                            document.body.style.cursor = ""
                            break
                        }
                        const det = Math.abs(
                            (ratioX * point[0] - x) * (ratioY * nextPoint[1] - y) -
                            (ratioY * point[1] - y) * (ratioX * nextPoint[0] - x)
                        )
                        const distance = Math.sqrt(
                            (ratioX * point[0] - ratioX * nextPoint[0]) ** 2 +
                            (ratioY * point[1] - ratioY * nextPoint[1]) ** 2
                        )
                        const pointCos = (ratioX * nextPoint[0] - ratioX * point[0]) * (x - ratioX * point[0]) +
                            (ratioY * nextPoint[1] - ratioY * point[1]) * (y - ratioY * point[1])
                        const nextPointCos = (ratioX * point[0] - ratioX * nextPoint[0]) * (x - ratioX * nextPoint[0]) +
                            (ratioY * point[1] - ratioY * nextPoint[1]) * (y - ratioY * nextPoint[1])
                        if (det / distance < eps && pointCos > 0 && nextPointCos > 0) {
                            this.setState({ selectedPolyline: i })
                            document.body.style.cursor = "move"
                            // break
                        }
                    }
                }
            }
        }
        this.drawImage()
    }

    stopRubber(e) {
        this.setState({ isDragging: false })
    }

    pressKey(e) {
        if (e.code === "Delete" && this.state.selectedVertex !== null) {
            const i = this.state.selectedVertex[0]
            const j = this.state.selectedVertex[1]
            if (this.props.state.annotations[i].shape.length > 4) {
                this.props.state.annotations[i].shape.splice(2 * j, 2)
            } else {
                this.props.state.annotations.splice(i, 1)
            }
            this.setState({ selectedVertex: null })
            this.drawImage()
        } else if (e.code === "Delete" && this.props.state.clicked !== null) {
            this.props.state.annotations.splice(this.props.state.clicked, 1)
            this.props.setAppState({ clicked: null })
            this.props.setAppState({ toStore: true })
            // this.drawImage()
        } else if (e.code === "Delete" && this.props.state.newShape !== null) {
            if (this.props.state.newShape.length > 4) {
                this.props.state.newShape.splice(this.props.state.newShape.length - 4, 2)
                this.drawImage()
            } else {
                this.props.setAppState({ newShape: null })
                // this.drawImage()
            }
        } else if (e.code === "Enter" && this.props.state.newShape !== null) {
            if (this.props.state.newShape.length > 4) {
                this.props.state.newShape.splice(this.props.state.newShape.length - 2, 2)
                this.props.state.annotations.push({
                    "shape": this.props.state.newShape,
                    "label": Array(this.props.state.labels.length).fill("")
                })
                this.props.setAppState({ clicked: this.props.state.annotations.length - 1 })
                this.props.setAppState({ toStore: true })
            }
            this.props.setAppState({ newShape: null })
            // this.drawImage()
            // TODO remove polyline with one point
        } else if (e.code === "Escape") {
            this.props.setAppState({ newShape: null })
            this.props.setAppState({ clicked: null })
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
            let n = annotation.shape.length / 2
            for (let j = 0; j < n; j++) {
                let point = annotation.shape.slice(2 * j, 2 * (j + 1))
                ctx.lineTo(ratioX * point[0], ratioY * point[1])
            }
            // TODO
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1
            // if(parseInt(this.props.state.clicked) === i)
            //   ctx.lineWidth = 3
            // else
            //   ctx.lineWidth = 1
            // ctx.closePath();
            // ctx.fillText(
            //   annotation.label.join(" "),
            //   ratioX * (annotation.shape[0].x + 0.5 * annotation.shape[0].y),
            //   ratioY * annotation.shape[0].y - 10
            // )
            ctx.stroke();
            if (this.props.state.clicked === i) {
                ctx.beginPath();
                ctx.fillStyle = "red";
                for (let j = 0; j < n; j++) {
                    let point = annotation.shape.slice(2 * j, 2 * (j + 1))
                    ctx.moveTo(ratioX * point[0], ratioY * point[1])
                    ctx.arc(ratioX * point[0], ratioY * point[1], 3, 0, 2 * Math.PI)
                }
                ctx.fill()
                ctx.beginPath();
                ctx.fillStyle = "white";
                for (let j = 0; j < n; j++) {
                    let point = annotation.shape.slice(2 * j, 2 * (j + 1))
                    if (j < n - 1) {
                        let nextPoint = annotation.shape.slice(2 * (j + 1), 2 * (j + 2))
                        let x = ratioX * 0.5 * (point[0] + nextPoint[0])
                        let y = ratioY * 0.5 * (point[1] + nextPoint[1])
                        ctx.moveTo(x, y)
                        ctx.arc(x, y, 3, 0, 2 * Math.PI)
                    }
                }
                // ctx.closePath();
                ctx.fill()
            }
        });
        if (this.state.selectedVertex !== null) {
            const i = this.state.selectedVertex[0]
            const j = this.state.selectedVertex[1]
            const point = this.props.state.annotations[i].shape.slice(2 * j, 2 * (j + 1))
            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.moveTo(ratioX * point[0], ratioY * point[1])
            ctx.arc(ratioX * point[0], ratioY * point[1], 5, 0, 2 * Math.PI)
            ctx.fill()
        }
        if (this.state.selectedEdge !== null) {
            const i = this.state.selectedEdge[0]
            const j = this.state.selectedEdge[1]
            const point = this.props.state.annotations[i].shape.slice(2 * j, 2 * (j + 1))
            const nextPoint = this.props.state.annotations[i].shape.slice(2 * (j + 1), 2 * (j + 2))
            const newPoint = [0.5 * (point[0] + nextPoint[0]), 0.5 * (point[1] + nextPoint[1])]
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.moveTo(ratioX * newPoint[0], ratioY * newPoint[1])
            ctx.arc(ratioX * newPoint[0], ratioY * newPoint[1], 5, 0, 2 * Math.PI)
            ctx.fill()
        }
        const shape = this.props.state.newShape;
        if (shape !== null) {
            let n = shape.length / 2
            ctx.beginPath();
            ctx.strokeStyle = "red";
            for (let j = 0; j < n; j++) {
                let point = shape.slice(2 * j, 2 * (j + 1))
                ctx.lineTo(ratioX * point[0], ratioY * point[1])
            }
            // ctx.closePath(); // polygon
            ctx.stroke();
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
                Image: {this.props.state.imageName} ; {this.props.state.annotations.length} polylines
                <canvas className="canvas" ref={this.canvasRef} width="700" height="400" />
            </div>
        )
    }
}

export default PlotPolyline;
