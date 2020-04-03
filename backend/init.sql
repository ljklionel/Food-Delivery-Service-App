DROP TABLE IF EXISTS PartTimeShifts CASCADE;
DROP TABLE IF EXISTS FullTimeShifts CASCADE;
DROP TABLE IF EXISTS FDSPromotions CASCADE;
DROP TABLE IF EXISTS FDSManagers CASCADE;
DROP TABLE IF EXISTS WorksAt CASCADE;
DROP TABLE IF EXISTS RestaurantStaffs CASCADE;
DROP TABLE IF EXISTS Promotions CASCADE;
DROP TABLE IF EXISTS Sells CASCADE;
DROP TABLE IF EXISTS Locations CASCADE;
DROP TABLE IF EXISTS Orders CASCADE;
DROP TABLE IF EXISTS Restaurants CASCADE;
DROP TABLE IF EXISTS Food CASCADE;
DROP TABLE IF EXISTS FoodCategories CASCADE;
DROP TABLE IF EXISTS Customers CASCADE;
DROP TABLE IF EXISTS FullTimers CASCADE;
DROP TABLE IF EXISTS PartTimers CASCADE;
DROP TABLE IF EXISTS DeliveryRiders CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS MonthlyWorkSched CASCADE;
DROP TABLE IF EXISTS WeeklyWorkSched CASCADE;
DROP TABLE IF EXISTS ContainsFood CASCADE;

----- TABLES -----

CREATE TABLE Users (
	username VARCHAR(64) PRIMARY KEY,
	hashedPassword VARCHAR(64) NOT NULL,
	phoneNumber VARCHAR(12) NOT NULL,
	firstName VARCHAR(64) NOT NULL,
	lastName VARCHAR(64) NOT NULL,
    joinDate DATE NOT NULL
);

-- FDS MANAGERS --

CREATE TABLE FDSManagers (
	username VARCHAR(64) PRIMARY KEY REFERENCES Users ON DELETE CASCADE
);

CREATE TABLE FDSPromotions (
    promoId VARCHAR(64) PRIMARY KEY,
    promoDescription VARCHAR(512),
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    discount NUMERIC(4,2) NOT NULL,
	createdBy VARCHAR(64) NOT NULL REFERENCES FDSManagers
);

-- RESTAURANT STAFFS --

CREATE TABLE RestaurantStaffs (
    username VARCHAR(64) PRIMARY KEY REFERENCES Users ON DELETE CASCADE
);

CREATE TABLE Restaurants (
    rname VARCHAR(64) PRIMARY KEY,
    minSpending FLOAT NOT NULL
);

CREATE TABLE WorksAt (
    username VARCHAR(64) REFERENCES RestaurantStaffs ON DELETE CASCADE ON UPDATE CASCADE,
    rname VARCHAR(64) REFERENCES Restaurants ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (username, rname)
);

CREATE TABLE Promotions (
    promoId VARCHAR(64), 
    rname VARCHAR(64) REFERENCES Restaurants ON DELETE CASCADE ON UPDATE CASCADE,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    discount NUMERIC(4,2) NOT NULL,
    description VARCHAR(128) DEFAULT '',
    PRIMARY KEY (promoId, rname)
);

CREATE TABLE FoodCategories (
    category VARCHAR(64) PRIMARY KEY
);

CREATE TABLE Food (
    fname VARCHAR(64) PRIMARY KEY,
    category VARCHAR(64) REFERENCES FoodCategories ON UPDATE CASCADE
);

CREATE TABLE Sells (
    fname VARCHAR(64) REFERENCES Food ON UPDATE CASCADE,
    rname VARCHAR(64) REFERENCES Restaurants ON DELETE CASCADE ON UPDATE CASCADE,
    avail INTEGER NOT NULL,
    maxLimit INTEGER NOT NULL,
    price FLOAT NOT NULL,
    PRIMARY KEY (fname, rname)
);

-- DELIVERY RIDERS --

CREATE TABLE DeliveryRiders (
    username VARCHAR(64) PRIMARY KEY REFERENCES Users ON DELETE CASCADE, 
    salary FLOAT DEFAULT 0
);

CREATE TABLE PartTimers (
    username VARCHAR(64) PRIMARY KEY REFERENCES DeliveryRiders ON DELETE CASCADE,
    workHours INTEGER
);

CREATE TABLE FullTimers (
    username VARCHAR(64) PRIMARY KEY REFERENCES DeliveryRiders ON DELETE CASCADE
);

CREATE TABLE PartTimeShifts (
    workDay INTEGER,
    startHour INTEGER,
    endHour INTEGER,
    PRIMARY KEY (startHour, endHour, workDay)
);

CREATE TABLE FullTimeShifts (
    workDay INTEGER,
    startHour INTEGER,
    endHour INTEGER,
    breakStart INTEGER NOT NULL,
    breakEnd INTEGER NOT NULL,
    PRIMARY KEY (workDay, startHour, endHour)
);

CREATE TABLE MonthlyWorkSched (
    username VARCHAR(64) REFERENCES FullTimers ON DELETE CASCADE,
    workDay INTEGER,
    startHour INTEGER,
    endHour INTEGER,
    FOREIGN KEY (workDay, startHour, endHour) REFERENCES FullTimeShifts,
    PRIMARY KEY (username, workDay, startHour, endHour)
);

CREATE TABLE WeeklyWorkSched (
    username VARCHAR(64) REFERENCES PartTimers ON DELETE CASCADE,
    workDay INTEGER,
    startHour INTEGER,
    endHour INTEGER,
    PRIMARY KEY (username, workDay, startHour, endHour),
    FOREIGN KEY (startHour, endHour, workDay) REFERENCES PartTimeShifts
);

-- CUSTOMERS --

CREATE TABLE Customers (
    username VARCHAR(64) PRIMARY KEY REFERENCES Users ON DELETE CASCADE,
	creditCard VARCHAR(32),
	rewardPoint INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE Locations (
    location VARCHAR(256) PRIMARY KEY
);

CREATE TABLE Orders (
	orderid SERIAL PRIMARY KEY,
	paymentMethod VARCHAR(32) NOT NULL,

    -- Delivers combined
    rating INTEGER CHECK (rating in (1,2,3,4,5)),
	location VARCHAR(32) NOT NULL REFERENCES Locations,
	fee FLOAT NOT NULL,
	orderTime TIMESTAMP,
	departTime1 TIMESTAMP,
	arriveTime TIMESTAMP,
	departTime2 TIMESTAMP,
	deliveryTime TIMESTAMP,
    riderUsername VARCHAR(64) NOT NULL REFERENCES DeliveryRiders,

    -- Makes combined
    customerUsername VARCHAR(64) NOT NULL REFERENCES Customers,

    -- From combined
    rname VARCHAR(64) NOT NULL REFERENCES Restaurants
);

CREATE TABLE ContainsFood (
	quantity INTEGER NOT NULL,
	review VARCHAR(500),
    fname VARCHAR(64) REFERENCES Food,
    orderid INTEGER REFERENCES Orders,
    PRIMARY KEY (fname, orderid)
); 

----- INSERT DATA -----
INSERT INTO Users(username, hashedPassword, firstName, lastName, phoneNumber, joinDate) VALUES ('man', 'dummy', 'he','llo','123', now()::date);
INSERT INTO FDSManagers(username) VALUES ('man');

\COPY Locations(location) FROM './csv/locations.csv' CSV HEADER;
\COPY FoodCategories(category) FROM './csv/food_categories.csv' CSV HEADER;
\COPY Food(fname,category) FROM './csv/food.csv' CSV HEADER;
\COPY Restaurants(rname, minSpending) FROM './csv/restaurants.csv' CSV HEADER;
\COPY Promotions(promoId, rname, startDate, endDate, discount) FROM './csv/promotions.csv' CSV HEADER;
\COPY Sells(fname,rname,avail,maxLimit,price) FROM './csv/sells.csv' CSV HEADER;
\COPY FullTimeShifts(workDay, startHour, endHour, breakStart, breakEnd) FROM './csv/full_time_shifts.csv' CSV HEADER;
\COPY PartTimeShifts(workDay, startHour, endHour) FROM './csv/part_time_shifts.csv' CSV HEADER;
\COPY FDSPromotions(promoId, promoDescription, startDate, endDate, discount, createdBy) FROM './csv/FDSpromotions.csv' CSV HEADER;

------ TRIGGERS ------

-- Trigger to enforce total participation constraint on Orders wrt to ContainsFood
CREATE OR REPLACE function
total_participation_orders_wrt_containsfood()
    RETURNS TRIGGER AS $$
DECLARE
    order_id INTEGER;
    ok boolean;
BEGIN
    IF (TG_TABLE_NAME = 'Orders') THEN
        order_id = NEW.orderid;
    ELSE
        order_id = OLD.orderid;
    END IF;

    SELECT true INTO ok
        FROM ContainsFood
        WHERE orderid = order_id;
    IF NOT FOUND THEN
        SELECT false INTO ok
            FROM Orders
            WHERE orderid = order_id;
        IF FOUND THEN
            RAISE exception
            'Order ID % does not contain any food', order_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

/* Trigger for insert/update on Orders */
DROP TRIGGER IF EXISTS 
total_participation_orders_containsfood_trigger_on_orders on Orders CASCADE;
CREATE constraint TRIGGER
total_participation_orders_containsfood_trigger_on_orders
AFTER INSERT OR UPDATE of orderid ON Orders deferrable initially deferred
FOR EACH ROW
EXECUTE FUNCTION
total_participation_orders_wrt_containsfood();

/* Trigger for delete/update on ContainsFood */
DROP TRIGGER IF EXISTS
total_participation_orders_containsfood_trigger_on_containsfood on ContainsFood CASCADE;
CREATE constraint TRIGGER 
total_participation_orders_containsfood_trigger_on_containsfood
AFTER DELETE OR UPDATE of orderid ON ContainsFood deferrable initially deferred
FOR EACH ROW
EXECUTE FUNCTION
total_participation_orders_wrt_containsfood();