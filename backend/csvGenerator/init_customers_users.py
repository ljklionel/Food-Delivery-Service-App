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

bcrypt = Bcrypt()

# Choose one for loop to run, comment the other

# for i in range(0, 10):
#     for j in range(0, 10):
#         key = i * 10 + j
#         username = "customer" + str(key)
#         firstName = "customer"
#         lastName = str(key)
#         phoneNumber = key * 12345
#         password = username
#         now = str(datetime.now()).split(' ')[0]
#         hash = bcrypt.generate_password_hash(password).decode()
#         # print(hash)
#         user = [str(username), str(hash), str(firstName), str(lastName), str(phoneNumber), str(now)]
#         print(','.join(user))


for i in range(0, 10):
    for j in range(0, 10):
        key = i * 10 + j
        username = "customer" + str(key)
        payment = ['Cash', 'Mastercard', 'Visa']
        selectedPayment = random.choice(payment)
        rewardpoint = randint(0,999)
        print(username + ',' + selectedPayment + ',' +str(rewardpoint))
