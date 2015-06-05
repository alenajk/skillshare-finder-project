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
        return "<UserHobby user_id=%s hobby name=%s>" % (self.user_id, self.hobby.name)

class CheckIn(db.Model):

    __tablename__ = "check_ins"

    check_in_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    hobby_id = db.Column(db.Integer, db.ForeignKey('hobbies.hobby_id'))
    address = db.Column(db.String(100))
    city = db.Column(db.String(30))
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    details = db.Column(db.String(100))
    checked_in = db.Column(db.Boolean, nullable=False)

    # Define relationship to user
    user = db.relationship("User", backref=db.backref("check_ins"))
    # Define relationship to hobby
    hobby = db.relationship("Hobby", backref=db.backref("check_ins"))

    def to_dict(self):
        """Returns a dictionary of relevant check-in information"""

        return {
            'check_in_id' : self.check_in_id,
            'user_id' : self.user_id,
            'address' : self.address,
            'city' : self.city,
            'lat' : self.lat,
            'lon' : self.lon,
            'hobby_id' : self.hobby_id,
            'hobby_name' : self.hobby.name,
            'username' : self.user.username,
            'details' : self.details
        }
    
    def __repr__(self):
        return "<CheckIn user_id=%s hobby name=%s address=%s" % (self.user_id, self.hobby.name, self.address)


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

