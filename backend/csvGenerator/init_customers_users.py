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

bcrypt = Bcrypt()

# Choose one for loop to run, comment the other

customers = []
f = open("./customernames.txt", "r")
f1 = f.readlines()
for x in f1:
    c = x.rstrip().split(' ')
    if c in customers:
        c[0] = c[0] + "n"
        print(c)
    customers.append(c)

print(customers)

runningVariable = 1
for name in customers:
        username = name[0]
        firstName = "customer"
        lastName = "customer"
        phoneNumber = runningVariable * 123456
        password = username
        now = str(datetime.now()).split(' ')[0]
        hash = bcrypt.generate_password_hash(password).decode()
        # print(hash)
        user = [str(username), str(hash), str(firstName), str(lastName), str(phoneNumber), str(now)]
        print(','.join(user))
        runningVariable += 1

print("End of users")

for name in customers:
        username = name[0]
        payment = ['Cash', 'Mastercard', 'Visa']
        selectedPayment = random.choice(payment)
        rewardpoint = randint(0,2000)
        print(username + ',' + selectedPayment + ',' +str(rewardpoint))
