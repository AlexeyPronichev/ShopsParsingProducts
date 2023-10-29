import { Component } from "react";
import ResultsTableRow from "./resultsTableRow";

export default class ResultsTable extends Component {
    render() {
        return (
            <>
                <h2>Таблица данных</h2>
                <div className="table-responsive">
                    <table className="table table-striped table-sm">
                        <thead>
                            <tr>
                                <th scope="col">Магазин</th>
                                <th scope="col">Имя</th>
                                <th scope="col">Цена</th>
                                <th scope="col">Ссылка</th>
                                <th scope="col">Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.activeCategory.categorySearchResults.map((el) =>
                                <ResultsTableRow el={el} />
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }
}