import { Component } from "react";
import NavBar from "../NavBar";
import axios from "axios";
import CategoryButton from "./CategoryButton";
import ResultsTable from "./resultsTable";
import { Col, Container, Dropdown, Row } from "react-bootstrap";
import Chart from 'chart.js/auto';
import { Line } from "react-chartjs-2";
import fileDownload from "js-file-download";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../css/sidebar.css';

class ResultsPage extends Component {
    constructor(props) {
        super(props);
        this.handleFilterChange = this.handleFilterChange.bind(this);

        this.state = {
            categories: [],
            activeCategory: {
                categoryName: "",
                categorySearchResults: []
            },
            sortOrder: "ascending",
            filterText: "",
            recommended_price: 0,
            myStorePrice: 0,
            max_cost: 0,
            min_cost: 0,
            avr_cost: 0,
            graph_labels: [],
            graph_data: [],
            dates: new Set()
        }

        this.setActiveCategory = this.setActiveCategory.bind(this);
        this.handleDateSelect = this.handleDateSelect.bind(this);

        axios.get('http://127.0.0.1:5000/api/search/results')
            .then(res => {
                if (res.data.length > 0) {
                    this.setState({ categories: [...res.data] });
                    this.setActiveCategory([...res.data][0]);
                    let dates = new Set();

                    [...res.data][0].categorySearchResults.forEach((res) =>
                        dates.add(this.formatDate(new Date(res.date)))
                    )
                    console.log(dates);
                    this.setState({dates: dates});
                }
            });
    }

    formatDate(date) {
        const offset = date.getTimezoneOffset()
        date = new Date(date.getTime() - (offset*60*1000))
        return date.toISOString().split('T')[0]
    }

    handleDateSelect(date) {
        const format_date = this.formatDate(date);
        console.log(format_date)
        console.log(this.state.dates);
        const has_date = Array.from(this.state.dates).filter((el) => el === format_date).length > 0
        console.log(has_date);

        if (has_date)
            axios.get(`http://127.0.0.1:5000/api/search/results/${format_date}`).then(res => {
                this.setState({ categories: [...res.data] });
                this.setState({activeCategory: [...res.data][this.state.activeCategory.id - 1]});
            })
    }

    setActiveCategory(el) {
    this.setState({ activeCategory: el });
    let costs = [];

        el.categorySearchResults.forEach((res) => {
            costs.push(res.product_cost);
        });

        this.setState({
            max_cost: Math.max(...costs),
            min_cost: Math.min(...costs),
            avr_cost: Math.round(costs.reduce((a, b) => a + b, 0) / costs.length),
            median_cost: this.calculateMedian(costs)
        });

        let dates = new Set();

        el.categorySearchResults.forEach((res) =>
            dates.add(res.date)
        )

        let graph_data = [];
        let graph_min_data = [];
        let graph_max_data = [];
        let graph_labels = [];

        dates.forEach(date => {
            const cur_category_dates = el.categorySearchResults.filter((res) => res.date === date);
            const avr_cost = cur_category_dates.reduce((a, b) => a + b.product_cost, 0) / cur_category_dates.length;
            const min_cost = Math.min(...cur_category_dates.map(item => item.product_cost));
            const max_cost = Math.max(...cur_category_dates.map(item => item.product_cost));
            graph_data.push(avr_cost);
            graph_min_data.push(min_cost);
            graph_max_data.push(max_cost);
            graph_labels.push(date);
        })

        this.setState({
            graph_data: graph_data,
            graph_min_data: graph_min_data,
            graph_max_data: graph_max_data,
            graph_labels: graph_labels,
        });
    }


    downloadTable() {
        const id = this.state.activeCategory.id;
        axios.get(`http://127.0.0.1:5000/api/search/category/${id}/table`, { responseType: 'blob' }).then((res) => {
            fileDownload(res.data, `${this.state.activeCategory.categoryName}.csv`);
        })
    }

    handleRecommendedPriceChange(e) {
    this.setState({ recommended_price: e.target.value });
    }

    getInputClassName() {
    const { min_cost, max_cost, recommended_price } = this.state;

    if (recommended_price > max_cost) {
        return "form-control is-invalid";
    }

    if (recommended_price >= min_cost && recommended_price <= max_cost) {
        return "form-control is-valid";
    }

    return "form-control";
    }

    toggleSortOrder() {
    const newSortOrder = this.state.sortOrder === "ascending" ? "descending" : "ascending";
    this.setState({ sortOrder: newSortOrder });
    }

    handleFilterChange(e) {
    this.setState({ filterText: e.target.value });
    }

   calculateMedian(array) {
    const mid = Math.floor(array.length / 2);
    const sorted = [...array].sort((a, b) => a - b);
    return array.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    removeDuplicates() {
      axios
        .delete('http://127.0.0.1:5000/api/remove_duplicates')
        .then((response) => {
          console.log(response.data.message);
          window.location.reload();
        })
        .catch((error) => {
          console.error('Ошибка:', error);
        });
    }

    importTable() {
        const fileInput = document.getElementById("import-file-input");
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("csvfile", file);

        axios
            .post("http://127.0.0.1:5000/api/import_table", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
                console.log(response.data.message);
                window.location.reload();
            })
            .catch((error) => {
                console.error("Ошибка:", error);
            });
    }

    handleMyStorePriceChange(e) {
    this.setState({ myStorePrice: e.target.value });
    }

    getMyStorePriceClassName() {
    if (parseFloat(this.state.myStorePrice) > parseFloat(this.state.max_cost)) {
        return "form-control text-danger";
    } else if (parseFloat(this.state.myStorePrice) <= parseFloat(this.state.max_cost)) {
        return "form-control text-success";
    } else {
        return "form-control";
    }
    }

   handleGraphTypeChange = (event) => {
        this.setState({ graphType: event.target.value });
   }

   getGraphData = () => {
     switch(this.state.graphType) {
        case 'max':
            return this.state.graph_max_data;
        case 'min':
            return this.state.graph_min_data;
        default:
            return this.state.graph_data;
     }
   }


    render() {
        return (
            <>
                <NavBar className="sticky-top" />

                <div className="container-fluid">
                    <div className="row">
                        <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-body-tertiary sidebar collapse">
                            <div className="position-sticky sidebar-sticky">
                                <div className="list-group list-group-flush border-bottom scrollarea">
                                    {this.state.categories.map(el =>
                                        <CategoryButton el={el} active={el.id === this.state.activeCategory.id} setCategory={this.setActiveCategory} />
                                    )}
                                </div>
                            </div>
                        </nav>

                        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-start pt-3 pb-2 mb-3 border-bottom">
                                <h2>Статистика</h2>
                                <div className="btn-toolbar mb-2 mb-md-0">
                                    <div className="btn-group me-2">
                                        <button onClick={() => this.toggleSortOrder()} className="btn btn-sm btn-outline-secondary">Сортировать</button>
                                        <button type="button" onClick={() => this.downloadTable()} className="btn btn-sm btn-outline-secondary">Экспорт</button>
                                        <label htmlFor="import-file-input" className="btn btn-sm btn-outline-secondary" style={{ display: "inline-block", width: "100px", paddingTop: "8px" }}>Импорт</label>
                                        <input type="file" id="import-file-input" accept=".csv" style={{ display: "none" }} onChange={() => this.importTable()} />
                                        <button onClick={() => this.removeDuplicates()} className="btn btn-sm btn-outline-secondary">Удалить результаты</button>
                                    </div>
                                    <div className="btn-group mb-2 mb-md-0 me-2">
                                        <select className="form-select" value={this.state.graphType} onChange={this.handleGraphTypeChange}>
                                                <option value="average">Средняя цена</option>
                                                <option value="max">Максимальная цена</option>
                                                <option value="min">Минимальная цена</option>
                                        </select>
                                    </div>
                                    <div className="input-group mb-2 mb-md-0 me-2">
                                        <span className="input-group-text" id="filter-label">Фильтр:</span>
                                        <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Введите текст для фильтрации"
                                                aria-label="Filter"
                                                aria-describedby="filter-label"
                                                value={this.state.filterText}
                                                onChange={(e) => this.handleFilterChange(e)}
                                                style={{ width: '300px' }}
                                        />
                                    </div>
                                    <Dropdown>
                                        <Dropdown.Toggle id="date-dropdown" variant="outline-secondary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-calendar align-text-bottom" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <DatePicker onSelect={this.handleDateSelect} minDate={Date.parse(Array.from(this.state.dates)[0])} maxDate={Date.parse(Array.from(this.state.dates).slice(-1)[0])} endDate={null} inline className="datepicker" />
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                            <Container>
                                <Row>
                                    <Col>
                                        <ul class="list-group">
                                            <li class="list-group-item">Выбрано конкурентов: 4 </li>
                                            <li class="list-group-item">Максимальная цена: {this.state.max_cost} руб.</li>
                                            <li class="list-group-item">Минимальная цена: {this.state.min_cost} руб.</li>
                                            <li class="list-group-item">Средняя цена: {this.state.avr_cost} руб.</li>
                                            <li class="list-group-item">Медианная цена: {this.state.median_cost} руб.</li>
                                            <li class="list-group-item">Диапазон цен: {this.state.min_cost} руб. - {this.state.max_cost} руб. </li>
                                            <li class="list-group-item">
                                                Цена в моем магазине:
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={this.state.myStorePrice}
                                                    onChange={(e) => this.handleMyStorePriceChange(e)}
                                                    className={this.getMyStorePriceClassName()}
                                                />
                                            </li>
                                            <li class="list-group-item">
                                                 Рекомендованная цена:
                                                 <input
                                                    type="number"
                                                    min="0"
                                                    value={this.state.recommended_price}
                                                    onChange={(e) => this.handleRecommendedPriceChange(e)}
                                                    className={this.getInputClassName()}
                                                 />
                                            </li>
                                        </ul>
                                    </Col>
                                    <Col>
                                        <Line
                                            data={{
                                                labels: this.state.graph_labels,
                                                datasets: [
                                                    {
                                                        id: 1,
                                                        label: 'Анализ данных  по времени',
                                                        data: this.getGraphData(),
                                                    },
                                                ],
                                            }} />
                                    </Col>
                                </Row>
                            </Container>
                            <ResultsTable
                                activeCategory={{
                                    ...this.state.activeCategory,
                                    categorySearchResults: [
                                        ...this.state.activeCategory.categorySearchResults.filter((el) =>
                                            Object.values(el).some((value) =>
                                                 value.toString().toLowerCase().includes(this.state.filterText.toLowerCase())
                                            )
                                        ),
                                    ].sort((a, b) =>
                                        this.state.sortOrder === "ascending"
                                             ? a.product_cost - b.product_cost
                                             : b.product_cost - a.product_cost
                                    ),
                                 }}
                            />
                        </main>
                    </div>
                </div>
            </>
        );
    }
}

export default ResultsPage;