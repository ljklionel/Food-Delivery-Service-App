from flask import Flask, request, current_app, g, jsonify
import psycopg2
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, current_user, login_required, logout_user
from datetime import datetime
from datetime import timedelta
from dateutil.relativedelta import relativedelta  # $ pip install python-dateutil
import random
from random import seed
from random import randint
import sys
from random import randrange
import datetime
bcrypt = Bcrypt()

customers = []
checkDup = []
f = open("./names_2000.txt", "r")
f1 = f.readlines()
for x in f1:
    c = x.rstrip().split(' ')
    if c in customers:
        c[0] = c[0] + "a"
        if c in customers:
                c[0] = c[0] + "e"
                # print("Add e", c)
                if c in customers:
                        c[0] = c[0] + "i"
                        # print("Add i", c)
        # print(c)
    customers.append(c)

# print(customers)

runningVariable = 1


startDate = datetime.datetime(2013, 9, 20, 16, 00) # time to be normalised from 4pm
# for x in random_date(startDate, 5):
#     print(x.strftime("%d/%m/%y %H:%M"))

# print(datetime.datetime.now().hour)

start_date = datetime.date(2019, 4, 1)
end_date = datetime.date(2020, datetime.datetime.now().month, datetime.datetime.now().day)
time_between_dates = end_date - start_date
days_between_dates = time_between_dates.days

timeArray = []


def random_date(start, l):
    current = start
    while l >= 0:
        curr = current + datetime.timedelta(minutes=randrange(360))
        yield curr
        l -= 1

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

tries = 0;
while tries <= 2001:
    thisTime = []
    random_number_of_days = random.randrange(days_between_dates)
    ran_date = start_date + datetime.timedelta(days=random_number_of_days)

    startHour = 0  # To be filled in the one loop
    # print(random_date(startDate, 0)[0]);
    for x in random_date(startDate, 0): # loop runs one time
        startHour = x.hour
        secs = genSeconds()
        timestamp = str(ran_date) + " " + \
            str(x.strftime("%H:%M")) + ":" + secs

    val = ran_date.year * 1000000 + ran_date.month * 10000 + ran_date.day * 100 + startHour * 1 + x.minute/100 + int(secs)/10000
    # if val >= 2019 * 1000000 + 8 * 10000: # 2019 aug onwards
    #     dice1 = randint(0,5)              # reroll
    #     if not dice1:
    #         continue       
    # if val >= 2020 * 1000000:   # 2020 jan onwards
    #     dice2 = randint(0,5)     # reroll
    #     if not dice2:
    #         continue                 
    # if val >= 2020 * 1000000 + 2 * 10000: # 2020 feb onwards
    #     dice3 = randint(0,5)                 #reroll
    #     if not dice3:
    #         continue

    thisTime = [timestamp, val]
    timeArray.append(thisTime)
    tries += 1

def sortingKey(x):
    return x[1]

timeArray.sort(key=sortingKey)

header = True
hashedPasswordArray = []
f_hashes = open("hashedpasswords.txt", "r")
for line in f_hashes:
    if header:
        header = False
        continue
    # print(line)
    if line.rstrip() == 'End of users':
        break
    hashedPassword = line.rstrip().split(',')[1]
    hashedPasswordArray.append(hashedPassword)

# print(hashedPasswordArray)

f_users = open("../csv/customer_users.csv", "w+")
f_users.write("username,hashedPassword,phoneNumber,firstName,lastName,joindate\n")
i = 0
for name in customers:
        username = name[0]
        firstName = username
        lastName = random.choice(customers)[0]
        phoneNumber = randint(80000001, 99000000)
        password = username
        joinDate = timeArray[runningVariable][0]
        # hash = bcrypt.generate_password_hash(password).decode()
        hash = hashedPasswordArray[i]
        # print(hash)
        user = [str(username), str(hash), str(phoneNumber), str(firstName), str(lastName), str(joinDate)]
        # print(','.join(user))
        runningVariable += 1
        i += 1
        f_users.write(','.join(user)+"\n")
        
f_users.close()
# print(timeArray)
# print("End of users")

f_customers = open("../csv/customer.csv", "w+")
f_customers.write("username,creditCard,rewardPoint\n")
for name in customers:
        username = name[0]
        payment = ['Cash', 'Mastercard', 'Visa']
        selectedPayment = random.choice(payment)
        rewardpoint = randint(0,3000)
        # print(username + ',' + selectedPayment + ',' +str(rewardpoint), end = "")
        f_customers.write(username + ',' + selectedPayment + ',' +str(rewardpoint)+"\n")

f_customers.close()

# print(runningVariable)
