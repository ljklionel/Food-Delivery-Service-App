
from flask import Flask, request, current_app, g, jsonify
from db import get_db, close_db
import psycopg2
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, current_user, login_required
from user import User
from datetime import datetime
from datetime import timedelta  

app = Flask(__name__)
app.secret_key = 'super secret key'
CORS(app, expose_headers=['Access-Control-Allow-Origin'], supports_credentials=True)
bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.init_app(app)

# AUTHENTICATION

roles_dict = {
    'customer': 'Customers',
    'rider': 'DeliveryRiders',
    'staff': 'RestaurantStaffs',
    'manager': 'FDSManagers'
}

@login_manager.user_loader
def load_user(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM Users WHERE username='%s';" % id)
    res = cursor.fetchone()
    return User(id) if res else None

@app.route("/register", methods=['POST'])
def register():
    ok = ({'ok': 1, 'msg': 'User created'}, 201)
    not_ok = ({'ok': 0, 'msg': 'Username already exists'}, 200)

    data = request.json
    username, password, firstname, lastname, phonenum, role = data['username'], data['password'], data['firstname'], data['lastname'], data['phonenum'], data['role']

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM Users WHERE username='%s'" % username)
    result = cursor.fetchone()
    if result is None:
        hash = bcrypt.generate_password_hash(password).decode()
        cursor = conn.cursor()
        cursor.execute('BEGIN;')
        cursor.execute("INSERT INTO Users(username, hashedPassword, firstName, lastName, phoneNumber) VALUES ('%s','%s','%s','%s','%s');" % (username, hash, firstname, lastname, phonenum))
        cursor.execute("INSERT INTO %s(username) VALUES ('%s');" % (roles_dict[role], username))
        cursor.execute('COMMIT;')
        user = User(username)
        if not login_user(user):
            return not_ok
        return ok
    else:
        return not_ok

@app.route("/signin", methods=['POST'])
def signin():

    ok = ({'ok': 1, 'msg': 'Sign in successful'}, 200)
    not_ok = ({'ok': 0, 'msg': 'User not found'}, 200)

    data = request.json
    username, password, role = data['username'], data['password'], data['role']
    hash = bcrypt.generate_password_hash(password).decode()

    conn = get_db()

    cursor1 = conn.cursor()
    cursor1.execute("SELECT 1 FROM %s WHERE username='%s';" % (roles_dict[role], username)) # check if role is correct
    result1 = cursor1.fetchone()

    if not result1:
        return not_ok

    cursor2 = conn.cursor()
    cursor2.execute("SELECT hashedPassword FROM Users WHERE username='%s';" % (username)) # check if password is correct
    result2 = cursor2.fetchone()
    pw_hash = result2[0]

    if not result2 or not bcrypt.check_password_hash(pw_hash, password):
        return not_ok

    user = User(username)
    if not login_user(user):
        return not_ok

    return ok


# RESTAURANT STAFF

@app.route("/restaurants")
def get_restaurants():
    keyword = request.args.get('keyword')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT rname FROM Restaurants WHERE rname ILIKE '%s%%';" % keyword)
    result = cursor.fetchmany(10)
    return ({'result': result}, 200)

@app.route("/join_restaurant", methods=['POST'])
@login_required
def join_restaurant():
    username = current_user.get_id()
    data = request.json
    rname = data['restaurant']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM WorksAt WHERE rname = %s AND username = %s;", (rname, username))
    result = cursor.fetchone()
    if result:
        return ({'ok': 0, 'msg': '%s already works at %s' % (username, rname)}, 200)

    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute("INSERT INTO WorksAt(rname, username) VALUES (%s, %s);", (rname, username))
    cursor.execute("COMMIT;")

    return ({'ok': 1, 'msg': '%s now works at %s!' % (username, rname)}, 200)

@app.route("/my_restaurants")
@login_required
def get_my_restaurants():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT rname FROM WorksAt WHERE username = '%s';" % username)
    result = cursor.fetchall()
    return ({'result': result}, 200)

@app.route("/restaurant_items")
@login_required
def get_restaurant_items():
    rname = request.args.get('restaurant')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT fname, avail FROM Sells WHERE rname = %s", (rname,))
    result = cursor.fetchall()
    return ({'result': result}, 200)

@app.route("/restaurant_orders")
@login_required
def get_restaurant_orders():
    rname, limit, offset = request.args.get('restaurant'), request.args.get('limit'), request.args.get('offset')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT fname, quantity, time FROM Orders NATURAL JOIN ContainsFood " + 
        "WHERE rname = %s AND orderTime >= now()::date AND orderTime < now()::date + INTERVAL '1 day' ORDER BY orderTime DESC LIMIT %s OFFSET %s;", (rname, limit, offset))
    result = cursor.fetchall()
    return ({'result': result}, 200)

@app.route("/restaurant_summary")
@login_required
def get_restaurant_summary():
    rname = request.args.get('restaurant')
    year, month = request.args.get('year'), request.args.get('month')
    start_time = datetime(year, month, 1)
    end_time = start_time + timedelta(months=1) - timedelta(seconds=1)
    conn = get_db()
    # number of completed orders
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM Orders WHERE rname = %s AND deliveryTime BETWEEN %s AND %s", (rname, start_time, end_time))
    completed_orders = cursor.fetchone()[0]
    # # total cost of all completed orders
    # cursor = conn.cursor()
    # cursor.execute

    # # top 5 favorite food items
    # cursor = conn.cursor()


    cursor.execute('')
    result = cursor.fetchall()
    return ({'result': result}, 200)

if __name__ == '__main__':
    app.run()