DROP TABLE IF EXISTS Customer CASCADE;
CREATE TABLE Customer (
    username VARCHAR(64) PRIMARY KEY REFERENCES Users ON DELETE CASCADE,
	creditCard VARCHAR(32),
	rewardPoint INTEGER NOT NULL
);

DROP TABLE IF EXISTS Orders CASCADE;
CREATE TABLE Orders (
	oid INTEGER PRIMARY KEY,
	price FLOAT NOT NULL,
	date DATE NOT NULL,
	time TIME NOT NULL,
	paymentMethod VARCHAR(32) NOT NULL, 

    -- Delivers combined
    rating INTEGER CHECK (rating in(1,2,3,4,5)),
	location VARCHAR(64) NOT NULL,
	fee FLOAT NOT NULL,
	orderTime TIME,
	departTime1 TIME,
	arriveTime TIME,
	departTime2 TIME,
	deliveryTime TIME,
    riderUsername VARCHAR(64) NOT NULL REFERENCES DeliveryRider(username),

    -- Makes combined
    customerUsername VARCHAR(64) NOT NULL REFERENCES Customer(username),

    -- From combined
    rname VARCHAR(64) NOT NULL REFERENCES Restaurants
);

DROP TABLE IF EXISTS ContainsFood CASCADE;
CREATE TABLE ContainsFood (
	quantity INTEGER,
	review VARCHAR(500),
    fname VARCHAR(64) REFERENCES Food,
    oid INTEGER REFERENCES Orders,
    PRIMARY KEY (fname, oid)
); 

-- Trigger to enforce total participation constraint on Orders wrt to ContainsFood
CREATE OR REPLACE function
total_participation_orders_wrt_containsfood()
    RETURNS TRIGGER AS $$
DECLARE
    order_id INTEGER;
    ok boolean;
BEGIN
    IF (TG_TABLE_NAME = 'Orders') THEN
        order_id = NEW.oid;
    ELSE
        order_id = OLD.oid;
    END IF;

    SELECT true INTO ok
        FROM ContainsFood
        WHERE oid = order_id;
    IF NOT FOUND THEN
        SELECT false INTO ok
            FROM Orders
            WHERE oid = order_id;
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
AFTER INSERT OR UPDATE of oid ON Orders deferrable initially deferred
FOR EACH ROW
EXECUTE FUNCTION
total_participation_orders_wrt_containsfood();

/* Trigger for delete/update on ContainsFood */
DROP TRIGGER IF EXISTS
total_participation_orders_containsfood_trigger_on_containsfood on ContainsFood CASCADE;
CREATE constraint TRIGGER 
total_participation_orders_containsfood_trigger_on_containsfood
AFTER DELETE OR UPDATE of oid ON ContainsFood deferrable initially deferred
FOR EACH ROW
EXECUTE FUNCTION
total_participation_orders_wrt_containsfood();
