from backend.parsers.base_parser import BaseParser
from selenium.webdriver.common.by import By
from datetime import datetime
import time

class CitilinkParser(BaseParser):

    __name__ = "Ситилинк"
    base_link = "https://www.citilink.ru/"

    def search(self, search_term: str) -> list[dict]:

        data = []
        page = 1

        while True:
            self.session.get(
                f'{self.base_link}search/?text={search_term}&p={page}')

            elements = self.session.find_elements(
                By.XPATH, '//div[@data-meta-name="ProductVerticalSnippet"]')

            if len(elements) == 0:
                break

            for element in elements:
                try:
                    product_link_element = element.find_element(
                        By.XPATH, './/div[@data-meta-name="SnippetProductVerticalLayout"]/a')

                    product_link = product_link_element.get_attribute('href')
                    product_name = product_link_element.get_attribute('title')

                    product_cost = element.find_element(
                        By.XPATH, './/span[@data-meta-price]').get_attribute('data-meta-price')

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

