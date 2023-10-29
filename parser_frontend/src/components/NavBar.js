import { Component } from "react";
import React from "react";

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';



class NavBar extends Component {
    render() {
        console.log()

        return (
            <Navbar bg="light" expand="lg" {...this.props}>
                <Container fluid>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav className="me-auto my-2 my-lg-0">
                            <Nav.Link className={`${window.location.pathname === "/" ? "fw-bold active" : ""}`} href="/">Настройки</Nav.Link>
                            <Nav.Link className={`${window.location.pathname === "/result" ? "fw-bold active" : ""}`} href="/result">Результат</Nav.Link>
                        </Nav>
                        {window.location.pathname === "/" &&
                            <Form className="d-flex">
                                <Button variant="outline-success" title="Добавить новую категорию" onClick={() => this.props.showModal(true)}>Добавить</Button>
                            </Form>
                        }
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
}

export default NavBar;