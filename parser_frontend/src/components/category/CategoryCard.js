import { Component } from "react";

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

class CategoryCard extends Component {
    render() {
        return (
            <Card className="h-100">
                <Card.Body>
                    <Card.Title className="fw-bold">{this.props.categoryObject.categoryName}</Card.Title>
                    <Card.Subtitle>Всего {this.props.categoryObject.categorySearchTerms.length} поисковых запроса (-ов)</Card.Subtitle>
                </Card.Body>
                <ListGroup className="list-group-flush">
                    {this.props.categoryObject.categorySearchTerms.map((el) =>
                        <ListGroup.Item>{el}</ListGroup.Item>
                    )}
                </ListGroup>
                <Card.Body>
                    <ButtonGroup>
                        <Button variant="outline-danger" onClick={() => this.props.onDelete(this.props.categoryObject.id)}>Удалить</Button>
                        <Button variant="outline-primary" onClick={() => this.props.onEdit()}>Редактировать</Button>
                    </ButtonGroup>
                </Card.Body>
            </Card>
        );
    }
}

export default CategoryCard;