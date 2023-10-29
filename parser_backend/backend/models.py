from backend import db

class SearchResults(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    shop_name = db.Column(db.String(20))
    product_name = db.Column(db.String(255))
    product_cost = db.Column(db.Integer)
    product_link = db.Column(db.String(255))
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    date = db.Column(db.String(20))

    def __repr__(self) -> str:
        return f"<SearchResult {self.product_name} {self.product_link}>"


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String(255))
    search_results = db.relationship('SearchResults', backref='category')
    search_terms = db.relationship('SearchTerms', backref='category')

class SearchTerms(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    search_term = db.Column(db.String(255))