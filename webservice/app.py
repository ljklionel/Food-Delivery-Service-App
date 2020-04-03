
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
        cursor.execute("INSERT INTO Users(username, hashedPassword, firstName, lastName, phoneNumber, joinDate) VALUES ('%s','%s','%s','%s','%s', now()::date);" % (username, hash, firstname, lastname, phonenum))
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

# == Customers Begin ==

@app.route("/my_info")
@login_required
def get_my_info():
    username = current_user.get_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Customers WHERE username = '%s';" % username)
    result = cursor.fetchall()
    print("Myinfo result: ", result)
    return ({'result': result}, 200)

@app.route("/restaurant_sells")
@login_required
def get_restaurant_sells():
    rname = request.args.get('restaurant')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT fname, avail, price FROM Sells WHERE rname = %s", (rname,))
    result = cursor.fetchall()
    return ({'result': result}, 200)

@app.route("/make_order", methods=['POST'])
@login_required
def make_order():
    data = request.json
    rname, order, totalPrice, fee, timeStamp, customer, creditCard, location = data['restaurant'], data['order'], data['totalPrice'], data['fee'], data['timeStamp'], data['customer'], data['creditCard'], data['location']
    deliveryRider = connectDeliveryRider()

    # Make order's data: 
    # {'restaurant': 'Amigos/Kings Classic', 
    # 'order': {'Hash browns': 0, 'Kaya toast': 0, 'Laksa': 0, 'Kimchi': 1}, 
    # 'totalPrice': 4.5, 
    # 'fee': 0.45, 
    # 'timeStamp': 'Wed Apr 01 2020 22:43:21 (+08)', 
    # 'customer': 'c', 
    # 'location': None} 

    if deliveryRider:
        # Response have to include: orderID, riderUsername
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("BEGIN;")
        # Update Orders first
        cursor.execute("INSERT INTO Orders(paymentMethod, location, fee, orderTime, riderUsername, customerUsername, rname) VALUES (%s, %s, %s, %s, %s, %s, %s);", (creditCard, location, totalPrice + fee, timeStamp, deliveryRider, customer, rname,))
        cursor.execute("COMMIT;")

        # Retrieve orderId from Orders
        cursor = conn.cursor()
        cursor.execute("SELECT orderid from Orders WHERE orderid >= all(SELECT orderid from Orders)")
        orderId = cursor.fetchall()[0]

        cursor = conn.cursor()
        cursor.execute("BEGIN;")
        for fname in order:
            print(fname)
            print(order[fname])
            cursor.execute("INSERT INTO ContainsFood(quantity, fname, orderid) VALUES(%s, %s, %s);", (order[fname], fname, orderId))
        cursor.execute("COMMIT;")

        return ({'orderId': orderId, 'deliveryRider': deliveryRider}, 200) 
    else:
        return ({}, 200)

def connectDeliveryRider():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("select username from DeliveryRiders")
    result = cursor.fetchone()
    print(result)
    return result[0]

    # todo

@app.route("/customer_orders")
@login_required
def customer_orders():
    currentCustomer, limit, offset = request.args.get('currentCustomer'), request.args.get('limit'), request.args.get('offset')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT fname, quantity, orderTime, paymentMethod, location, fee, departTime1, arriveTime, departTime2, deliveryTime, riderUsername, rname, orderid FROM Orders NATURAL JOIN ContainsFood " + 
        "WHERE quantity <> 0 AND customerUsername = %s ORDER BY orderTime DESC LIMIT %s OFFSET %s;", (currentCustomer, limit, offset))
    result = cursor.fetchall()
    return ({'result': result}, 200)

@app.route("/update_credit_card", methods=['POST'])
@login_required
def update_credit_card():
    data = request.json
    print("Data from updatecreditcard: ", data)
    creditCard, customerName = data['creditCard'], data['customerName']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("BEGIN;")
    cursor.execute("UPDATE Customers SET creditCard = %s WHERE username = %s;", (creditCard, customerName))
    cursor.execute("COMMIT;")
    print("Commited in update")
    return ({}, 200)

# == Customers End ==

if __name__ == '__main__':
    app.run()


#FDS MANAGER

@app.route("/all_customers")
@login_required
def get_all_customers():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM Customers;")
    result = cursor.fetchall()
    return ({'result': result}, 200)

@app.route("/customers")
@login_required
def get_customers():
    keyword = request.args.get('keyword')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM Customers WHERE username ILIKE '%s%%';" % keyword)
    result = cursor.fetchmany(10)
    return ({'result': result}, 200)

@app.route("/riders")
@login_required
def get_riders():
    keyword = request.args.get('keyword')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM DeliveryRiders WHERE username ILIKE '%s%%';" % keyword)
    result = cursor.fetchmany(10)
    return ({'result': result}, 200)

@app.route("/all_customer_summary")
@login_required
def get_all_customer_summary(): #TODO new customer of the month -yuting
    now = datetime.now()
    year, month = now.year, now.month
    start_time = datetime(year, month, 1)
    end_time = addMonths(start_time, 1) - timedelta(seconds=1)
    conn = get_db()
    result = []
    for i in range(0, 25): #show at most the last 2 years of summary
        cur_start_time = start_time - relativedelta(months=i)
        cur_end_time = end_time - relativedelta(months=i)
        # number of orders
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) FROM Orders WHERE deliveryTime BETWEEN %s AND %s;", (cur_start_time, cur_end_time))
        all_orders = cursor.fetchone()[0]
        # total costs of all orders
        cursor = conn.cursor()
        cursor.execute("SELECT sum(fee) FROM Orders WHERE deliveryTime BETWEEN %s AND %s;", (cur_start_time, cur_end_time))
        all_orders_costs = cursor.fetchone()[0]
        #number of new customers
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) FROM CUSTOMERS NATURAL JOIN USERS WHERE joinDate BETWEEN %s AND %s;", (cur_start_time, cur_end_time))
        all_new_customers = cursor.fetchone()[0]

        res = {'year': cur_start_time.year, 'month': cur_start_time.month, 'all_orders': all_orders, 'all_orders_costs': all_orders_costs, 'all_new_customers': all_new_customers}
        result.append(res)
    
    return ({'result': result}, 200)


@app.route("/current_customer_summary")
@login_required
def get_customer_summary():
    username = request.args.get('customer')
    now = datetime.now()
    year, month = now.year, now.month
    start_time = datetime(year, month, 1)
    end_time = addMonths(start_time, 1) - timedelta(seconds=1)
    conn = get_db()
    result= []
    for i in range(0, 25): # show at most the last 2 years of summary
        cur_start_time = start_time - relativedelta(months=i)
        cur_end_time = end_time - relativedelta(months=i)
        # of customer's orders
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) from Orders WHERE customerUsername = %s AND deliveryTime BETWEEN %s AND %s", (username, cur_start_time, cur_end_time))
        customer_orders = cursor.fetchone()[0]
        # total cost of all of customer's orders
        cursor = conn.cursor()
        cursor.execute("SELECT sum(fee) from Orders WHERE customerUsername = %s AND deliveryTime BETWEEN %s AND %s", (username, cur_start_time, cur_end_time))
        customer_orders_costs = cursor.fetchone()[0]
        res = {'year': cur_start_time.year, 'month': cur_start_time.month, 'customer_orders': customer_orders, 'customer_orders_costs': customer_orders_costs}
        result.append(res)
    return ({'result': result}, 200)

#TODO DELIVERY LOCATION for yuting
 
@app.route("/current_rider_summary")
def get_rider_summary():
    username = request.args.get('username')
    now = datetime.now()
    year, month = now.year, now.month
    start_time = datetime(year, month, 1)
    end_time = addMonths(start_time, 1) - timedelta(seconds=1)
    conn = get_db()
    result = []
    for i in range(0, 25): # show at most the last 2 years of summary
        cur_start_time = start_time - relativedelta(months=i)
        cur_end_time = end_time - relativedelta(months=i)
        # of orders delivered
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) FROM Orders WHERE riderUsername = %s AND deliveryTime BETWEEN %s AND %s;",(username, cur_start_time, cur_end_time))
        rider_orders = cursor.fetchone()[0]
        # of hours worked
        cursor = conn.cursor()
        cursor.execute("SELECT sum(endHour - startHour) FROM MonthlyWorkSched WHERE username = %s;",(username,))
        hours_worked = cursor.fetchone()[0]
        if not hours_worked:
            cursor = conn.cursor()
            cursor.execute("SELECT sum(endHour - startHour) FROM WeeklyWorkSched WHERE username = %s;",(username,))
            hours_worked = cursor.fetchone()[0]
        # total salary
        cursor = conn.cursor()
        cursor.execute("SELECT sum(salary) FROM DeliveryRiders WHERE username = %s;", (username,))
        salary = cursor.fetchone()[0]
        # average delivery time
        cursor = conn.cursor()
        cursor.execute("SELECT sum(EXTRACT(EPOCH FROM arriveTime - orderTime)/60)/count(*) FROM Orders WHERE riderUsername = %s AND deliveryTime BETWEEN %s AND %s;", (username, cur_start_time, cur_end_time))
        delivery_time = cursor.fetchone()[0]
        # number of ratings received
        cursor = conn.cursor()
        cursor.execute("SELECT count(rating) FROM Orders where riderUsername = %s AND deliveryTime BETWEEN %s AND %s", (username, cur_start_time, cur_end_time)) 
        num_rating = cursor.fetchone()[0]
        # average rating
        cursor = conn.cursor()
        cursor.execute("SELECT avg(rating) FROM Orders where riderUsername = %s AND deliveryTime BETWEEN %s AND %s", (username, cur_start_time, cur_end_time))
        avg_rating = cursor.fetchone()[0]

        res = {'year': cur_start_time.year, 'month': cur_start_time.month, 'rider_orders': rider_orders, 'hours_worked': hours_worked, 'salary': salary, 
            'delivery_time': delivery_time, 'num_rating': num_rating, 'avg_rating': avg_rating}
        result.append(res)
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
    cursor.execute("SELECT promoId, promoDescription, startDate, endDate, discount FROM FDSPromotions ORDER BY startDate DESC, endDate DESC;")
    result = cursor.fetchall()

    for i, r in enumerate(result): # fix decimal is not serializable
        l = list(result[i])
        l[4] = float(l[4])
        result[i] = tuple(l)
    return ({'result': result}, 200)




