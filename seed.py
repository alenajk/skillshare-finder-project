"""Utility file to seed users into database from data in seed_data."""

from model import User, Hobby, UserHobby, CheckIn, connect_to_db, db
from server import app

def load_users():
	"""Load users from user file into users table in database."""

	user_data = open("seed_data/users")

	for line in user_data:
		line = line.rstrip().split(',')
		name, username, password, email, phone = line
		current_line = User(name=name, username=username, password=password, email=email, phone=phone)
		print line
		db.session.add(current_line)

	db.session.commit()

if __name__ == "__main__":
    connect_to_db(app)
    db.create_all()
    
    load_users()