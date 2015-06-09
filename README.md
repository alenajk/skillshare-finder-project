#Skillit: A skillshare-buddy finder app

![image](/static/search.png)

Skillit is designed to build community in an increasingly disconnected world by facilitating collaborative learning. If you want to take a hobby or skill to the next level, just enter your address, and Skillit shows you a real time map of other users within 2 km who are currently working and open to collaborating. Filter those users by what they're working on, and when you find someone who you'd like to meet up with, send them a message through the app telling them you're on your way - then head over to meet your new skill buddy!

####Technology stack

Backend: Python, Flask, Jinja, SQLite, SQLAlchemy

Frontend:  JavaScript, HTML, CSS, Bootstrap

APIs: Mapbox, Twilio

####Overview

After creating an account and logging in, a user can search the map with his or her current (or desired) location - the map will be populated with users within 2 km of the user who are open to collaborating. After filtering by hobby and selecting someone to collaborate with, the user can customize a message to his or her new skill buddy, and a Twilio API call sends this message to the already-checked-in user.

![image](/static/checkin.png)

If a user doesn't want to meet up with any of the currently checked-in users, he or she may check in at their own location and wait for others to join them. 

![image](/static/solo-checkin.png)

#### Profile
A user may also add favorite hobbies to his or her profile, either by selecting a hobby that already exists in the database or by adding a new one. Then, when checking in, the user may select a favorite hobby via a dropdown populated by hobbies linked to that user in the database.

![image](/static/profile.jpg)

#### Setup

-- Clone or fork this repo:
https://github.com/alenajk/skillshare-finder-project/

-- Create a virtual environment in your local directory:

![image](/static/virtualenv.png)

![image](/static/source.png)

-- Install requirements.txt:

![image](/static/req.png)

-- Get your own secret key for Twilio and add to a file titled secrets.sh.

-- Set up a phone_secret.sh file to seed database with users that have your phone number (so that you can send Twilio messages to yourself).

-- Create and seed the database:

![image](/static/model.png)

![image](/static/db-create.png)

-- Run the app:

![image](/static/app.png)

-- Navigate to localhost:5000 in your browser, create and account, and get started!
