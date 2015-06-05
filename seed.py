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

def load_hobbies():
    """Load hobbies from hobbies file into hobbies table in database."""

    user_data = open("seed_data/hobbies")

    for line in user_data:
        line = line.rstrip()
        name = line
        current_line = Hobby(name=name)
        print line
        db.session.add(current_line)

    db.session.commit()

def load_users_hobbies():
    """Load user-hobby info from users_hobbies file into users_hobbies table in database."""

    user_data = open("seed_data/users_hobbies")

    for line in user_data:
        line = line.rstrip().split(',')
        user_id, hobby_id = line
        current_line = UserHobby(user_id=user_id, hobby_id=hobby_id)
        print line
        db.session.add(current_line)

    db.session.commit()


def load_check_ins():
    """Load check-in info from check_ins file into check_ins table in database."""

    user_data = open("seed_data/check_ins")

    for line in user_data:
        line = line.rstrip().split(',')
        user_id, hobby_id, address, city, lat, lon, checked_in = line
        current_line = CheckIn(user_id=user_id, hobby_id=hobby_id, address=address, city=city, lat=lat, lon=lon, checked_in=checked_in)
        print line
        db.session.add(current_line)

    db.session.commit()

if __name__ == "__main__":
    connect_to_db(app)
    db.create_all()
    
    load_users()
    load_hobbies()
    load_users_hobbies()
    load_check_ins()