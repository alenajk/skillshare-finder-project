"""Skillshare finder"""

from jinja2 import StrictUndefined
from flask import Flask, render_template, redirect, request, flash, session, jsonify
from model import User, Hobby, UserHobby, Location, CheckIn, connect_to_db, db
from twilio.rest import TwilioRestClient
import os

# Get keys into program
account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
auth_token = os.environ.get("TWILIO_AUTH_TOKEN")

if not account_sid:
    print "Run your script to source the secrets!"

# Set up Twilio's python helper client
client = TwilioRestClient(account_sid, auth_token)

app = Flask(__name__)
app.secret_key = "ABC"
app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """Homepage"""

    # Check to see if logged in. If logged in, check to see if checked in,
    # and if so, pass checkedin to homepage template

    checkedin=None

    fav_hobby_ids = {}

    if 'email' in session.keys():
        user_id=User.query.filter_by(email=session['email']).one().user_id
        checkedin = CheckIn.query.filter_by(user_id=user_id).all()
        fav_hobbies = UserHobby.query.filter_by(user_id=user_id).all()
        for hobby in fav_hobbies:
            fav_hobby_ids[str(hobby.hobby.name)] = hobby.hobby_id
        print fav_hobbies, fav_hobby_ids
        
        if checkedin:
            # Make sure I'm getting the most recent checkin
            # Order by reverse ID
            print "checked in list: ", checkedin
            # iterate through and check to see if checked in?
            checkedin = checkedin[-1].checked_in
            print checkedin
        if checkedin == True:
            check_in_object = CheckIn.query.filter_by(user_id=user_id).all()[-1]
            lat = check_in_object.lat
            lon = check_in_object.lon
            checkin_id = check_in_object.check_in_id
            user_id = check_in_object.user_id
            hobby_id = check_in_object.hobby_id
            # City - str type not working in homepage.html variable def
            checkedin = [lat,lon,checkin_id,user_id,hobby_id]
            print checkedin
        else:
            checkedin = 'false'
    return render_template("homepage.html", checkedin=checkedin, fav_hobbies=fav_hobby_ids)

@app.route('/register', methods=['GET','POST'])
def register():
    
    if request.method == "POST":
       
        name = request.form.get('name')
        username = request.form.get('username')
        password = request.form.get('password')
        email = request.form.get('email')
        phone = request.form.get('phone')

        temp = User.query.filter_by(email=email).all()

        if temp != []:
            flash("That email has already been registered.")
            return redirect('/register')
        else:
            # Create instance of User class with provided info and add to db
            user = User(name=name, username=username, password=password, 
                email=email, phone=phone)
            db.session.add(user)
            db.session.commit()
            flash('You were successfully registered! You may now log in.')
            return redirect('/login')
    
    return render_template('register.html')

@app.route('/login', methods=['GET','POST'])
def login():

    if request.method == "POST":
        email = request.form.get('email')
        password = request.form.get('password')
        pw_in_db = User.query.filter_by(email=email).all()

        # Check to see if email exists in db
        if pw_in_db == []:
            flash("Looks like that email hasn't been registered yet.")
            return redirect('/register')
        else:
            if pw_in_db[0].password == password:
                print "email: ", email
                session['email'] = email
                print session['email']
                session['password'] = password
                user_id = User.query.filter_by(email=email).one().user_id
                flash("You've been successfully logged in!")
                return redirect("/")
            else:
                flash("Oops - wrong password. Try again.")
                return redirect("/login")

    return render_template("login_form.html")

@app.route('/logout')
def logout():

    session.clear()

    return redirect('/')

@app.route('/test')
def test():

    return render_template('maptest.html')

@app.route('/users/profile')
def show_user_profile():

    email = session['email']
    user = User.query.filter_by(email=email).one()
    fav_hobbies = UserHobby.query.filter_by(user_id=user.user_id).all()
    fav_hobby_names = [f.hobby.name for f in fav_hobbies]

    hobbies = Hobby.query.all()
    all_hobbies = []

    for hobby in hobbies:
        print hobby.name
        all_hobbies.append(hobby.name)

    return render_template("user_profile.html", user=user, fav_hobby_names=fav_hobby_names, fav_hobbies=fav_hobbies, all_hobbies=all_hobbies)

@app.route('/add_hobby', methods=['GET','POST'])
def add_hobby():

    email = session['email']
    user = User.query.filter_by(email=email).one()

    if 'hobbysubmit' in request.form:
        # Get hobby and add to db
        hobby = request.form.get('hobby')
        hobby_id = Hobby.query.filter_by(name=hobby).one().hobby_id

        # Add new entry to users_hobbies table in db
        new_user_hobby = UserHobby(user_id=user.user_id, hobby_id=hobby_id)
        db.session.add(new_user_hobby)

    elif 'newhobbysubmit' in request.form:
        # Get newhobby and add hobby to hobbies table 
        # AND new entry to users_hobbies table
        hobby = request.form.get('newhobby')

        # Check to make sure hobby doesn't already exist in table
        if Hobby.query.filter_by(name=hobby).all():
            flash ("That hobby appears to already exist!")
            return redirect('/users/profile')

        # Add new hobby to hobbies table in db
        new_hobby = Hobby(name=hobby)
        db.session.add(new_hobby)
        db.session.commit()

        # Find hobby_id of newly added hobby
        hobby_id = Hobby.query.filter_by(name=hobby).one().hobby_id
        # Add new entry to users_hobbies table in db
        new_user_hobby = UserHobby(user_id=user.user_id,hobby_id=hobby_id)
        db.session.add(new_user_hobby)
        print "newhobby to add is: ", hobby


    db.session.commit()    
    flash("You added " + str(hobby) + " to your profile!")

    return redirect('/users/profile') 

@app.route('/remove_hobby', methods=['GET','POST'])
def remove_hobby():

    email = session['email']
    user = User.query.filter_by(email=email).one()
    user_id = user.user_id

    hobby_id = request.form.get('hobby_id')
    hobby = Hobby.query.filter_by(hobby_id=hobby_id).one().name
    user_hobby = UserHobby.query.filter_by(user_id=user_id,hobby_id=hobby_id).one()
    print "user hobby: ", user_hobby.user_id

    # Change user_id to 0 in db
    user_hobby.user_id = 0
    db.session.commit()

    flash('You removed ' + hobby + ' from your favorites.')
    return redirect('/users/profile')

@app.route('/get_nearby')
def get_nearby():
    
    city = request.args.get('city')
    
    # Find the CheckIn objects for currently checked in users in same city as searched
    active_nearby_users = CheckIn.query.filter_by(checked_in=True,city=city).all()

    # Create a list of dictionaries containing nearby checked-in user location
    active_nearby_users_dicts = [user.to_dict() for user in active_nearby_users]
    print "active_nearby_users_dicts ", active_nearby_users_dicts

    return jsonify(reply=active_nearby_users_dicts)

@app.route('/checkin', methods=['GET','POST'])
def check_in():

    lat = float(request.form.get('lat'))
    lon = float(request.form.get('lon'))
    city = request.form.get('city')
    
    
    # Check to see if hobby already exists in profile
    hobby = request.form.get('hobby')
    if Hobby.query.filter_by(name=hobby).all():
        pass
    else:
        hobby_object = Hobby(name=hobby)
        db.session.add(hobby_object)
        db.session.commit()

    hobby_id = Hobby.query.filter_by(name=hobby).all()[0].hobby_id
    email = session['email']
    user = User.query.filter_by(email=email).one()
    user_id = user.user_id
    checkin = CheckIn(user_id=user_id, lat=lat, lon=lon, city=city, hobby_id=hobby_id, checked_in=True)

    # adding the location info to the DB
    db.session.add(checkin)
    db.session.commit()
    print checkin
    check_in_id = checkin.check_in_id
    username = checkin.user.username
    user_id = checkin.user_id
    lat = checkin.lat
    lon = checkin.lon
    city = checkin.city
    hobby = checkin.hobby.name

    reply = {
            'checkinId' : check_in_id,
            'username' : username,
            'userId' : user_id,
            'lat' : lat,
            'lon' : lon,
            'city' : city,
            'hobby' : hobby
            }

    # Send a message if collaborating
    other_username = request.form.get('other_username')
    print "other username: ", other_username
    if request.form.get('send_message'):
        other_user = User.query.filter_by(username=other_username).one()
        message = client.messages.create(body="User " +user.name+ " is on his/her way!",
        to="+1"+str(other_user.phone),
        from_="+16502156412")

    return jsonify(reply=reply)

@app.route('/checkout', methods=['GET','POST'])
def check_out():
    
    check_in_id = request.args.get('check_in_id')
    print "check_in_id", check_in_id
    check_in = CheckIn.query.filter_by(check_in_id=check_in_id).all()
    print "check_in", check_in
    check_in[0].checked_in = False
    db.session.commit()

    return "hi"

if __name__ == "__main__":
    app.debug = True

    connect_to_db(app)
    app.run()