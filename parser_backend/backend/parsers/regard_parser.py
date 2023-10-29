import requests
from bs4 import BeautifulSoup
from backend.parsers.base_parser import BaseParser
from datetime import datetime
from urllib.parse import urljoin
import time
import random


class RegardParser(BaseParser):
    __name__ = "Регард"
    base_link = "https://www.regard.ru"

    session: requests.Session

    def __init__(self):
        headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
        }

        with requests.Session() as session:
            self.session = session
            self.session.headers.update(headers)

    def search(self, search_term: str) -> list[dict]:
        page = 1
        data = []

        while True:
            url = f"{self.base_link}/catalog?page={page}&search={search_term}"
            r = self.session.get(url)
            soup = BeautifulSoup(r.text, "html.parser")
            titles = soup.find_all("h6", class_="CardText_title__7bSbO CardText_listing__6mqXC")
            prices = soup.find_all("span", class_="CardPrice_price__YFA2m Card_price__3VIdU")
            urls = [link.get("href") for link in soup.find_all("a", class_="CardText_link__C_fPZ link_black")]

            if len(prices) == 0:
                break

            for i in range(len(prices)):
                title = titles[i].text.strip() if i < len(titles) else "Title not found"
                price = prices[i].text.strip().replace('\xa0', '').replace('₽', '')
                product_url = f"https://www.regard.ru{urls[i]}" if i < len(urls) else "URL not found"

                data_dict = {
                    'shop_name': self.__name__,
                    'product_name': title,
                    'product_cost': int(price),
                    'date': str(datetime.now().date()),
                    'product_link': product_url,
                }

                if data_dict not in data:
                    data.append(data_dict.copy())

            page += 1
            time.sleep(random.uniform(0.5, 2))

        return data

