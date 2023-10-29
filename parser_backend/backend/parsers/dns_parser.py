from backend.parsers.base_parser import BaseParser
from selenium.webdriver.common.by import By
from datetime import datetime
import time

class DnsParser(BaseParser):
    __name__ = "DNS"

    base_link = "https://www.dns-shop.ru"

    def search(self, search_term: str):
        data = []
        page = 1

        self.session.get(self.base_link)

        while True:
            self.session.get(f"{self.base_link}/search/?q={search_term}&p={page}")

            products = self.session.find_elements(By.CLASS_NAME, "catalog-product")
            if len(products) == 0:
                break

            for product in products:
                try:
                    link_element = product.find_element(
                        By.CLASS_NAME, "catalog-product__name")

                    product_name = link_element.text
                    product_link = link_element.get_attribute("href")

                    product_cost = product.find_element(
                        By.CLASS_NAME, "product-buy__price").text[:-2].replace(" ", "")

                    data_dict = {
                        'shop_name': self.__name__,
                        'product_name': product_name,
                        'product_cost': int(product_cost),
                        'date': str(datetime.now().date()),
                        'product_link': product_link,
                    }

                    if data_dict not in data:
                        data.append(data_dict.copy())
                except:
                    continue

            page += 1
            time.sleep(1)

        return data

