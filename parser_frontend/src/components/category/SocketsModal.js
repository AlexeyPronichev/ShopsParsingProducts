import { type } from "@testing-library/user-event/dist/type";
import { Component } from "react";
import { Modal } from "react-bootstrap";

class SocketsModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            total: 0
        }
    }

    componentDidMount() {
        const socket = new WebSocket('ws://127.0.0.1:5000/api/search/ws');

        socket.addEventListener('message', ev => {
            console.log(JSON.parse(ev.data));
            this.setState({ total: JSON.parse(ev.data).count });
            if (JSON.parse(ev.data).status === "success") {
                socket.close();
                this.props.changePage();
            }
        });
    }

    render() {
        return (
            <Modal
                {...this.props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Введётся обработка...
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Обработано {this.state.total}</p>
                </Modal.Body>
            </Modal>
        );
    }
}

export default SocketsModal;