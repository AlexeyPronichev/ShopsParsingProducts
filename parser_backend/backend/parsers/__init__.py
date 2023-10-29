from backend.parsers.base_parser import BaseParser
from backend.parsers.citilink_parser import CitilinkParser
from backend.parsers.dns_parser import DnsParser
from backend.parsers.domotechnic_parser import DomotechnicParser
from backend.parsers.regard_parser import RegardParser


parsers_list: tuple[BaseParser] = (CitilinkParser, DnsParser, DomotechnicParser,RegardParser)