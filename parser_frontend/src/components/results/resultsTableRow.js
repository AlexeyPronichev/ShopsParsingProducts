import { Component } from "react";


export default class ResultsTableRow extends Component {
    render() {
        return (
            <tr>
                <td>{this.props.el.shop_name}</td>
                <td>{this.props.el.product_name}</td>
                <td>{this.props.el.product_cost} руб.</td>
                <td><a href={this.props.el.product_link}>Ссылка</a></td>
                <td>{this.props.el.date}</td>
            </tr>
        );
    }
}