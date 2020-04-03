DROP TABLE IF EXISTS PartTimeShifts CASCADE;
DROP TABLE IF EXISTS FullTimeShifts CASCADE;
DROP TABLE IF EXISTS FullTimers CASCADE;
DROP TABLE IF EXISTS PartTimers CASCADE;
DROP TABLE IF EXISTS DeliveryRiders CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS MonthlyWorkSched CASCADE;
DROP TABLE IF EXISTS WeeklyWorkSched CASCADE;

CREATE TABLE Users (
	username VARCHAR(64) PRIMARY KEY,
	hashedPassword VARCHAR(128) NOT NULL,
	phoneNumber VARCHAR(12) NOT NULL,
	name VARCHAR(64) NOT NULL
);

CREATE TABLE DeliveryRiders (
    username VARCHAR(64) PRIMARY KEY REFERENCES Users ON DELETE CASCADE, 
    salary FLOAT
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


CREATE OR REPLACE FUNCTION check_total_hours_trigger() RETURNS TRIGGER AS $$
DECLARE
    totalHours INTEGER;
BEGIN
    SELECT PT.workHours INTO totalHours
        FROM PartTimers PT
        WHERE PT.username = NEW.username;
    IF totalHours > 48 THEN
        RAISE EXCEPTION '% cannot work for more than 48 hours', NEW.username;
    END IF;
    IF totalHours < 10 THEN
        RAISE EXCEPTION '% cannot work less than 10 hours per week', NEW.username;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_hours_part_time(username VARCHAR(60), startHour INTEGER, endHour INTEGER) RETURNS VOID AS $$
DECLARE
    hoursWork INTEGER;
BEGIN
    SELECT endHour - startHour INTO hoursWork;
    UPDATE PartTimers
        SET workHours = workHours + hoursWork
        WHERE PartTimers.username = NEW.username;
    INSERT INTO PartTimers (username, workHours)
        SELECT NEW.username, hoursWork
        WHERE NOT EXISTS (
            SELECT 1
            FROM PartTimers
            WHERE PartTimers.username = NEW.username
        );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION part_time_break_check() RETURNS TRIGGER AS $$
DECLARE
    endHour INTEGER;
BEGIN
    SELECT WWS.endHour INTO endHour
        FROM WeeklyWorkSched WWS, WeeklyWorkSched WWS1
        WHERE WWS.username = NEW.username
        AND WWS.workDay = NEW.workDay
        AND WWS1.username = NEW.username
        AND WWS1.workDay = NEW.workDay
        AND WWS.endHour > WWS1.endHour;
    IF endHour = NEW.startHour THEN 
        RAISE EXCEPTION '% does not have an hour break between 2 cosecutive interval', NEW.username;
    END IF;
    PERFORM update_hours_part_time(NEW.username, NEW.startHour, NEW.endHour);
    RETURN NEW;
END;
$$LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS part_time_break_check ON WeeklyWorkSched CASCADE;
CREATE CONSTRAINT TRIGGER part_time_break_check
    AFTER UPDATE OF username, workDay,startHour, endHour OR INSERT ON WeeklyWorkSched
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION part_time_break_check();

DROP TRIGGER IF EXISTS check_total_hours_trigger ON PartTimers CASCADE;
CREATE CONSTRAINT TRIGGER check_total_hours_trigger
    AFTER UPDATE OF username, workHours ON PartTimers
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION check_total_hours_trigger();







// const name = 'hello'
// render.(<h1>Your {name}</h1>) {} is used to insert js expression can put multiple
// {`${name} ${name}`} ES6 injection
// self closing needs a back slash <img src = {img} /> -> also needs alt
// function Heading() ->  <Heading />
// function parameter(props) then <Card name="beyonce" /> then {props.name}
// custom component
    