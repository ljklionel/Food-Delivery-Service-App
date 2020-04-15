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
customer_users = []
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

f = open("../csv/customer_users.csv", "r")
f1 = f.readlines()
header = True
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    customer_users.append(c)

f = open("../csv/customer.csv", "r")
f1 = f.readlines()
header = True
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    customers.append(c)

f = open("../csv/sells.csv", "r")
f1 = f.readlines()
header = True
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    sells.append(c)

f = open("../csv/restaurants.csv", "r")
f1 = f.readlines()
header = True
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    restaurants.append(c)

sellsDict = {}
for x in sells:
    if sellsDict.get(x[1]) is not None:  # May be []
        sellsDict[x[1]].append(x[0] + "," + x[2] + "," + x[3] + "," + x[4])
    else:
        sellsDict[x[1]] = []
        sellsDict[x[1]].append(x[0] + "," + x[2] + "," + x[3] + "," + x[4])

for x in restaurants:
    if sellsDict.get(x[0]) is not None:  # May be []
        sellsDict[x[0]].append(x[1])
    else:
        x = "read the string: rname from csv file"


f = open("../csv/full_time_sched.csv", "r")
f1 = f.readlines()
header = True
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    full_timers.append(c)

f = open("../csv/full_time_shifts.csv", "r")
f1 = f.readlines()
header = True
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    full_time_shifts.append(c)

f = open("../csv/part_time_sched.csv", "r")
f1 = f.readlines()
header = True
for x in f1:
    if header:
        header = False
        continue
    c = x.rstrip().split(',')
    part_timers.append(c)

f = open("../csv/part_time_shifts.csv", "r")
f1 = f.readlines()
header = True
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


# time to be normalised from 4pm
startDate = datetime.datetime(2013, 9, 20, 16, 00)
# for x in random_date(startDate, 5):
#     print(x.strftime("%d/%m/%y %H:%M"))

start_date = datetime.date(2019, 4, 12)
end_date = datetime.date(
    2020, datetime.datetime.now().month, datetime.datetime.now().day)
time_between_dates = end_date - start_date
days_between_dates = time_between_dates.days


def nextTiming(hh, mm):
    mm += randint(1, 11)
    if (mm >= 60):
        mm -= 60
        hh += 1
    return [hh, mm]

def formatDigits(d):
    if (d < 10):
        return "0" + str(d)
    else:
        return str(d)

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
totalOrders = 120000

# randomize time and sort them for orders
j = 0
while j < totalOrders+1:
    thisTime = []
    random_number_of_days = random.randrange(days_between_dates)
    ran_date = start_date + datetime.timedelta(days=random_number_of_days)

    startHour = 0  # To be filled in the one loop
    for x in random_date(startDate, 0):  # loop runs one time
        startHour = x.hour
        [v1, v2] = nextTiming(x.hour, x.minute)
        [v3, v4] = nextTiming(v1, v2)
        [v5, v6] = nextTiming(v3, v4)
        [v7, v8] = nextTiming(v5, v6)
        secs = genSeconds()
        timestamp = str(ran_date) + " " + \
            str(x.strftime("%H:%M")) + ":" + secs
        departTime1 = str(ran_date) + " " + formatDigits(v1) + \
            ":" + formatDigits(v2) + ":" + genSeconds()
        arriveTime = str(ran_date) + " " + formatDigits(v3) + \
            ":" + formatDigits(v4) + ":" + genSeconds()
        departTime2 = str(ran_date) + " " + formatDigits(v5) + \
            ":" + formatDigits(v6) + ":" + genSeconds()
        deliveryTime = str(ran_date) + " " + formatDigits(v7) + \
            ":" + formatDigits(v8) + ":" + genSeconds()
        val = ran_date.year * 1000000 + ran_date.month * 10000 + \
            ran_date.day * 100 + startHour * 1 + x.minute/100 + int(secs)/10000
    if ran_date.year == datetime.datetime.now().year and ran_date.month == datetime.datetime.now().month and ran_date.day == datetime.datetime.now().day \
    and ran_date.hour > datetime.datetime.now().hour and (ran_date.hour == datetime.datetime.now().hour and ran_date.minute >= datetime.datetime.now().minute):
        # in the future
        continue

    thisTime = [timestamp, departTime1,
                arriveTime, departTime2, deliveryTime, val]
    timeArray.append(thisTime)
    j += 1


def sortingKey(x):
    return x[5]


# sorted(timeArray, key=sortingKey(x))
timeArray.sort(key=sortingKey)
# print(timeArray)

runningVariable = 1
# print("paymentMethod,rating,location,amtPayable,orderTime,departTime1,arriveTime,departTime2,deliveryTime,riderUsername,customerUsername,rname")

f_orders = open("../csv/orders.csv", "w+")
f_orders.write("paymentMethod,rating,location,amtPayable,orderTime,departTime1,arriveTime,departTime2,deliveryTime,riderUsername,customerUsername,rname\n")

# print("quantity,review,fname,orderid")
for list in containsFoodCsv:
    f_containsFood.write(','.join(list)+"\n")

while runningVariable <= totalOrders:
    timestamp = timeArray[runningVariable][0]
    departTime1 = timeArray[runningVariable][1]
    arriveTime = timeArray[runningVariable][2]
    departTime2 = timeArray[runningVariable][3]
    deliveryTime = timeArray[runningVariable][4]

    # Customer
    customerNotFound = True # Customer needs to join before making an order
    c = []
    while customerNotFound:
        randomIndex = randint(0, len(customers) - 1)
        c = customers[randomIndex]
        cJoinDate = customer_users[randomIndex][5]
        joinDateInteger = ''.join(''.join(''.join(cJoinDate.split(' ')).split(':')).split('-'))
        timestampInteger = ''.join(''.join(''.join(timestamp.split(' ')).split(':')).split('-'))
        if (joinDateInteger > timestampInteger):
            # print("fail")
            # print(cJoinDate)
            # print(timestamp)
            continue
        else:
            # print("Pass, found customer")
            break
        # if (cJoinDate)

    rewardPoint = c[2]
    payment = c[1]
    customerName = c[0]
    location = random.choice(locations)[0]

    # Get delivery rider
    drNotSelected = True
    partTimeDrNotSelected = True
    # day = datetime.datetime(ran_date.year, ran_date.month,
    #                         ran_date.day).strftime("%a")

    # print(timestamp)
    year = int(timestamp[0:4])
    month = int(timestamp[5:7])
    date = int(timestamp[8:10])
    # print(year, month, date)
    day = datetime.datetime(year, month, date).strftime("%a")
    # print(day)
    dayInNumber = convertDayToNumber(day)
    # print("Day: ", day)
    # print("Day in number: ", dayInNumber)
    correctShiftCheck = ""
    dr = ""
    partTimeDr = ""
    deliveryRider = ""

    # Select full time & parttime driver
    while drNotSelected and partTimeDrNotSelected:
        # Choose partTime or Full time, Give more chance for part time to balance
        dice = randint(0, 4)

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
            # print("First: ", partTimeDr)
            # print("Day in number: ", dayInNumber)
            if partTimeDr[1] == dayInNumber:
                # print("partTimeDr[1]: ", partTimeDr[1])
                if int(partTimeDr[2]) <= startHour < int(partTimeDr[3]):
                    # print("partTimeDr[2]: ", partTimeDr[2])
                    # print("partTimeDr[3]: ", partTimeDr[3])
                    # print("startHour ", startHour)
                    
                    dr = "No Full time"
                    partTimeDrNotSelected = False
                    break

    if drNotSelected:
        deliveryRider = partTimeDr
    else:  # partTimeDrNotSelected
        deliveryRider = dr

    # Select restaurants from Sells
    restaurant = random.choice(list(sellsDict.keys()))
    originalList = sellsDict[restaurant]
    minSpend = originalList[-1]
    menu = list.copy(originalList)
    menu.pop()  # Remove minSpend, only for this iteration. Need to maintain the original menu

    multipleContainsFood = []
    fee = 0
    totalFood = 0
    for food in menu:
        # if totalFood == 4:
        #     break
        dice = randint(0, 5)
        if not dice:
            foodArray = food.split(',')
            foodName = foodArray[0]
            dice2 = randint(0, 5) / 100  # percentage
            amount = round(dice2 * int(foodArray[1]))  # in integer
            if (amount == 0):
                amount = randint(1, 3)
            totalPrice = amount * float(foodArray[3])
            reviewdice = randint(0, 6)
            if not reviewdice:
                review = generateRandomReview(foodArray[0])
            else:
                review = ''
            containsfood = [str(amount), review, foodName,
                            str(runningVariable)]
            multipleContainsFood.append(containsfood)
            fee += totalPrice
            totalFood += 1


    if (fee < float(minSpend)):
        continue

    for containsfood in multipleContainsFood:
        containsFoodCsv.append(containsfood)
    fee = round(fee * 1.2, 2)  # 20%
    # containsfood = [qty, review, fname, orderid]
    # order = [str(orderId), payment, str(randint(1, 5)), location, str(fee), timestamp, departTime1, arriveTime, departTime2, deliveryTime, deliveryRider[0], customerName, restaurant]

    rating = randint(2, 8)
    if rating > 5:
        rating = ''
    else:
        rating = str(rating)

    order = [payment, rating, location, str(fee), timestamp, departTime1,
             arriveTime, departTime2, deliveryTime, deliveryRider[0], customerName, restaurant]
    # print(','.join(order))
    f_orders.write(','.join(order)+"\n")
    runningVariable += 1

# print("END OF ORDERS")

f_containsFood = open("../csv/containsfood.csv", "w+")
f_containsFood.write("quantity,review,fname,orderid\n")

# print("quantity,review,fname,orderid")
for list in containsFoodCsv:
    f_containsFood.write(','.join(list)+"\n")
    # print(','.join(list))
# print('\n'.join(containsFoodCsv))
# order = [orderId, payment, randint(0, 5), fee, timeStamp, departTime1, arriveTime, departTime2, deliveryTime, riderUsername, customerName, rname]
