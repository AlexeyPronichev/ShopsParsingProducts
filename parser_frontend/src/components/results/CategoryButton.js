import { Component } from "react";

export default class CategoryButton extends Component {
    render() {
        return (
            <a key={this.props.el.id} className={`list-group-item list-group-item-action py-3 lh-sm ${this.props.active ? "active" : ""}`} 
                onClick={() => this.props.setCategory(this.props.el)} aria-current="true">
                
                <div className="d-flex w-100 align-items-center justify-content-between">
                    <strong className="mb-1">{this.props.el.categoryName}</strong>
                    <small>{this.props.el.categorySearchResults.length}</small>
                </div>
            </a>
        );
    }
}