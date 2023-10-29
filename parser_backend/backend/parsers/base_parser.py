import abc
from abc import abstractmethod
import platform

from selenium import webdriver
from selenium_stealth import stealth


class BaseParser(abc.ABC):
    __name__: str
    base_link: str

    _search_data_dict = {
        'shop_name': __name__,
        'product_name': str,
        'product_cost': int,
        'date': str,
        'product_link': str,
    }

    session: webdriver.Chrome

    def __init__(self):
        options = webdriver.ChromeOptions()

        options.add_argument("--headless")
        prefs = {"profile.managed_default_content_settings.images": 2}
        options.add_experimental_option("prefs", prefs)
        options.add_experimental_option(
            "excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        self.session = webdriver.Chrome(executable_path=f"./webdriver/chromedriver-{platform.system()}",options=options)

        stealth(self.session,
                languages=["en-US", "en"],
                vendor="Google Inc.",
                platform="Win32",
                webgl_vendor="Intel Inc.",
                renderer="Intel Iris OpenGL Engine",
                fix_hairline=True,
                )


    def search(self, search_term: str) -> list[dict]:
        '''
        Returns a list of dictionaries of the form: 
        ```python
            [{
                'shop_name': self.__name__,
                'product_name': str,
                'product_cost': int,
                'date': str,
                'product_link': str,
            }]
        '''
        ...
