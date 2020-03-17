DROP TABLE IF EXISTS RestaurantStaffs;
CREATE TABLE RestaurantStaffs (
    username VARCHAR(64) PRIMARY KEY --REFERENCES Users ON DELETE CASCADE
);

DROP TABLE IF EXISTS Restaurants;
CREATE TABLE Restaurants (
    rname VARCHAR(64) PRIMARY KEY,
    minSpending FLOAT NOT NULL
);

DROP TABLE IF EXISTS WorksAt;
CREATE TABLE WorksAt (
    username VARCHAR(64) REFERENCES RestaurantStaffs,
    rname VARCHAR(64) REFERENCES Restaurants,
    PRIMARY KEY (username, rname)
);

DROP TABLE IF EXISTS Promotions;
CREATE TABLE Promotions (
    promoId VARCHAR(64), 
    rname VARCHAR(64) REFERENCES Restaurants ON DELETE CASCADE,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    discount NUMERIC(4,2) NOT NULL,
    PRIMARY KEY (promoId, rname)
);

DROP TABLE IF EXISTS FoodCategories;
CREATE TABLE FoodCategories (
    category VARCHAR(64) PRIMARY KEY
);

DROP TABLE IF EXISTS Food;
CREATE TABLE Food (
    fname VARCHAR(64) PRIMARY KEY,
    category VARCHAR(64) REFERENCES FoodCategories ON UPDATE CASCADE
);

DROP TABLE IF EXISTS Sells;
CREATE TABLE Sells (
    fname VARCHAR(64) REFERENCES Food,
    rname VARCHAR(64) REFERENCES Restaurants,
    avail INTEGER NOT NULL,
    maxLimit INTEGER NOT NULL,
    price FLOAT NOT NULL,
    PRIMARY KEY (fname, rname)
);