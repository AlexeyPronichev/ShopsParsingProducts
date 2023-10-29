import { Component } from "react";

import NavBar from "../NavBar";
import CategoryModal from "./CategoryModal";
import CategoryCard from "./CategoryCard";

import { Button, Col, Container, Row } from "react-bootstrap";
import axios from "axios";
import SocketsModal from "./SocketsModal";

class CategoryPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            showStatus: false,
            categories: [],
            editCategory: null,
        }



        this.showModal = this.showModal.bind(this);
        this.saveCategory = this.saveCategory.bind(this);
        this.deleteCategory = this.deleteCategory.bind(this);
        this.startProcessing = this.startProcessing.bind(this);
        this.changePage = this.changePage.bind(this);
        this.loadCategories = this.loadCategories.bind(this);
        this.editCategory = this.editCategory.bind(this);

        this.loadCategories();
    }

    loadCategories() {
        axios.get('http://127.0.0.1:5000/api/search/terms').then(res => {
            this.setState({ categories: res.data });
        })
    }

    showModal(state) {
        this.setState({ show: state });
    };

    saveCategory(category) {
        let id = 1

        if (this.state.categories.length > 0)
            id = this.state.categories[this.state.categories.length - 1].id + 1;

        const categories = this.state.categories.filter((el) => el.categoryName !== category.categoryName)

        if (this.state.categories.filter((el) => el.categoryName === category.categoryName).length > 0) {
            const prev_category = this.state.categories.filter((el) => el.categoryName === category.categoryName)
            category.categorySearchTerms = [...category.categorySearchTerms, ...prev_category[0].categorySearchTerms]
            id = prev_category[0].id

            axios.put(`http://127.0.0.1:5000/api/search/category`, { id, ...category }).then((res) => {
                this.setState({ categories: [...categories, { id, ...category }] });
                return;
            })
        } else {
            this.setState({ editCategory: null })
            axios.post(`http://127.0.0.1:5000/api/search/category`, category).then(res =>
                this.setState({ categories: [...categories, { id, ...category }] })
            );
        }
    }

    deleteCategory(id) {
        axios.delete(`http://127.0.0.1:5000/api/search/category/${id}`).then(res =>
            this.setState({
                categories: this.state.categories.filter((el) => el.id !== id)
            }))
    }

    startProcessing() {
        this.setState({ showStatus: true });
    }

    changePage() {
        window.location.replace(window.location.origin + "/result");
    }

    editCategory(category) {
        console.log(category);
        axios.put(`http://127.0.0.1:5000/api/search/category`, category).then((res) => {
            this.setState({ categories: [...this.state.categories.filter((el) => el.id !== category.id), category] })
        })
    }

    render() {
        return (
            <div>
                <NavBar showModal={this.showModal} />

                <CategoryModal show={this.state.show} onSave={this.saveCategory} onEdit={this.editCategory}
                    category={this.state.editCategory} onHide={() => { this.setState({ editCategory: null }); this.showModal(false) }} />

                {this.state.showStatus &&
                    <SocketsModal show={this.state.showStatus} changePage={this.changePage} />
                }
                <Container className="py-5">
                    <Row className="row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3">
                        {this.state.categories.map((el) => (
                            <Col>
                                <CategoryCard key={el.id} categoryObject={el} onDelete={this.deleteCategory} onEdit={() => {
                                    this.setState({ editCategory: el });
                                    this.showModal(true);
                                }} />
                            </Col>
                        ))}
                    </Row>
                </Container>
                {this.state.categories.length > 0 &&
                    <Container className="text-center">
                        <Button onClick={() => this.startProcessing()}>Обработать</Button>
                    </Container>
                }

            </div>
        );
    }
}

export default CategoryPage;