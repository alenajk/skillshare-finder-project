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
    email = db.Column(db.String(30))
    phone = db.Column(db.Integer)

    def __repr__(self):
        return "<User user_id:%s name=%s" % (self.user_id, self.name)

class Hobby(db.Model):
    
    __tablename__ = "hobbies"

    hobby_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return "<Hobby hobby_id=%s name=%s" % (self.hobby_id, self.name)

class UserHobby(db.Model):

    __tablename__ = "users_hobbies"

    user_hobby_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    hobby_id = db.Column(db.Integer, db.ForeignKey('hobbies.hobby_id'), nullable=False)

    # Define relationship to hobby
    hobby = db.relationship("Hobby", backref=db.backref("users_hobbies"))

    def __repr__(self):
        return "<UserHobby user_id=%s hobby name=%s" % (self.user_id, self.hobby.name)

class CheckIn(db.Model):

    __tablename__ = "check_ins"

    check_in_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    location_id = db.Column(db.Integer, db.ForeignKey('locations.location_id'))
    hobby_id = db.Column(db.Integer, db.ForeignKey('hobbies.hobby_id'))
    # check_in_time = db.Column(db.DateTime)
    # check_in_duration = db.Column(db.Float)
    city = db.Column(db.String(30))
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    checked_in = db.Column(db.Boolean, nullable=False)

    # Define relationship to user
    user = db.relationship("User", backref=db.backref("check_ins"))
    # Define relationship to hobby
    hobby = db.relationship("Hobby", backref=db.backref("check_ins"))
    # Define relationship to Location
    location = db.relationship("Location", backref=db.backref("check_ins"))

    def to_dict(self):
        return {
            'check_in_id' : self.check_in_id,
            'user_id' : self.user_id,
            'city' : self.city,
            'lat' : self.lat,
            'lon' : self.lon,
            'hobby_id' : self.hobby_id,
            'hobby_name' : self.hobby.name,
            'username' : self.user.name
        }
    
    # def __repr__(self):
        # return "<CheckIn user_id=%s hobby name=%s" % (self.user_id, self.hobby.name)

class Location(db.Model):

    __tablename__ = "locations"

    location_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    location_type = db.Column(db.String(20))
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    city = db.Column(db.String(30))

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

