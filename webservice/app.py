
from flask import Flask, request, current_app, g, jsonify
from db import get_db, close_db
import psycopg2
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, current_user, login_required, logout_user
from user import User
from datetime import datetime
from datetime import timedelta  
from dateutil.relativedelta import relativedelta # $ pip install python-dateutil

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

@app.route("/signout", methods=['POST'])
@login_required
def logout():
    logout_user()
    return {}, 200

# RESTAURANT STAFF

@app.route("/restaurants")
@login_required
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
    cursor.execute("SELECT fname, quantity, orderTime FROM Orders NATURAL JOIN ContainsFood " + 
        "WHERE rname = %s AND orderTime >= now()::date AND orderTime < now()::date + INTERVAL '1 day' ORDER BY orderTime DESC LIMIT %s OFFSET %s;", (rname, limit, offset))
    result = cursor.fetchall()
    return ({'result': result}, 200)

def addMonths(d,x):
    newmonth = ((( d.month - 1) + x ) % 12 ) + 1
    newyear  = int(d.year + ((( d.month - 1) + x ) / 12 ))
    return datetime( newyear, newmonth, d.day)

@app.route("/current_restaurant_summary")
@login_required
def get_restaurant_summary():
    rname = request.args.get('restaurant')
    now = datetime.now()
    year, month = now.year, now.month
    start_time = datetime(year, month, 1)
    end_time = addMonths(start_time, 1) - timedelta(seconds=1)
    conn = get_db()
    # number of completed orders
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM Orders WHERE rname = %s AND deliveryTime BETWEEN %s AND %s", (rname, start_time, end_time))
    completed_orders = cursor.fetchone()[0]
    # total cost of all completed orders
    cursor = conn.cursor()
    cursor.execute("SELECT sum(price * quantity) FROM Orders NATURAL JOIN ContainsFood NATURAL JOIN Sells WHERE rname = %s AND deliveryTime BETWEEN %s AND %s",
        (rname, start_time, end_time))
    total_cost = cursor.fetchone()[0]
    # top 5 favorite food items
    cursor = conn.cursor()
    cursor.execute('SELECT fname, sum(quantity) FROM Orders NATURAL JOIN ContainsFood WHERE rname = %s AND deliveryTime BETWEEN %s AND %s GROUP BY fname ORDER BY sum(quantity) DESC LIMIT 5',
        (rname, start_time, end_time))
    top_five = cursor.fetchall()

    result = {'completed_orders': completed_orders, 'total_cost': total_cost, 'top_five': top_five}
    return ({'result': result}, 200)

@app.route("/all_restaurant_summary")
@login_required
def get_all_restaurant_summary():
    rname = request.args.get('restaurant')

    now = datetime.now()
    year, month = now.year, now.month
    start_time = datetime(year, month, 1)
    end_time = addMonths(start_time, 1) - timedelta(seconds=1)
    conn = get_db()
    result = []
    for i in range(0, 25): # show at most the last 2 years of summary
        cur_start_time = start_time - relativedelta(months=i)
        cur_end_time = end_time - relativedelta(months=i)
        # number of completed orders
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) FROM Orders WHERE rname = %s AND deliveryTime BETWEEN %s AND %s", (rname, cur_start_time, cur_end_time))
        completed_orders = cursor.fetchone()[0]
        if completed_orders == 0 and i != 0: 
            continue
        # total cost of all completed orders
        cursor = conn.cursor()
        cursor.execute("SELECT sum(price * quantity) FROM Orders NATURAL JOIN ContainsFood NATURAL JOIN Sells WHERE rname = %s AND deliveryTime BETWEEN %s AND %s",
            (rname, cur_start_time, cur_end_time))
        total_cost = cursor.fetchone()[0]
        # top 5 favorite food items
        cursor = conn.cursor()
        cursor.execute('SELECT fname, sum(quantity) FROM Orders NATURAL JOIN ContainsFood WHERE rname = %s AND deliveryTime BETWEEN %s AND %s GROUP BY fname ORDER BY sum(quantity) DESC LIMIT 5',
            (rname, cur_start_time, cur_end_time))
        top_five = cursor.fetchall()
        res = {'year':cur_start_time.year, 'month':cur_start_time.month, 'completed_orders': completed_orders, 'total_cost': total_cost, 'top_five': top_five}
        result.append(res)
    return ({'result': result}, 200)

@app.route("/ongoing_restaurant_promo")
@login_required
def get_ongoing_restaurant_promo():
    rname = request.args.get('restaurant')
    now = datetime.now()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT promoId, endDate, count(deliveryTime) FROM Promotions P LEFT JOIN Orders O ON P.rname = O.rname WHERE P.rname = %s and %s BETWEEN startDate AND endDate + INTERVAL '1 day' " + 
        "AND (deliveryTime IS NULL OR deliveryTime BETWEEN startDate AND endDate) GROUP BY promoId, endDate ORDER BY endDate;", (rname, now))
    result = cursor.fetchall()
    return ({'result': result}, 200)

@app.route("/restaurant_promo")
@login_required
def get_restaurant_promo():
    rname = request.args.get('restaurant')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT promoId, description, startDate, endDate, discount, count(deliveryTime) FROM Promotions P LEFT JOIN Orders O ON P.rname = O.rname WHERE P.rname = %s GROUP BY promoId, P.rname ORDER BY startDate DESC, endDate DESC;", (rname,))
    result = cursor.fetchall()

    for i, r in enumerate(result): # fix decimal is not serializable
        l = list(result[i])
        l[4] = float(l[4])
        result[i] = tuple(l)
    return ({'result': result}, 200)

@app.route("/edit_availability", methods=['POST'])
@login_required
def edit_availability():
    data = request.json
    rname, updates = data['restaurant'], data['updates']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    print(updates)
    for fname in updates:
        cursor.execute("UPDATE Sells SET avail = %s WHERE fname = %s AND rname = %s;", (updates[fname], fname, rname))
    cursor.execute("COMMIT;")

    return ({}, 200)

@app.route("/employee_page")
@login_required
def get_my_employee_page():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM DeliveryRiders WHERE username = '%s';" % username)
    conn.commit()
    result = cursor.fetchone()
    return ({'result': result}, 200)

@app.route("/get_full_time")
@login_required
def get_full_time():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM FullTimers WHERE username = '%s';" % username)
    result = cursor.fetchone()
    return ({'result': result}, 200)

@app.route("/get_part_time")
@login_required
def get_part_time():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM PartTimers WHERE username = '%s';" % username)
    result = cursor.fetchone()
    return ({'result': result}, 200)

@app.route("/get_work_hours")
@login_required
def get_work_hours():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT workHours FROM PartTimers WHERE username = '%s';" % username)
    result = cursor.fetchone()
    return ({'result': result}, 200)

@app.route("/get_salary")
@login_required
def get_salary():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT salary FROM DeliveryRiders WHERE username = '%s';" % username)
    result = cursor.fetchone()
    return ({'result': result}, 200)

@app.route("/add_full_time", methods=['POST'])
@login_required
def add_full_time():
    username = current_user.get_id()
    data = request.json
    workDay, startHour = data['startDay'], data['shift']
    startHour = str(int(startHour)+9)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT endHour FROM FullTimeShifts WHERE workDay = %s AND startHour = %s;", (workDay, startHour))
    endHour = cursor.fetchone()[0]
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute("INSERT INTO FullTimers(username) VALUES ('%s');" % (username))
    cursor.execute("INSERT INTO MonthlyWorkSched(username, workDay, startHour, endHour) VALUES (%s, %s, %s, %s);", (username, workDay, startHour, endHour))
    cursor.execute("COMMIT;")
    return ({'ok': 1, 'msg': '%s now works as Fulltimer!' % (username)}, 200)

@app.route("/add_part_time_sched", methods=['POST'])
@login_required
def add_part_time_sched():
    username = current_user.get_id()
    data = request.json
    workDay, startHour, endHour = data['workDay'], data['startHour'], data['endHour']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute("INSERT INTO WeeklyWorkSched(username, workDay, startHour, endHour) VALUES (%s, %s, %s, %s);", (username, workDay, startHour, endHour))
    cursor.execute("COMMIT;")
    return ({'ok': 1, 'msg': '%s now works as Parttimer!' % (username)}, 200)

@app.route("/add_part_time", methods=['POST'])
@login_required
def add_part_time():
    username = current_user.get_id()
    data = request.json
    totalHours = data['totalHours']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute("INSERT INTO PartTimers(username, workHours) VALUES (%s, %s);", (username, totalHours))
    cursor.execute("COMMIT;")
    return ({'ok': 1, 'msg': '%s now works as Parttimer!' % (username)}, 200)

if __name__ == '__main__':
    app.run()