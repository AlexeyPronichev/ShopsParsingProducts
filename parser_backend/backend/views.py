from datetime import datetime
from io import StringIO, BytesIO
import csv
from flask import jsonify
from flask import request, json, render_template, make_response
from flask import send_file
from backend import app, db, sock
from backend.models import *
import backend.parsers as parsers
import csv
import io
import logging
import chardet
from collections import Counter

def detect_delimiter(file_content):
    sniffer = csv.Sniffer()
    return sniffer.sniff(file_content).delimiter

@app.route("/api/search/category/<int:id>", methods=["DELETE"])
def delete_category(id: int):
    Category.query.filter_by(id=id).delete()
    SearchResults.query.filter_by(category_id=id).delete()
    SearchTerms.query.filter_by(category_id=id).delete()
    db.session.commit()
    return {"status": "success"}

@app.route("/api/search/category/<int:id>", methods=["GET"])
def get_category(id: int):
    ...

@app.route("/api/search/category", methods=["PUT"])
def update_category():
    category_req = request.json

    category = Category.query.filter_by(id=category_req.get("id")).one()
    category.category_name = category_req.get("categoryName")

    SearchTerms.query.filter_by(category_id=category_req.get("id")).delete()
    
    search_terms = [
        SearchTerms(search_term=term, category=category)
        for term in category_req.get("categorySearchTerms")
    ]

    db.session.add_all(search_terms)
    db.session.commit()

    return {"status": "success"}

@app.route('/api/search/category', methods=["POST"])
def add_category():
    if request.method == "POST":
        category = request.json
        category_name = category.get("categoryName")
        category_model = Category(category_name=category_name)
        search_terms = [
            SearchTerms(search_term=term, category=category_model)
            for term in category.get("categorySearchTerms")
        ]

        db.session.add(category_model)
        db.session.add_all(search_terms)
        db.session.commit()

        return {"status": "success"}


@app.route('/api/search/category/<int:id>/table', methods=['GET'])
def get_table(id: int):
    category = Category.query.filter_by(id=id).one()
    data = []
    for result in category.search_results:
        data.append({
                        "Магазин": result.shop_name,
                        "Имя товара": result.product_name,
                        "Цена": result.product_cost,
                        "Ссылка": result.product_link,
                        "Категория ID": result.category_id,
                        "Дата": result.date
                    }.copy())

    with StringIO() as si:
        writer = csv.DictWriter(si, data[0].keys(), delimiter=";")
        writer.writeheader()
        writer.writerows(data)
        bfile = BytesIO(si.getvalue().encode("cp1251", "ignore"))
        return send_file(bfile, download_name=f"{category.category_name} {category.search_results[-1].date}")


@app.route("/api/search/terms", methods=["POST", "GET"])
def terms():
    if request.method == "GET":
        data = []
        categories = Category.query.all()
        for category in categories:
            search_term = [term.search_term for term in category.search_terms]

            data.append(
                {
                    "id": category.id,
                    "categoryName": category.category_name,
                    "categorySearchTerms": search_term,
                }.copy()
            )
        return data


@app.route("/api/search/results", methods=["GET"])
def results():
    data = []

    categories = Category.query.all()
    for category in categories:
        category_search_results = [
            {
                "shop_name": result.shop_name,
                "product_name": result.product_name,
                "product_cost": result.product_cost,
                "date": result.date,
                "product_link": result.product_link,
            }
            for result in category.search_results
        ]
        data.append(
            {
                "id": category.id,
                "categoryName": category.category_name,
                "categorySearchResults": category_search_results,
            }.copy()
        )

    return data


@app.route("/api/search/results/<date>", methods=["GET"])
def get_date_results(date: str):
    data = []

    categories = Category.query.all()
    
    for category in categories:
        search_results = SearchResults.query.filter_by(date=date).filter_by(category_id=category.id).all()
        category_search_results = [
            {
                "shop_name": result.shop_name,
                "product_name": result.product_name,
                "product_cost": result.product_cost,
                "date": result.date,
                "product_link": result.product_link,
            }
            for result in search_results
        ]
        data.append(
            {
                "id": category.id,
                "categoryName": category.category_name,
                "categorySearchResults": category_search_results,
            }.copy()
        )

    return data

@app.route('/api/remove_duplicates', methods=['DELETE'])
def remove_duplicates():
    try:
        products = SearchResults.query.all()

        unique_product_name_date_pairs = set((p.product_name, p.date) for p in products)

        for product_name, date in unique_product_name_date_pairs:
            duplicates = SearchResults.query.filter_by(product_name=product_name, date=date).all()
            if len(duplicates) > 1:
                duplicates = duplicates[1:]
                for duplicate in duplicates:
                    db.session.delete(duplicate)

        db.session.commit()

        return jsonify({'message': 'Дубликаты успешно удалены'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/import_table', methods=['POST'])
def import_table():
    try:
        csvfile = request.files['csvfile']
        csvfile.stream.seek(0)
        reader = csv.reader(io.StringIO(csvfile.stream.read().decode("cp1251", "ignore")), delimiter=';')


        next(reader)


        for row in reader:

            shop_name, product_name, product_cost, product_link, category_id, date = row

            search_result = SearchResults(
                shop_name=shop_name,
                product_name=product_name,
                product_cost=int(product_cost),
                product_link=product_link,
                category_id=int(category_id),
                date=date
            )
            db.session.add(search_result)

        db.session.commit()
        return jsonify({'message': 'Данные успешно импортированы'}), 200
    except Exception as e:
        app.logger.error(f"Ошибка импорта данных\n{traceback.format_exc()}")
        return jsonify({'message': f"Ошибка импорта данных: {str(e)}"}), 500





@sock.route("/api/search/ws")
def parse(ws):
    categories = Category.query.all()
    count = 0
    for category in categories:
        category_search_terms = [term.search_term for term in category.search_terms]

        parse_category(category, category_search_terms)
        count += 1
        ws.send(json.dumps({"status": "work", "count": count}))

    ws.send(json.dumps({"status": "success", "count": count}))
    ws.close()


def parse_category(category, category_search_terms):
    category_data = list()
    for search_term in category_search_terms:
        for parser in parsers.parsers_list:
            search_data = parser().search(search_term)
            category_data.extend(search_data)

    search_results = [
        SearchResults(
            shop_name=result.get("shop_name"),
            product_name=result.get("product_name"),
            product_cost=result.get("product_cost"),
            product_link=result.get("product_link"),
            date=result.get("date"),
            category=category,
        )
        for result in category_data
    ]

    db.session.add_all(search_results)
    db.session.commit()


@app.route("/")
@app.route("/result")
def index():
    return render_template("index.html")
