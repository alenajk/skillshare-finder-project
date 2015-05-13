"""Models and database functions for skillshare-finder project"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

############################################################
# Model definitions

class User(db.Model):

    __tablename__ = "users"

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(40))
    username = db.Column(db.String(20))
    password = db.Column(db.String(30))
    phone = db.Column(db.Integer)
    contact_pref = db.Column(db.String(10))

    def __repr__(self):
        return "<User user_id:%s name=%s" % (self.user_id, self.name)

class Hobby(db.Model):
    
    __tablename__ = "hobbies"

    hobby_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return "<Hobby hobby_id=%s name=%s" % (self.hobby_id, self.name)

class UserHobbyLevel(db.Model):

    __tablename__ = "users_hobbies_levels"

    user_hobby_level_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    hobby_id = db.Column(db.Integer, db.ForeignKey('hobbies.hobby_id'), nullable=False)
    level = db.Column(db.Integer, nullable=False)

    # Define relationship to hobby
    hobby = db.relationship("Hobby", backref=db.backref("users_hobbies_levels"))

    def __repr__(self):
        return "<UserHobbyLevel user_id=%s hobby name=%s level=%s" % (self.user_id, self.hobby.name)

class LocationTransaction(db.Model):

    __tablename__ = "location_transactions"

    location_transaction_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.location_id'), nullable=False)
    hobby_id = db.Column(db.Integer, db.ForeignKey('hobbies.hobby_id'))
    level = db.Column(db.Integer, nullable=False)
    check_in_time = db.Column(db.DateTime)
    check_in_duration = db.Column(db.Float)

    # Define relationship to hobby
    hobby = db.relationship("Hobby", backref=db.backref("location_transactions"))
    # Define relationship to Location
    location = db.relationship("Location", backref=db.backref("location_transactions"))
    
    def __repr__(self):
        return "<LocationTransaction user_id=%s hobby name=%s" % (self.user_id, self.hobby.name)

class Location(db.Model):

    __tablename__ = "locations"

    location_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    location_type = db.Column(db.String(20))
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return "<Location location_id=%s location_type=%s lat=%s lon=%s" % (self.location_id, self.location_type, self.lat, self.lon)


############################################################
# Helper functions

def connect_to_db(app):

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///skillshare.db'
    db.app = app
    db.init_app(app)

if __name__ == "__main__":

    from server import app
    connect_to_db(app)
    print "Connected to DB"

