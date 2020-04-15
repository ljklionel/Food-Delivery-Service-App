import random
from flask import Flask, request, current_app, g, jsonify
from db import get_db, close_db
import psycopg2
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, current_user, login_required, logout_user
from user import User
from datetime import datetime
from datetime import timedelta
from dateutil.relativedelta import relativedelta  # $ pip install python-dateutil
import random
from random import seed
from random import randint
from random import randrange
import datetime as mydatetime


app = Flask(__name__)
app.secret_key = 'super secret key'
CORS(app, expose_headers=[
     'Access-Control-Allow-Origin'], supports_credentials=True)
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
    username, password, firstname, lastname, phonenum, role = data['username'], data[
        'password'], data['firstname'], data['lastname'], data['phonenum'], data['role']

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM Users WHERE username='%s'" % username)
    result = cursor.fetchone()
    if result is None:
        hash = bcrypt.generate_password_hash(password).decode()
        cursor = conn.cursor()
        cursor.execute('BEGIN;')
        cursor.execute("INSERT INTO Users(username, hashedPassword, firstName, lastName, phoneNumber, joinDate) VALUES ('%s','%s','%s','%s','%s', now()::date);" % (
            username, hash, firstname, lastname, phonenum))
        cursor.execute("INSERT INTO %s(username) VALUES ('%s');" %
                       (roles_dict[role], username))
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
    cursor1.execute("SELECT 1 FROM %s WHERE username='%s';" %
                    (roles_dict[role], username))  # check if role is correct
    result1 = cursor1.fetchone()

    if not result1:
        return not_ok

    cursor2 = conn.cursor()
    cursor2.execute("SELECT hashedPassword FROM Users WHERE username='%s';" % (
        username))  # check if password is correct
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

@app.route("/user_data")
@login_required
def user_data():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT username, firstName, lastName, phoneNumber FROM Users WHERE username = %s", (username,)
    )
    return ({'result': cursor.fetchone()}, 200)

@app.route("/edit_profile", methods=['POST'])
@login_required
def edit_profile():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    updates = request.json['updates']
    if 'firstName' in updates:
        cursor.execute("UPDATE Users SET firstName = %s WHERE username = %s;", (updates['firstName'], username))

    if 'lastName' in updates:
        cursor.execute("UPDATE Users SET lastName = %s WHERE username = %s;", (updates['lastName'], username))

    if 'phoneNumber' in updates:
        cursor.execute("UPDATE Users SET phoneNUmber = %s WHERE username = %s;", (updates['phoneNumber'], username))

    if 'password' in updates:
        cursor.execute("UPDATE Users SET hashedPassword = %s WHERE username= %s;", (bcrypt.generate_password_hash(updates['password']).decode(), username))

    cursor.execute('COMMIT;')
    return ({'result': {'ok': 1, 'msg': 'Update successful'}}, 200)

@app.route("/edit_password", methods=['POST'])
@login_required
def edit_password():
    username = current_user.get_id()
    conn = get_db()
    oldPassword = request.json['updates']['oldPassword']
    newPassword = request.json['updates']['newPassword']
    cursor = conn.cursor()
    cursor.execute("SELECT hashedPassword FROM Users WHERE username = %s;", (username,))
    hashedPassword = cursor.fetchone()[0]
    if bcrypt.check_password_hash(hashedPassword, oldPassword):
        cursor = conn.cursor()
        cursor.execute("BEGIN;")
        cursor.execute("UPDATE Users SET hashedPassword = %s WHERE username= %s;", (bcrypt.generate_password_hash(newPassword).decode(), username))
        cursor.execute("COMMIT;")
        return {'result': {'ok': 1, 'msg': 'Update successful'}}
    else:
        return {'result': {'ok': 0, 'msg': 'Wrong Password'}}
    
# RESTAURANT STAFF

@app.route("/restaurants")
@login_required
def get_restaurants():
    keyword = request.args.get('keyword')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT rname FROM Restaurants WHERE rname ILIKE '%s%%';" % keyword)
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
    cursor.execute(
        "SELECT 1 FROM WorksAt WHERE rname = %s AND username = %s;", (rname, username))
    result = cursor.fetchone()
    if result:
        return ({'ok': 0, 'msg': '%s already works at %s' % (username, rname)}, 200)

    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute(
        "INSERT INTO WorksAt(rname, username) VALUES (%s, %s);", (rname, username))
    cursor.execute("COMMIT;")

    return ({'ok': 1, 'msg': '%s now works at %s!' % (username, rname)}, 200)


@app.route("/my_restaurants")
@login_required
def get_my_restaurants():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT rname FROM WorksAt WHERE username = '%s';" % username)
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


def addMonths(d, x):
    newmonth = (((d.month - 1) + x) % 12) + 1
    newyear = int(d.year + (((d.month - 1) + x) / 12))
    return datetime(newyear, newmonth, d.day)


@app.route("/current_restaurant_summary")
@login_required
def get_restaurant_summary():
    rname = request.args.get('restaurant')
    now = datetime.now()
    year, month = now.year, now.month
    start_time = datetime(year, month, 1)
    end_time = start_time + relativedelta(months=1) - relativedelta(seconds=1)
    conn = get_db()
    # number of completed orders and total cost of all completed orders
    cursor = conn.cursor()
    cursor.execute("SELECT count(*), sum(amtPayable) * 10/12 FROM Orders WHERE rname = %s AND deliveryTime BETWEEN %s AND %s",
                   (rname, start_time, end_time))
    res = cursor.fetchone()
    completed_orders = res[0]
    total_cost = res[1]
    # top 5 favorite food items
    cursor = conn.cursor()
    cursor.execute('SELECT fname, sum(quantity) FROM Orders O JOIN ContainsFood C ON rname = %s AND deliveryTime BETWEEN %s AND %s AND O.orderid = C.orderid GROUP BY fname ORDER BY sum(quantity) DESC LIMIT 5',
                   (rname, start_time, end_time))
    top_five = cursor.fetchall()

    result = {'completed_orders': completed_orders,
              'total_cost': total_cost, 'top_five': top_five}
    return ({'result': result}, 200)


@app.route("/all_restaurant_summary")
@login_required
def get_all_restaurant_summary():
    rname = request.args.get('restaurant')

    result = {}
    conn = get_db()

    cursor = conn.cursor()
    cursor.execute("SELECT count(*), sum(amtPayable) * 10/12, extract(year from deliveryTime), extract(mon from deliveryTime) " +
        "FROM Orders " + 
        "WHERE rname = %s " + 
        "GROUP BY 3,4 "
        "ORDER BY 3 DESC,4 DESC", (rname,))
    result['orders_and_fee'] = cursor.fetchall()

    cursor = conn.cursor()
    cursor.execute(
        "with Ranked as (" +
            "SELECT *, rank() OVER (" + 
                "PARTITION BY year, mon " +
                "ORDER BY quantity DESC"
            ") FROM (" +
                "SELECT sum(quantity) as quantity, fname, extract(year from deliveryTime) as year, extract(month from deliveryTime) as mon " +
                "FROM Orders NATURAL JOIN ContainsFood " +
                "WHERE rname = %s "
                "GROUP BY extract(year from deliveryTime), extract(month from deliveryTime), fname"
            ") as FoodQuantities " + 
        ") SELECT * FROM Ranked WHERE rank <= 5 ORDER BY year DESC, mon DESC, rank", (rname,))
    result['top_five'] = cursor.fetchall()

    return ({'result': result}, 200)


@app.route("/ongoing_restaurant_promo")
@login_required
def get_ongoing_restaurant_promo():
    rname = request.args.get('restaurant')
    now = datetime.now()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT promoId, endDate, count(deliveryTime) FROM Promotions P LEFT JOIN Orders O ON P.rname = O.rname " + 
        "AND deliveryTime BETWEEN startDate AND endDate WHERE P.rname = %s and %s BETWEEN startDate AND endDate + INTERVAL '1 day' " +
                   "GROUP BY promoId, endDate ORDER BY endDate;", (rname, now))
    result = cursor.fetchall()
    return ({'result': result}, 200)


@app.route("/restaurant_promo")
@login_required
def get_restaurant_promo():
    rname = request.args.get('restaurant')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT promoId, description, startDate, endDate, discount, count(deliveryTime) FROM Promotions P LEFT JOIN Orders O ON P.rname = O.rname " + 
        "AND deliveryTime BETWEEN startDate AND endDate " +
        "WHERE P.rname = %s GROUP BY promoId, P.rname ORDER BY startDate DESC, endDate DESC;", (rname,))
    result = cursor.fetchall()
    
    for i, r in enumerate(result):  # fix decimal is not serializable
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
    for fname in updates:
        cursor.execute("UPDATE Sells SET avail = %s WHERE fname = %s AND rname = %s;",
                       (updates[fname], fname, rname))
    cursor.execute("COMMIT;")

    return ({}, 200)


@app.route("/employee_page")
@login_required
def get_my_employee_page():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT username FROM DeliveryRiders WHERE username = '%s';" % username)
    conn.commit()
    result = cursor.fetchone()
    return ({'result': result}, 200)


@app.route("/get_full_time")
@login_required
def get_full_time():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT username FROM FullTimers WHERE username = '%s';" % username)
    result = cursor.fetchone()
    return ({'result': result}, 200)


@app.route("/get_part_time")
@login_required
def get_part_time():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT username FROM PartTimers WHERE username = '%s';" % username)
    result = cursor.fetchone()
    return ({'result': result}, 200)


@app.route("/get_work_hours")
@login_required
def get_work_hours():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT SUM(endHour - startHour) FROM WeeklyWorkSched WHERE username = '%s';" % (username))
    result = cursor.fetchone()
    return ({'result': result}, 200)

@app.route("/get_salary")
@login_required
def get_salary():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT salary FROM DeliveryRiders WHERE username = '%s';" % username)
    salary = cursor.fetchone()
    salary = float(salary[0])
    cursor.execute("SELECT amtPayable FROM Orders WHERE riderUsername = '%s' AND deliveryTime IS NOT NULL;" % username)
    result = cursor.fetchall()
    for val in result:
        salary = salary + (float(val[0]) * (1/5))
    return ({'result': salary}, 200)

@app.route("/add_full_time", methods=['POST'])
@login_required
def add_full_time():
    username = current_user.get_id()
    data = request.json
    salary = data['salary']
    if salary == '0':
        salary = '1000'
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute(
        "UPDATE DeliveryRiders SET salary = %s WHERE username = %s;", (salary, username))
    cursor.execute(
        "INSERT INTO FullTimers(username) VALUES ('%s') ON CONFLICT DO NOTHING;" % (username))
    cursor.execute("COMMIT;")
    return ({'ok': 1, 'msg': '%s now works as Fulltimer!' % (username)}, 200)

@app.route("/add_full_time_sched", methods=['POST'])
@login_required
def add_full_time_sched():
    username = current_user.get_id()
    data = request.json
    workDayShift = data['workDayShift']
    conn = get_db()
    cursor = conn.cursor()
    endHourDict = {}
    for workDay in workDayShift:
        cursor.execute(
            "SELECT endHour FROM FullTimeShifts WHERE workDay = %s AND startHour = %s;", (workDay,str(int(workDayShift[workDay])+9)))
        endHourDict[workDay] = cursor.fetchone()[0]
    cursor = conn.cursor()
    cursor.execute("BEGIN TRANSACTION;")
    cursor.execute("SET CONSTRAINTS ALL DEFERRED;")
    result = cursor.execute(
        "DELETE FROM MonthlyWorkSched WHERE username = '%s';" % (username))
    for workDay in workDayShift:
        cursor.execute("INSERT INTO MonthlyWorkSched(username, workDay, startHour, endHour) VALUES (%s, %s, %s, %s);", 
                (username, workDay, str(int(workDayShift[workDay])+9), str(endHourDict[workDay])))
    cursor.execute("COMMIT;")
    return ({'ok': 1, 'msg': '%s now works as fulltimer!' % (username)}, 200)

@app.route("/add_part_time_sched", methods=['POST'])
@login_required
def add_part_time_sched():
    username = current_user.get_id()
    data = request.json
    triple = data['triple']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN TRANSACTION;")
    cursor.execute("SET CONSTRAINTS ALL DEFERRED;")
    result = cursor.execute(
        "DELETE FROM WeeklyWorkSched WHERE username = '%s';" % (username))
    for i in triple:
        cursor.execute("INSERT INTO WeeklyWorkSched(username, workDay, startHour, endHour) VALUES (%s, %s, %s, %s);",
                    (username, i['day'], i['start'], i['end']))
    cursor.execute("COMMIT;")
    return ({'ok': 1, 'msg': '%s now works as Parttimer!' % (username)}, 200)


@app.route("/add_part_time", methods=['POST'])
@login_required
def add_part_time():
    username = current_user.get_id()
    data = request.json
    salary = data['salary']
    if salary == '0':
        salary = '500'
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute(
        "UPDATE DeliveryRiders SET salary = %s WHERE username = %s;", (salary, username))
    cursor.execute("INSERT INTO PartTimers(username) VALUES ('%s') ON CONFLICT (username) DO NOTHING;"% (username))
    cursor.execute("COMMIT;")
    return ({'ok': 1, 'msg': '%s now works as Parttimer!' % (username)}, 200)


@app.route("/get_part_time_sched")
@login_required
def get_part_time_sched():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT workDay, startHour, endHour FROM WeeklyWorkSched WHERE username = '%s' ORDER BY (workDay, startHour);" % (username))
    result = cursor.fetchall()
    return ({'result': result}, 200)


@app.route("/get_full_time_sched")
@login_required
def get_full_time_sched():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT workDay, startHour FROM MonthlyWorkSched WHERE username = '%s' ORDER BY (workDay, startHour);" % (username))
    result = cursor.fetchall()
    return ({'result': result}, 200)

@app.route("/get_delivery_count")
@login_required
def get_delivery_count():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COUNT(*) FROM Orders WHERE riderUsername = '%s' AND deliveryTime IS NOT NULL;" % (username))
    result = cursor.fetchone()
    return ({'result': result}, 200)


@app.route("/get_avg_rating")
@login_required
def get_avg_rating():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT AVG(CAST(rating as Float)) FROM Orders WHERE riderUsername = '%s' AND deliveryTime IS NOT NULL;" % (username))
    result = cursor.fetchone()
    return ({'result': result}, 200)


@app.route("/get_delivery")
@login_required
def get_delivery():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT orderid, location, orderTime, departTime1, arriveTime, departTime2, rname FROM Orders WHERE riderUsername = '%s' AND deliveryTime IS NULL;" % (username))
    result = cursor.fetchone()
    return ({'result': result}, 200)


@app.route("/set_depart_time_1", methods=['POST'])
@login_required
def set_depart_time_1():
    username = current_user.get_id()
    data = request.json
    departTime1, orderId = data['departTime1'], data['orderId']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute(
        "UPDATE Orders SET departTime1 = %s WHERE orderid = %s;", (departTime1, orderId))
    cursor.execute("COMMIT;")
    return ({'ok': 1, 'msg': 'Dispatch time %s has been recorded' % (departTime1)}, 200)


@app.route("/set_arrive_time", methods=['POST'])
@login_required
def set_arrive_time():
    username = current_user.get_id()
    data = request.json
    arriveTime, orderId = data['arriveTime'], data['orderId']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute(
        "UPDATE Orders SET arriveTime = %s WHERE orderid = %s;", (arriveTime, orderId))
    cursor.execute("COMMIT;")
    return ({'ok': 1, 'msg': 'Arrival time %s has been recorded' % (arriveTime)}, 200)


@app.route("/set_otw_time", methods=['POST'])
@login_required
def set_otw_time():
    username = current_user.get_id()
    data = request.json
    departTime2, orderId = data['departTime2'], data['orderId']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute(
        "UPDATE Orders SET departTime2 = %s WHERE orderid = %s;", (departTime2, orderId))
    cursor.execute("COMMIT;")
    return ({'ok': 1, 'msg': 'Arrival time %s has been recorded' % (departTime2)}, 200)


@app.route("/set_delivery_time", methods=['POST'])
@login_required
def set_delivery_time():
    username = current_user.get_id()
    data = request.json
    deliveryTime, orderId = data['deliveryTime'], data['orderId']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute(
        "UPDATE Orders SET deliveryTime = %s WHERE orderid = %s;", (deliveryTime, orderId))
    cursor.execute("COMMIT;")
    return ({'ok': 1, 'msg': 'Arrival time %s has been recorded' % (deliveryTime)}, 200)

# == Customers Start ==

@app.route("/my_info")
@login_required
def get_my_info():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Customers WHERE username = '%s';" % username)
    result = cursor.fetchall()
    return ({'result': result}, 200)


@app.route("/restaurant_sells")
@login_required
def get_restaurant_sells():
    rname = request.args.get('restaurant')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT fname, avail, price FROM Sells WHERE rname = %s", (rname,))
    result = cursor.fetchall()
    return ({'result': result}, 200)


@app.route("/make_order", methods=['POST'])
@login_required
def make_order():
    data = request.json
    rname, order, totalPrice, fee, timeStamp, customer, creditCard, location, totalDiscount = data['restaurant'], data['order'], data[
        'totalPrice'], data['fee'], data['timeStamp'], data['customer'], data['creditCard'], data['location'], data['totalDiscount']
    deliveryRider = connectDeliveryRider()
    deliveryRider = deliveryRider[0]['deliveryRider']
    
    if deliveryRider:
        # Response have to include: orderID, riderUsername
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT max(orderid) from Orders")
        orderId = cursor.fetchone()[0] + 1

        # To make sure the constraint is not violated, we have to insert orders and contains in one transaction
        cursor.execute("BEGIN TRANSACTION;")
        cursor.execute("INSERT INTO Orders(paymentMethod, location, amtPayable, orderTime, riderUsername, customerUsername, rname) VALUES (%s, %s, %s, %s, %s, %s, %s);",
                       (creditCard, location, round(totalPrice + fee - totalDiscount, 2), timeStamp, deliveryRider, customer, rname,))
        for fname in order:
            if order[fname] == 0:  # Quantity is 0
                continue
            cursor.execute(
                "INSERT INTO ContainsFood(quantity, fname, orderid) VALUES(%s, %s, %s);", (order[fname], fname, orderId))
        cursor.execute("COMMIT;")

        return ({'orderId': orderId, 'deliveryRider': deliveryRider}, 200)
    else:
        return ({}, 200)


def convertDayToNumber(day):
    if day == 'Mon':
        return '1'
    if day == 'Tue':
        return '2'
    if day == 'Wed':
        return '3'
    if day == 'Thu':
        return '4'
    if day == 'Fri':
        return '5'
    if day == 'Sat':
        return '6'
    if day == 'Sun':
        return '7'


@app.route("/connectDeliveryRider", methods=['POST'])
@login_required
def connectDeliveryRider():
    conn = get_db()
    now = datetime.now()
    day = str(now.day)
    hour = str(now.hour)
    cursor = conn.cursor()
    day = mydatetime.datetime(now.year, now.month, now.day).strftime("%a")
    dayInNumber = convertDayToNumber(day)

    # Randomly select one
    # cursor.execute("SELECT username FROM DeliveryRiders")
    # totalResult = cursor.fetchone()
    # allDr = totalResult

    # Select according to schedule
    cursor.execute("SELECT username FROM MonthlyWorkSched MWS natural join FullTimeShifts FTS WHERE MWS.workday = %s AND (%s < FTS.breakStart OR %s >= FTS.breakEnd) AND MWS.startHour <= %s AND MWS.endHour > %s", (dayInNumber, hour, hour, hour, hour))
    fullTimers = cursor.fetchall()
    cursor.execute("SELECT username FROM WeeklyWorkSched WWS natural join PartTimeShifts PTS WHERE WWS.workday = %s AND WWS.startHour <= %s AND WWS.endHour > %s", (dayInNumber, hour, hour))
    partTimers = cursor.fetchall()

    allDr = fullTimers + partTimers
    if (len(allDr) != 0):
        selectedDeliveryRider = random.choice(allDr)
        return ({'deliveryRider': selectedDeliveryRider}, 200)
    else:
        return ({'deliveryRider': ''}, 200)

    # if monthlyResult:
    #     if weeklyResult:
    #         totalResult = monthlyResult + weeklyResult
    #     else:
    #         totalResult = monthlyResult
    # else:
    #     if weeklyResult:
    #         totalResult = weeklyResult

    # if (len(totalResult) != 0):
    #     selectedDeliveryRider = random.choice(totalResult)
    #     return ({'deliveryRider': selectedDeliveryRider}, 200)
    # else:
    #     return ({'deliveryRider': ''}, 200)


@app.route("/customer_orders")
@login_required
def customer_orders():
    currentCustomer, limit, offset = request.args.get(
        'currentCustomer'), request.args.get('limit'), request.args.get('offset')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT fname, quantity, orderTime, paymentMethod, location, amtPayable, departTime1, arriveTime, departTime2, deliveryTime, riderUsername, rname, orderid FROM Orders NATURAL JOIN ContainsFood " +
                   "WHERE quantity <> 0 AND customerUsername = %s ORDER BY orderTime DESC LIMIT %s OFFSET %s;", (currentCustomer, limit, offset))
    result = cursor.fetchall()
    return ({'result': result}, 200)


@app.route("/update_credit_card", methods=['POST'])
@login_required
def update_credit_card():
    data = request.json
    creditCard, customerName = data['creditCard'], data['customerName']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute(
        "UPDATE Customers SET creditCard = %s WHERE username = %s;", (creditCard, customerName))
    cursor.execute("COMMIT;")
    return ({}, 200)


@app.route("/locations")
@login_required
def get_locations():
    keyword = request.args.get('keyword')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT location FROM Locations WHERE location ILIKE '%s%%' ORDER BY location ASC;" % keyword)
    result = cursor.fetchmany(10)
    return ({'result': result}, 200)


@app.route("/recent_locations")
@login_required
def get_recent_locations():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT location FROM Customers C, Orders O WHERE C.username = '%s' AND C.username = O.customerUsername GROUP BY location ORDER BY MAX(orderTime) DESC LIMIT 5;" % username)
    result = cursor.fetchall()
    return ({'result': result}, 200)


@app.route("/edit_review", methods=['POST'])
@login_required
def edit_review():
    data = request.json
    orderid, review, fname, rname = data['orderid'], data['review'], data['fname'], data['restaurant']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute(
        "UPDATE ContainsFood SET review = %s WHERE orderid = %s AND fname = %s;", (review, orderid, fname))
    cursor.execute("COMMIT;")

    return ({}, 200)


@app.route("/edit_rating", methods=['POST'])
@login_required
def edit_rating():
    data = request.json
    orderid, rating = data['orderid'], data['rating']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute(
        "UPDATE Orders SET rating = %s WHERE orderid = %s;", (rating, orderid))
    cursor.execute("COMMIT;")

    return ({}, 200)


@app.route("/get_restaurant_reviews")
@login_required
def get_restaurant_reviews():
    rname = request.args.get('restaurant')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT C.fname, review, O.customerUsername, O.orderTime FROM (ContainsFood C join Orders O on C.orderid = O.orderid) natural join Restaurants R where rname = %s AND C.review <> '' ORDER BY O.orderTime DESC LIMIT 8;", (rname,))
    result = cursor.fetchall()
    return ({'result': result}, 200)


@app.route("/update_reward_point", methods=['POST'])
@login_required
def update_reward_point():
    data = request.json
    rewardPoint, customerName = data['rewardPoint'], data['customerName']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute("UPDATE Customers SET rewardPoint = %s WHERE username = %s;",
                   (rewardPoint, customerName))
    cursor.execute("COMMIT;")
    return ({}, 200)


@app.route("/restaurant_menu")
@login_required
def get_restaurant_menu():
    rname = request.args.get('restaurant')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT fname, avail, price, minSpending FROM Sells natural join Restaurants WHERE rname = %s", (rname,))
    result = cursor.fetchall()
    return ({'result': result}, 200)


@app.route("/restaurant_promo_for_customers")
@login_required
def get_restaurant_promo_for_customers():
    rname = request.args.get('restaurant')
    now = datetime.now()
    conn = get_db()
    cursor = conn.cursor()
    # cursor.execute("SELECT promoId, endDate, discount FROM Promotions WHERE rname = %s and %s BETWEEN startDate and endDate + INTERVAL '1 day' ORDER BY endDate;", (rname, now))

    cursor.execute("SELECT promoId, endDate, discount FROM Promotions WHERE rname = %s and %s BETWEEN startDate AND endDate + INTERVAL '1 day' ORDER BY endDate;", (rname, now))

    restPromo = cursor.fetchall()

    for i, r in enumerate(restPromo):  # fix decimal is not serializable
        l = list(restPromo[i])
        l[2] = float(l[2])
        restPromo[i] = tuple(l)

    rname = 'aRandomName'  # Bypass some parsing error in the query
    cursor.execute("SELECT promoId, endDate, discount FROM FDSPromotions WHERE promoId <> %s AND %s BETWEEN startDate and endDate + INTERVAL '1 day' ORDER BY endDate;", (rname, now))
    fdsPromo = cursor.fetchall()

    for i, r in enumerate(fdsPromo):  # fix decimal is not serializable
        l = list(fdsPromo[i])
        l[2] = float(l[2])
        fdsPromo[i] = tuple(l)

    return ({'restPromo': restPromo, 'fdsPromo': fdsPromo}, 200)


@app.route("/food_and_restaurants_filtered", methods=['POST'])
@login_required
def get_food_and_restaurants_filtered():
    data = request.json
    keyword, foodCategories, check = data['keyword'], data['foodCategories'], data['check']
    conn = get_db()
    cursor = conn.cursor()

    if (check):  # Search by food
        cursor.execute(
            "SELECT rname, fname, category FROM Food natural join Sells WHERE fname ILIKE '%s%%';" % keyword)
        result = cursor.fetchall()
        result = filterCategories(result, foodCategories)

        restDict = {}
        for x in result:
            if restDict.get(x[0]) is not None:  # May be []
                restDict[x[0]].append(x[1] + " (" + x[2] + ")")
            else:
                restDict[x[0]] = []
                restDict[x[0]].append(x[1] + " (" + x[2] + ")")
        return ({'result': restDict}, 200)

    else:  # Search by restaurant
        cursor.execute(
            "SELECT rname, fname FROM Sells WHERE rname ILIKE '%s%%'" % keyword)
        result = cursor.fetchall()
        restDict = {}
        for x in result:
            if restDict.get(x[0]) is not None:  # May be []
                restDict[x[0]].append(x[1])
            else:
                restDict[x[0]] = []
                restDict[x[0]].append(x[1])
        return ({'result': restDict}, 200)



def filterCategories(allFood, foodCategories):
    filteredResult = []
    for food in allFood:
        if (food[2] in foodCategories):
            filteredResult.append(food)

    return filteredResult


# == Customers End ==

# FDS MANAGER

@app.route("/all_customers")
@login_required
def get_all_customers():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM Customers ORDER BY username ASC;")
    result = cursor.fetchall()
    return ({'result': result}, 200)


@app.route("/customers")
@login_required
def get_customers():
    keyword = request.args.get('keyword')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT username FROM Customers WHERE username ILIKE '%s%%' ORDER BY username ASC;" % keyword)
    result = cursor.fetchmany(10)
    return ({'result': result}, 200)


@app.route("/riders")
@login_required
def get_riders():
    keyword = request.args.get('keyword')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT username FROM DeliveryRiders WHERE username ILIKE '%s%%' ORDER BY username ASC;" % keyword)
    result = cursor.fetchmany(10)
    return ({'result': result}, 200)


@app.route("/all_customer_summary")
@login_required
def get_all_customer_summary():  # TODO new customer of the month -yuting
    conn = get_db()
    result = {}
    # number of orders
    cursor = conn.cursor()
    cursor.execute("SELECT count(*), sum(amtPayable) * 10/12, extract(year from deliveryTime), extract(mon from deliveryTime) "  +
    "FROM Orders GROUP BY 3,4 ORDER BY 3 DESC, 4 DESC;")
    result['orders_and_fee'] = cursor.fetchall()

    cursor = conn.cursor()
    cursor.execute("SELECT count(*), extract(year from joinDate), extract(mon from joinDate) FROM CUSTOMERS NATURAL JOIN USERS " +
    "GROUP BY 2, 3 ORDER BY 2 DESC, 3 DESC")
    result['all_new_customers'] = cursor.fetchall()

    return ({'result': result}, 200)


@app.route("/current_customer_summary")
@login_required
def get_customer_summary():
    username = request.args.get('customer')
    conn = get_db()
    result = {}

    cursor = conn.cursor()
    cursor.execute("SELECT count(*), sum(amtPayable) * 10/12,  extract(year from deliveryTime), extract(mon from deliveryTime) " +
    "FROM Orders WHERE customerUsername = %s GROUP BY 3,4 ORDER BY 3 DESC, 4 DESC ;",
                    (username,))
    result['orders_and_fee'] = cursor.fetchall()

    return ({'result': result}, 200)


@app.route("/current_location_summary")
def get_location_summary():
    location = request.args.get('location')
    print(location)
    now = datetime.now()
    start_time = datetime(now.year, now.month, now.day, now.hour)
    end_time = start_time + timedelta(hours=1) - timedelta(seconds=1)
    conn = get_db()
    result = []
    
    i = 0
    j = 0
    # for i in range(0, 25):  # show at most the last 1 day of summmary
    while i <= 24:
        cur_start_time = start_time - relativedelta(hours=j)
        print("In while loop")
        print("Curstarttime.hour: ", cur_start_time.hour)

        if cur_start_time.hour < 10 or cur_start_time.hour > 22:
            j += 1
            continue
        cur_end_time = end_time - relativedelta(hours=j)
        # of orders placed
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) FROM Orders WHERE location = %s AND orderTime BETWEEN %s AND %s;",
                       (location, cur_start_time, cur_end_time))
        location_orders = cursor.fetchone()[0]
        print(location_orders)
        res = {'day': cur_start_time, 'hour': cur_start_time.hour,
               'location_orders': location_orders}
        result.append(res)
        j += 1
        i += 1
    print("Result:", result)
    return ({'result': result}, 200)


@app.route("/current_rider_summary")
def get_rider_summary():
    username = request.args.get('rider')
    result = {}
    conn = get_db()
    cursor = conn.cursor()
    # number of orders, average delivery time, number of ratings, average rating
    cursor.execute("SELECT count(*), sum(EXTRACT(EPOCH FROM arriveTime - orderTime)/60)/count(*), count(rating), sum(rating)/count(rating), " + 
    "extract(year from deliveryTime), extract(mon from deliveryTime), sum(amtPayable) * 20/120 " +
    "FROM Orders WHERE riderUsername = %s GROUP BY 5, 6 ORDER BY 5 DESC, 6 DESC;",
                    (username,))
    result['orders_and_ratings'] = cursor.fetchall()

    # of hours worked
    cursor = conn.cursor()
    cursor.execute(
        "SELECT sum(endHour - startHour - (breakEnd - breakStart)) FROM MonthlyWorkSched natural join FullTimeShifts WHERE username = %s;", (username,))
    hours_worked = cursor.fetchone()[0]
    work_type = "fulltime"
    if hours_worked is None:
        work_type = "parttime"
        cursor = conn.cursor()
        cursor.execute(
            "SELECT sum(endHour - startHour) FROM WeeklyWorkSched WHERE username = %s;", (username,))
        hours_worked = cursor.fetchone()[0]
    result['hours_worked'] = hours_worked
    result['work_type'] = work_type

    # basic salary
    cursor = conn.cursor()
    cursor.execute(
        "SELECT sum(salary) FROM DeliveryRiders WHERE username = %s;", (username,))
    result['salary'] = cursor.fetchone()[0]

    return ({'result': result}, 200)


@app.route("/ongoing_FDS_promo")
@login_required
def get_ongoing_FDS_promo():
    now = datetime.now()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT promoId, endDate FROM FDSPromotions where %s BETWEEN startDate AND endDate + INTERVAL '1 day' " +
                   "ORDER BY endDate;", (now,))
    result = cursor.fetchall()
    return ({'result': result}, 200)


@app.route("/all_FDS_promo")
@login_required
def get_all_FDS_promo():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT promoId, promoDescription, startDate, endDate, discount FROM FDSPromotions ORDER BY startDate DESC, endDate DESC;")
    result = cursor.fetchall()

    for i, r in enumerate(result):  # fix decimal is not serializable
        l = list(result[i])
        l[4] = float(l[4])
        result[i] = tuple(l)
    return ({'result': result}, 200)


if __name__ == '__main__':
    app.run()
