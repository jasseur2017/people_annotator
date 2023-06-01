import React, { Component } from 'react';
import Axios from 'axios';
import './Filenames.css'


class Filenames extends Component {

  state = {
    filenames: []
  }

  loadFilenames(init) {
    Axios.get(
      'http://' + process.env.REACT_APP_BACKEND_IP_ADDRESS + ':' +
      process.env.REACT_APP_BACKEND_PORT + '/get_filenames'
    )
      .then((res) => {
        const filenames = this.state.filenames
        filenames.push(...res.data.filenames)
        this.setState({ filenames: filenames })
        // TODO add violet color
        // if (init && this.state.filenames.length > 0)
        //   this.props.setAppState({imageName: this.state.filenames[0]})
      })
      .catch(err => {
        console.log(err)
      });

  }

  selectFilename(e) {
    if (this.props.state.toStore === true){
      if (window.confirm("Annotations will be lost, are sure to continue?")){
        this.props.setAppState({toStore: false})
      } else {
        return
      }
    }
    this.props.setAppState({imageName: e.target.innerText})
    e.target.style.backgroundColor = "violet"
  }

  componentDidMount() {
    this.loadFilenames(true)
  }

  render() {
    return (
      <div>
        <button onClick={e => this.loadFilenames(false)}>Load new files</button>
        <table>
          <thead align="left">
            <tr>
              <th></th>
              <th>Filenames</th>
            </tr>
          </thead>
          <tbody>
            {this.state.filenames.map((v, i) =>
              <tr key={v}>
                <td className="index">{i}</td>
                <td className="content" onClick={e => this.selectFilename(e)}>{v}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Filenames
