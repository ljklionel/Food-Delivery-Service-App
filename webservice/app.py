
from flask import Flask, request, current_app, g
from db import get_db, close_db
import psycopg2

app = Flask(__name__)

# @app.route("/")
# def hello():
#     return "Hello World!"

# @app.route("/name/<name>")
# def get_book_name(name):
#     return "name : {}".format(name)

# @app.route("/details")
# def get_book_details():
#     author=request.args.get('author')
#     published=request.args.get('published')
#     return "Author : {}, Published: {}".format(author,published)

@app.route("/categories") # this will be hosted in "address/categories"
def get_categories():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * from categories;')
    # cursor.fetchall() returns remaining rows of query result, fetchone() returns 1 row, fetchmany([size]) returns size rows.
    result = str(cursor.fetchall())
    close_db(conn)
    return result

if __name__ == '__main__':
    app.run()