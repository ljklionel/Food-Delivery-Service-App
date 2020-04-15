import psycopg2

def get_db():
    conn = psycopg2.connect(host = "localhost",
                            port = "5432",
                            database = "fds")
    return conn # example usage: 'conn.cursor().execute("SELECT * from abc;")'
    

def close_db(conn): 
    if conn:
        conn.close()
        print("PostgreSQL connection is closed")