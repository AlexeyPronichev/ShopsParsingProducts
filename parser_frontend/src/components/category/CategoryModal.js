import { Component } from "react";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

class CategoryModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            categoryName: "",
            categoryRawSearchTerms: "",
        }

        this.saveCategory = this.saveCategory.bind(this);
        this.updateCategory = this.updateCategory.bind(this);
    }

    render() {

        return (
            <Modal
                {...this.props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        <Form>
                            <Form.Control placeholder="Название категории" onChange={(e) => this.setState({ categoryName: e.target.value })} value={this.state.categoryName} />
                        </Form>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Control as="textarea" rows={7} placeholder="Введите поисковые запросы (разделять Enter'ом)"
                            onChange={(e) => this.setState({ categoryRawSearchTerms: e.target.value })} value={this.state.categoryRawSearchTerms} />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {this.props.category !== null ?
                        <Button type="button" onClick={() => this.updateCategory()}>Обновить</Button> :
                        <Button type="button" onClick={() => this.saveCategory()}>Сохранить</Button>
                    }
                </Modal.Footer>
            </Modal>
        );
    }

    componentDidUpdate(prevProps) {

        if (prevProps.category !== this.props.category && this.props.category !== null) {
            this.setState({
                categoryName: this.props.category.categoryName,
                categoryRawSearchTerms: this.props.category.categorySearchTerms.join('\n')
            })
        }
        /* Я в любом случае буду это переписывать */
        if (this.props.category === null && prevProps.category !== this.props.category) {
            this.setState({
                categoryName: "",
                categoryRawSearchTerms: ""
            })
        }
    }

    updateCategory() {
        const categoryObject = {
            id: this.props.category.id,
            categoryName: this.state.categoryName,
            categorySearchTerms: this.state.categoryRawSearchTerms.split(/\r?\n/),
        }

        this.props.onEdit(categoryObject);
        this.props.onHide();
    }

    saveCategory() {
        let categoryObject = {
            categoryName: this.state.categoryName,
            categorySearchTerms: this.state.categoryRawSearchTerms.split(/\r?\n/),
        }
        this.setState({
            categoryName: "",
            categoryRawSearchTerms: "",
        })
        
        this.props.onSave(categoryObject);
        this.props.onHide();
    }
}

export default CategoryModal;