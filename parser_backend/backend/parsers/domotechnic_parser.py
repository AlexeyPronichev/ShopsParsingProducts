from datetime import datetime
import time
import random
import requests
from backend.parsers.base_parser import BaseParser


class DomotechnicParser(BaseParser):
    __name__ = "Домотехника"
    base_link = "https://domotekhnika.ru"

    session: requests.Session

    def __init__(self):
        headers = {'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                   'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0'}

        with requests.Session() as session:
            self.session = session
            self.session.headers.update(headers)

    def search(self, search_term: str) -> list[dict]:
        current_page = 0
        page_count = 0

        data = []
        while current_page <= page_count:
            json_response = self.session.get(
                f"{self.base_link}/api/v1/search?page={current_page}&withFilters=false&query={search_term}&sortBy=relevance").json()

            page_count = int(json_response.get('data').get('pageCount'))

            for product in json_response.get('data').get('productGroups')[0].get('products'):
                product_name = product.get('title')
                product_cost = product.get('price')
                product_link = product.get('url')

                data_dict = {
                    'shop_name': self.__name__,
                    'product_name': product_name,
                    'product_cost': int(product_cost),
                    'date': str(datetime.now().date()),
                    'product_link': f'{self.base_link}{product_link}',
                }

                if data_dict not in data:
                    data.append(data_dict.copy())

            current_page += 1
            time.sleep(1)

        return data

