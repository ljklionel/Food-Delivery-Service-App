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
    description VARCHAR(128) NOT NULL DEFAULT '',
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
    username VARCHAR(64) PRIMARY KEY REFERENCES DeliveryRiders ON DELETE CASCADE
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
    location VARCHAR(32) PRIMARY KEY
);

CREATE TABLE Orders (
	orderid SERIAL PRIMARY KEY,
	paymentMethod VARCHAR(32) NOT NULL,

    -- Delivers combined
    rating INTEGER CHECK (rating in (1,2,3,4,5)),
	location VARCHAR(32) NOT NULL REFERENCES Locations,
	amtPayable FLOAT NOT NULL,
	orderTime TIMESTAMP NOT NULL,
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

DROP TRIGGER IF EXISTS 
order_contains_food_from_an_associated_restaurant on ContainsFood CASCADE;
/* Testing the two constraints. Take a lot of time */
-- BEGIN TRANSACTION;
-- \COPY Orders(paymentMethod,rating,location,amtPayable,orderTime,departTime1,arriveTime,departTime2,deliveryTime,riderUsername,customerUsername,rname) FROM './csv/orders.csv' CSV HEADER;
-- \COPY ContainsFood(quantity,review,fname,orderid) FROM './csv/containsfood.csv' CSV HEADER;
-- COMMIT;
BEGIN TRANSACTION;
SET CONSTRAINTS ALL DEFERRED;

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
\COPY Users(username, hashedPassword, phoneNumber, firstName, lastName, joindate) FROM './csv/delivery_users.csv' CSV HEADER;
\COPY Users(username, hashedPassword, phoneNumber, firstName, lastName, joindate) FROM './csv/customer_users.csv' CSV HEADER;
\COPY DeliveryRiders(username, salary) FROM './csv/delivery_riders.csv' CSV HEADER;
\COPY Customers(username, creditCard, rewardPoint) FROM './csv/customer.csv' CSV HEADER;
\COPY PartTimers(username) FROM './csv/part_time.csv' CSV HEADER;
\COPY FullTimers(username) FROM './csv/full_time.csv' CSV HEADER;
\COPY WeeklyWorkSched(username,workday,starthour,endhour) FROM './csv/part_time_sched.csv' CSV HEADER;
\COPY MonthlyWorkSched(username,workday,starthour,endhour) FROM './csv/full_time_sched.csv' CSV HEADER;
\COPY FDSPromotions(promoId, promoDescription, startDate, endDate, discount, createdBy) FROM './csv/FDSpromotions.csv' CSV HEADER;
/* Tested with the two constraints and passed */
/* Is inserted without the constraints so that init.sql will not be slow */
\COPY Orders(paymentMethod,rating,location,amtPayable,orderTime,departTime1,arriveTime,departTime2,deliveryTime,riderUsername,customerUsername,rname) FROM './csv/orders.csv' CSV HEADER;
\COPY ContainsFood(quantity,review,fname,orderid) FROM './csv/containsfood.csv' CSV HEADER;
COMMIT;


------ TRIGGERS ------

-- Trigger to enforce total participation constraint on Orders wrt to ContainsFood
CREATE OR REPLACE function
total_participation_orders_wrt_containsfood()
    RETURNS TRIGGER AS $$
DECLARE
    order_id INTEGER;
    pass boolean;
BEGIN
    IF (TG_TABLE_NAME = 'orders') THEN
        order_id = NEW.orderid;
    ELSE
        order_id = OLD.orderid;
    END IF;
    
    SELECT true INTO pass
        FROM ContainsFood
        WHERE orderid = order_id;
    IF NOT FOUND THEN
        SELECT false INTO pass
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

-- Trigger to enforce every order must contain food from an associated restaurant
CREATE OR REPLACE function
order_contains_food_from_an_associated_restaurant()
    RETURNS TRIGGER AS $$
DECLARE
    order_id INTEGER;
    pass boolean;
    r_name VARCHAR;
    f_name VARCHAR;
BEGIN
    -- RAISE NOTICE 'Order contains food from an associated restaurant trigger %', TG_TABLE_NAME;
    RAISE NOTICE 'order_id is %', NEW.orderid;
    -- RAISE NOTICE 'f_name is %', NEW.fname;

    order_id = NEW.orderid;
    f_name = NEW.fname;
    SELECT rname into r_name
        FROM Orders
        WHERE orderid = order_id;
    -- RAISE NOTICE 'r_name is %', r_name;

    SELECT true INTO pass
        FROM Sells
        WHERE rname = r_name
        AND fname = f_name;
    IF NOT FOUND THEN
        RAISE exception
        'Order ID % contains food % that is not from %', order_id, f_name, r_name;
    END IF;
    RAISE NOTICE 'Found food % from %', f_name, r_name;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- Trigger to enforce total work hours constraint
CREATE OR REPLACE FUNCTION 
check_total_hours_trigger() 
    RETURNS TRIGGER AS $$
DECLARE
    totalHours INTEGER;
BEGIN
    SELECT SUM(endHour - startHour) INTO totalHours
        FROM WeeklyWorkSched 
        WHERE username = NEW.username;
    IF totalHours > 48 THEN
        RAISE EXCEPTION '% cannot work for more than 48 hours', NEW.username;
    END IF;
    IF totalHours < 10 THEN
        RAISE EXCEPTION '% cannot work less than 10 hours per week', NEW.username;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- Trigger to enforce break between to work interval
CREATE OR REPLACE FUNCTION 
part_time_break_check() 
    RETURNS TRIGGER AS $$
DECLARE
    ok BOOLEAN;
BEGIN
    ok := true;
    SELECT false INTO ok
        FROM WeeklyWorkSched
        WHERE username = NEW.username
        AND workDay = NEW.workday
        AND (endHour = NEW.startHour OR startHour = NEW.endHour);
    IF NOT ok THEN 
        RAISE EXCEPTION '% does not have an hour break between 2 consecutive interval', NEW.username;
    END IF;
    RETURN NEW;
END;
$$LANGUAGE plpgsql;

-- Trigger to enforce at least 5 per hour interval
CREATE OR REPLACE FUNCTION
at_least_five_check()
    RETURNS TRIGGER AS $$
DECLARE
    ok BOOLEAN;
    failHour INTEGER;
    failDay INTEGER;
BEGIN
    ok := true;
    
    WITH WorkHours AS (
        SELECT generate_series AS hour FROM generate_series(10,21)
    ), WorkDays AS (
        SELECT generate_series AS day from generate_series(1,7)
    )
    SELECT false, hour, day INTO ok, failHour, failDay
        FROM WorkHours, WorkDays
        WHERE 5 > (
            (SELECT count(*) FROM WeeklyWorkSched WHERE startHour <= hour and hour < endHour) +
                (SELECT count(*) FROM MonthlyWorkSched NATURAL JOIN FullTimeShifts WHERE startHour <= hour and hour < endHour and not (breakStart <= hour and hour < breakEnd))
        );
    IF NOT ok THEN
        RAISE EXCEPTION 'At least 5 riders per hour not satisfied for hour %s day %s.', failHour, failDay;
    END IF;
    RETURN NULL;
END;
$$LANGUAGE plpgsql;

-- Trigger to enforce consecutive 5 workdays
CREATE OR REPLACE FUNCTION 
consecutive_workdays() 
    RETURNS TRIGGER AS $$
DECLARE
    t_row INTEGER;
    pattern1 INTEGER ARRAY DEFAULT ARRAY[1,2,3,4,5];
    pattern2 INTEGER ARRAY DEFAULT ARRAY[2,3,4,5,6];
    pattern3 INTEGER ARRAY DEFAULT ARRAY[3,4,5,6,7];
    pattern4 INTEGER ARRAY DEFAULT ARRAY[1,4,5,6,7];
    pattern5 INTEGER ARRAY DEFAULT ARRAY[1,2,5,6,7];
    pattern6 INTEGER ARRAY DEFAULT ARRAY[1,2,3,6,7];
    pattern7 INTEGER ARRAY DEFAULT ARRAY[1,2,3,4,7];
    isPattern BOOLEAN := false;
    toCheck INTEGER [];
BEGIN
    DROP TABLE IF EXISTS zzWorkDaySched;
    CREATE TEMP TABLE zzWorkDaySched AS
        SELECT DISTINCT workDay
            FROM MonthlyWorkSched MWS
            WHERE MWS.username = NEW.username
            ORDER BY workDay;
    
    FOR t_row IN SELECT * FROM zzWorkDaySched LOOP
        toCheck := array_append(toCheck, t_row);
    END LOOP;
    IF toCheck = pattern1 OR 
        toCheck = pattern2 OR 
        toCheck = pattern3 OR 
        toCheck = pattern4 OR 
        toCheck = pattern5 OR 
        toCheck = pattern6 OR 
        toCheck = pattern7 THEN isPattern := true;
    END IF;
    IF NOT isPattern THEN 
        RAISE EXCEPTION '% does not work for 5 consecutive days', NEW.username;
    END IF;
    DROP TABLE zzWorkDaySched;
    RETURN NULL;
END;
$$LANGUAGE plpgsql;


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

/* Trigger for insert/update on WeeklyWorkSched*/
DROP TRIGGER IF EXISTS 
part_time_break_check ON WeeklyWorkSched CASCADE;
CREATE TRIGGER 
part_time_break_check
BEFORE INSERT OR UPDATE ON WeeklyWorkSched
FOR EACH ROW
EXECUTE FUNCTION 
part_time_break_check();

/* Trigger for insert/update on WeeklyWorkSched*/
DROP TRIGGER IF EXISTS 
check_total_hours_trigger ON WeeklyWorkSched CASCADE;
CREATE CONSTRAINT TRIGGER 
check_total_hours_trigger
AFTER INSERT ON WeeklyWorkSched
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION
check_total_hours_trigger();

/* Trigger for delete or update on WWS */
DROP TRIGGER IF EXISTS 
at_least_five_check ON WeeklyWorkSched CASCADE;
CREATE TRIGGER 
at_least_five_check
AFTER DELETE OR UPDATE ON WeeklyWorkSched
FOR EACH STATEMENT
EXECUTE FUNCTION
at_least_five_check();

/* Trigger for delete or update on MWS */
DROP TRIGGER IF EXISTS 
at_least_five_check ON MonthlyWorkSched CASCADE;
CREATE TRIGGER 
at_least_five_check
AFTER DELETE OR UPDATE ON MonthlyWorkSched
FOR EACH STATEMENT 
EXECUTE FUNCTION
at_least_five_check();

/* Trigger for insert on MWS */
DROP TRIGGER IF EXISTS 
consecutive_workdays ON MonthlyWorkSched CASCADE;
CREATE CONSTRAINT TRIGGER 
consecutive_workdays
AFTER INSERT ON MonthlyWorkSched
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION
consecutive_workdays();


/* Trigger for insert/update on ContainsFood to enforce every order must contain food from an associated restaurant */
DROP TRIGGER IF EXISTS 
order_contains_food_from_an_associated_restaurant on ContainsFood CASCADE;
CREATE constraint TRIGGER
order_contains_food_from_an_associated_restaurant
AFTER INSERT OR UPDATE of fname ON ContainsFood deferrable initially deferred
FOR EACH ROW
EXECUTE FUNCTION
order_contains_food_from_an_associated_restaurant();
