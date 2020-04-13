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
part_timers = []
part_time_shifts = []
adverbs = []
adjectives = []
restaurants = []
locations = []
timeArray = []

f = open("../csv/customer.csv", "r")
f1 = f.readlines()
header = True;
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    customers.append(c)

f = open("../csv/sells.csv", "r")
f1 = f.readlines()
# Sells has no header for some reason
for x in f1:
    c = x.rstrip().split(',')
    sells.append(c)

f = open("../csv/restaurants.csv", "r")
f1 = f.readlines()
header = True;
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    restaurants.append(c)

sellsDict = {}
for x in sells:
    if sellsDict.get(x[1]) is not None: # May be []
        sellsDict[x[1]].append(x[0] + "," + x[2] + "," + x[3] + "," + x[4])
    else:
        sellsDict[x[1]] = []
        sellsDict[x[1]].append(x[0] + "," + x[2] + "," + x[3] + "," + x[4])

for x in restaurants:
    if sellsDict.get(x[0]) is not None: # May be []
        sellsDict[x[0]].append(x[1])
    else:
        x = "read the string: rname from csv file"


f = open("../csv/full_time_sched.csv", "r")
f1 = f.readlines()
header = True;
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    full_timers.append(c)

f = open("../csv/full_time_shifts.csv", "r")
f1 = f.readlines()
header = True;
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    full_time_shifts.append(c)

f = open("../csv/part_time_sched.csv", "r")
f1 = f.readlines()
header = True;
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    part_timers.append(c)

f = open("../csv/part_time_shifts.csv", "r")
f1 = f.readlines()
header = True;
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    part_time_shifts.append(c)

f = open("./adverbs.txt", "r")
f1 = f.readlines()
for x in f1:
    c = x.rstrip().split(',')
    adverbs.append(c)

f = open("./adjectives.txt", "r")
f1 = f.readlines()
for x in f1:
    c = x.rstrip().split(',')
    adjectives.append(c)

f = open("../csv/locations.csv", "r")
f1 = f.readlines()
for x in f1:
    c = x.rstrip().split(',')
    if (c[0] == "location"):
        continue
    locations.append(c)

# print(locations)
# print(full_time_shifts)

startDate = datetime.datetime(2013, 9, 20, 16, 00) # time to be normalised from 4pm
# for x in random_date(startDate, 5):
#     print(x.strftime("%d/%m/%y %H:%M"))

start_date = datetime.date(2019, 4, 12)
end_date = datetime.date(2020, 4, 12)
time_between_dates = end_date - start_date
days_between_dates = time_between_dates.days

def nextTiming(hh, mm):
    mm += randint(1, 5)
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

def generateRandomReview(fname):
    return fname + " is " + random.choice(adverbs)[0] + " " + random.choice(adjectives)[0]

containsFoodCsv = []
totalOrders = 10000

# randomize time and sort them for orders
for i in range(0, totalOrders + 1):
    thisTime = []
    random_number_of_days = random.randrange(days_between_dates)
    ran_date = start_date + datetime.timedelta(days=random_number_of_days)

    startHour = 0  # To be filled in the one loop
    for x in random_date(startDate, 0):
        startHour = x.hour
        [v1, v2] = nextTiming(x.hour, x.minute)
        [v3, v4] = nextTiming(v1, v2)
        [v5, v6] = nextTiming(v3, v4)
        [v7, v8] = nextTiming(v5, v6)
        secs = genSeconds()
        timestamp = str(ran_date) + " " + \
            str(x.strftime("%H:%M")) + ":" + secs
        departTime1 = str(ran_date) + " " + str(v1) + \
            ":" + str(v2) + ":" + genSeconds()
        arriveTime = str(ran_date) + " " + str(v3) + \
            ":" + str(v4) + ":" + genSeconds()
        departTime2 = str(ran_date) + " " + str(v5) + \
            ":" + str(v6) + ":" + genSeconds()
        deliveryTime = str(ran_date) + " " + str(v7) + \
            ":" + str(v8) + ":" + genSeconds()
        val = ran_date.year * 1000000 + ran_date.month * 10000 + ran_date.day * 100 + startHour * 1 + x.minute/100 + int(secs)/10000
    thisTime = [timestamp, departTime1, arriveTime, departTime2, deliveryTime, val]
    timeArray.append(thisTime)

def sortingKey(x):
    return x[5]

# sorted(timeArray, key=sortingKey(x))
timeArray.sort(key=sortingKey)
# print(timeArray)

runningVariable = 1
print("paymentMethod,rating,location,fee,orderTime,departTime1,arriveTime,departTime2,deliveryTime,riderUsername,customerUsername,rname")

# for i in range(0, 3000):
while runningVariable <= 10000:
    # orderId
    # orderId = i

    # Get the time required
    # random_number_of_days = random.randrange(days_between_dates)
    # ran_date = start_date + datetime.timedelta(days=random_number_of_days)

    # startHour = 0  # To be filled in the one loop
    # for x in random_date(startDate, 0):
    #     startHour = x.hour
    #     [v1, v2] = nextTiming(x.hour, x.minute)
    #     [v3, v4] = nextTiming(v1, v2)
    #     [v5, v6] = nextTiming(v3, v4)
    #     [v7, v8] = nextTiming(v5, v6)

    #     timestamp = str(ran_date) + " " + \
    #         str(x.strftime("%H:%M")) + ":" + genSeconds()
    #     departTime1 = str(ran_date) + " " + str(v1) + \
    #         ":" + str(v2) + ":" + genSeconds()
    #     arriveTime = str(ran_date) + " " + str(v3) + \
    #         ":" + str(v4) + ":" + genSeconds()
    #     departTime2 = str(ran_date) + " " + str(v5) + \
    #         ":" + str(v6) + ":" + genSeconds()
    #     deliveryTime = str(ran_date) + " " + str(v7) + \
    #         ":" + str(v8) + ":" + genSeconds()
    timestamp = timeArray[runningVariable][0]
    departTime1 = timeArray[runningVariable][1]
    arriveTime = timeArray[runningVariable][2]
    departTime2 = timeArray[runningVariable][3]
    deliveryTime = timeArray[runningVariable][4]

    # Customer
    c = random.choice(customers)
    rewardPoint = c[2]
    payment = c[1]
    customerName = c[0]
    location = random.choice(locations)[0]

    # Get delivery rider
    drNotSelected = True
    partTimeDrNotSelected = True
    day = datetime.datetime(ran_date.year, ran_date.month, ran_date.day).strftime("%a")
    dayInNumber = convertDayToNumber(day)
    correctShiftCheck = ""
    dr = ""
    partTimeDr = ""
    deliveryRider = ""

    # Select full time & parttime driver
    while drNotSelected and partTimeDrNotSelected:
        dice = randint(0, 5) # Choose partTime or Full time, Give more chance for part time to balance 

        if not dice:
            dr = random.choice(full_timers)
            if dr[1] == dayInNumber:
                if int(dr[2]) <= startHour and int(dr[3]) > startHour:
                    for shifts in full_time_shifts:
                        if shifts[0] == dayInNumber and shifts[1] == dr[2] and shifts[2] == dr[3]:
                            # We found the correct shift
                            if int(shifts[3]) <= startHour < int(shifts[4]):                            
                                x = 'dr is taking a break'
                            else:
                                # dr is working, pick this dr
                                correctShiftCheck = shifts
                                partTimeDr = "No Part Time"
                                drNotSelected = False
                                break
        else: 
            partTimeDr = random.choice(part_timers)
            if partTimeDr[1] == dayInNumber:
                if int(partTimeDr[2]) <= startHour < int(partTimeDr[3]):
                    dr = "No Full time"
                    partTimeDrNotSelected = False
                    break

    if drNotSelected:
        deliveryRider = partTimeDr
    else: # partTimeDrNotSelected
        deliveryRider = dr

    # Select restaurants from Sells
    restaurant = random.choice(list(sellsDict.keys()))
    originalList = sellsDict[restaurant]
    minSpend = originalList[-1]
    menu = list.copy(originalList)
    menu.pop() # Remove minSpend, only for this iteration. Need to maintain the original menu
    # print("Restaurant: ", restaurant, "\nMenu: ", menu, "\nMinSpend: ", minSpend)
    
    multipleContainsFood = []
    fee = 0
    for food in menu:
        dice = randint(0,3)
        if dice:
            foodArray = food.split(',')
            foodName = foodArray[0]
            dice2 = randint(5, 30) / 100 # percentage
            amount = round(dice2 * int(foodArray[1])) # in integer
            if (amount == 0):
                amount = 1
            totalPrice = amount * float(foodArray[3])
            reviewdice = randint(0,6)
            if not reviewdice:
                review = generateRandomReview(foodArray[0])
            else:
                review = ''
            containsfood = [str(amount), review, foodName, str(runningVariable)]
            multipleContainsFood.append(containsfood)
            # print(containsfood)
            fee += totalPrice
    
    if (fee < float(minSpend)):
        continue

    # print(multipleContainsFood)

    for containsfood in multipleContainsFood:
        containsFoodCsv.append(containsfood)
    fee = round(fee * 1.2, 2) # 20% 
    # containsfood = [qty, review, fname, orderid]
    # order = [str(orderId), payment, str(randint(1, 5)), location, str(fee), timestamp, departTime1, arriveTime, departTime2, deliveryTime, deliveryRider[0], customerName, restaurant]

    
    order = [payment, str(randint(1, 5)), location, str(fee), timestamp, departTime1, arriveTime, departTime2, deliveryTime, deliveryRider[0], customerName, restaurant]
    print(','.join(order))
    runningVariable += 1

# orderid,paymentMethod,rating,location,fee,orderTime,departTime1,arriveTime,departTime2,deliveryTime,riderUsername,customerUsername,rname
# quantity,review,fname,orderid
# username,creditCard,rewardPoint
# username,hashedPassword,phoneNumber,firstName,lastName,joindate
# 
print("END OF ORDERS")

print("quantity,review,fname,orderid")
for list in containsFoodCsv:
    print(','.join(list))
# print('\n'.join(containsFoodCsv))

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
