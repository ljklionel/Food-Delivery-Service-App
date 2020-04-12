from datetime import datetime
from datetime import timedelta
from dateutil.relativedelta import relativedelta  # $ pip install python-dateutil
import random
from random import seed
from random import randint

from random import randrange
import datetime


def random_date(start, l):
    current = start
    while l >= 0:
        curr = current + datetime.timedelta(minutes=randrange(360))
        yield curr
        l -= 1


customers = []
sells = []
full_timers = []
full_time_shifts = []

f = open("../csv/customer.csv", "r")
f1 = f.readlines()
for x in f1:
    c = x.rstrip().split(',')
    customers.append(c)

f = open("../csv/sells.csv", "r")
f1 = f.readlines()
for x in f1:
    c = x.rstrip().split(',')
    sells.append(c)

f = open("../csv/full_time_sched.csv", "r")
f1 = f.readlines()
for x in f1:
    c = x.rstrip().split(',')
    full_timers.append(c)

f = open("../csv/full_time_shifts.csv", "r")
f1 = f.readlines()
for x in f1:
    c = x.rstrip().split(',')
    full_time_shifts.append(c)

# print(full_time_shifts)

startDate = datetime.datetime(2013, 9, 20, 16, 00)
# for x in random_date(startDate, 5):
#     print(x.strftime("%d/%m/%y %H:%M"))

start_date = datetime.date(2020, 1, 15)
end_date = datetime.date(2020, 4, 12)
time_between_dates = end_date - start_date
days_between_dates = time_between_dates.days


def nextTiming(hh, mm):
    mm += randint(0, 5)
    if (mm >= 60):
        mm -= 60
        hh += 1
    return [hh, mm]


def genSeconds():
    n = randint(0, 59)
    if len(str(n)) == 1:
        n = "0" + str(n)
    return str(n)


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


for i in range(0, 100):
    # orderId
    orderId = i

    # Get the time required
    random_number_of_days = random.randrange(days_between_dates)
    ran_date = start_date + datetime.timedelta(days=random_number_of_days)

    startHour = 0  # To be filled in the one loop
    for x in random_date(startDate, 0):
        startHour = x.hour
        [v1, v2] = nextTiming(x.hour, x.minute)
        [v3, v4] = nextTiming(v1, v2)
        [v5, v6] = nextTiming(v3, v4)
        [v7, v8] = nextTiming(v5, v6)

        timestamp = str(ran_date) + " " + \
            str(x.strftime("%H:%M")) + ":" + genSeconds()
        departTime1 = str(ran_date) + " " + str(v1) + \
            ":" + str(v2) + ":" + genSeconds()
        arriveTime = str(ran_date) + " " + str(v3) + \
            ":" + str(v4) + ":" + genSeconds()
        departTime2 = str(ran_date) + " " + str(v5) + \
            ":" + str(v6) + ":" + genSeconds()
        deliveryTime = str(ran_date) + " " + str(v7) + \
            ":" + str(v8) + ":" + genSeconds()

    # Customer
    c = random.choice(customers)
    location = c[2]
    payment = c[1]
    customerName = c[0]

    # Get delivery rider
    drNotSelected = True
    day = datetime.datetime(ran_date.year, ran_date.month,
                            ran_date.day).strftime("%a")
    dayInNumber = convertDayToNumber(day)
    # print(day)
    # print(dayInNumber)

    # Select full time driver
    while drNotSelected:
        dr = random.choice(full_timers)
        # print(dr[1])
        if dr[1] == dayInNumber:
            # print(dr)
            if int(dr[2]) <= startHour and int(dr[3]) > startHour:
                # Check not in break
                for shifts in full_time_shifts:
                    if shifts[0] == dayInNumber and shifts[1] == dr[2] and shifts[2] == dr[3]:
                        # We found the correct shift
                        if shifts[3] <= dr[3] < shifts[4]:
                            # dr is breaking
                            x = 'assign something so no error'
                        else:
                            # dr is working, pick this dr
                            drNotSelected = False
    # print(dayInNumber)
    # print(dr)
                # workDay, startHour, endHour, breakStart, breakEnd
# 1,10,19,14,15


    # print(convertDayToNumber(day))
    # print(datetime.datetime(ran_date.year, ran_date.month, ran_date.day).strftime("%a"))


    order = [orderId, payment, randint(
        1, 5), timestamp, departTime1, arriveTime, departTime2, deliveryTime, dr[0], customerName]
    print(order)
    # order = [orderId, payment, randint(0, 5), fee, timeStamp, departTime1, arriveTime, departTime2, deliveryTime, riderUsername, customerName, rname]

    # CREATE TABLE Orders (
# 	orderid SERIAL PRIMARY KEY,
# 	paymentMethod VARCHAR(32) NOT NULL,

#     -- Delivers combined
#     rating INTEGER CHECK (rating in (1,2,3,4,5)),
# 	location VARCHAR(32) NOT NULL REFERENCES Locations,
# 	fee FLOAT NOT NULL,
# 	orderTime TIMESTAMP,
# 	departTime1 TIMESTAMP,
# 	arriveTime TIMESTAMP,
# 	departTime2 TIMESTAMP,
# 	deliveryTime TIMESTAMP,
#     riderUsername VARCHAR(64) NOT NULL REFERENCES DeliveryRiders,

#     -- Makes combined
#     customerUsername VARCHAR(64) NOT NULL REFERENCES Customers,

#     -- From combined
#     rname VARCHAR(64) NOT NULL REFERENCES Restaurants
# );

# CREATE TABLE ContainsFood (
# 	quantity INTEGER NOT NULL,
# 	review VARCHAR(500),
#     fname VARCHAR(64) REFERENCES Food,
#     orderid INTEGER REFERENCES Orders,
#     PRIMARY KEY (fname, orderid)
# );
