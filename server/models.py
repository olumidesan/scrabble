
from server import db

class Word(db.Model):
    """Schema definition for Scrabble words"""

    __tablename__ = 'word'

    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(80), unique=True, nullable=False)

    def __repr__(self):
        return 'Scrabble Words Database (2018)'