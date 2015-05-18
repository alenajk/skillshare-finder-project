"""Skillshare finder"""

from jinja2 import StrictUndefined
from flask import Flask, render_template, redirect, request, flash, session, jsonify
from model import User, Hobby, UserHobbyLevel, Location, CheckIn, connect_to_db, db

app = Flask(__name__)

app.secret_key = "ABC"

app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """Homepage"""

    return render_template("homepage.html")

@app.route('/checkin', methods=['GET','POST'])
def check_in():

    print "hi"
    print request.args.get('lat')
    lat = int(round(float(request.args.get('lat'))))
    lon = int(round(float(request.args.get('lon'))))
    city = request.args.get('city')
    checkin = CheckIn(lat=lat, lon=lon, city=city, checked_in=True)

    # adding the location info to the DB
    db.session.add(checkin)
    db.session.commit()
    check_in_id = checkin.check_in_id
    print check_in_id
    reply = {'check_in_id' : check_in_id}
    return jsonify(reply=reply)

@app.route('/checkout', methods=['GET','POST'])
def check_out():
    
    print "hello"
    check_in_id = request.args.get('check_in_id')
    print "check_in_id", check_in_id
    check_in = CheckIn.query.filter_by(check_in_id=check_in_id).all()
    print "check_in", check_in
    check_in[0].checked_in = False
    db.session.commit()

    return "hi"

@app.route('/register', methods=['GET','POST'])
def register():
    
    if request.method == "POST":
       
        name = request.form.get('name')
        username = request.form.get('username')
        password = request.form.get('password')
        email = request.form.get('email')
        phone = request.form.get('phone')
        pref = request.form.get('pref')

        temp = User.query.filter_by(email=email).all()

        if temp != []:
            flash("That email has already been registered.")
            return redirect('/register')
        else:
            # Create instance of User class with provided info and add to db
            user = User(name=name, username=username, password=password, 
                email=email, phone=phone, contact_pref=pref)
            db.session.add(user)
            db.session.commit()
            flash('You were successfully registered!')
            return redirect('/')
    
    return render_template('register.html')

@app.route('/login', methods=['GET','POST'])
def login():

    if request.method == "POST":
        email = request.form.get('email')
        password = request.form.get('password')
        pw_in_db = User.query.filter_by(email=email).all()
        print password
        print pw_in_db[0].password
        # Check to see if email exists in db
        if pw_in_db == []:
            flash("Looks like that email hasn't been registered yet.")
            return redirect('/register')
        else:
            if pw_in_db[0].password == password:
                session['email'] = email
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

    session['email'] = []
    session['password'] = []
    return redirect('/')

if __name__ == "__main__":
    app.debug = True

    connect_to_db(app)
    app.run()