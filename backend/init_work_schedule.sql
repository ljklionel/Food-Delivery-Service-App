DROP TABLE IF EXISTS DeliveryRiders;
CREATE TABLE DeliveryRiders (
    username VARCHAR(64) PRIMARY KEY REFERENCES Users ON DELETE CASCADE, 
    salary INTEGER;
);

DROP TABLE IF EXISTS PartTimers;
CREATE TABLE PartTimers (
    username VARCHAR(64) PRIMARY KEY REFERENCES Riders ON DELETE CASCADE,
    workHours INTEGER,
);

DROP TABLE IF EXISTS FullTimers;
CREATE TABLE FullTimers (
    username VARCHAR(64) PRIMARY KEY REFERENCES Riders ON DELETE CASCADE,
);

DROP TABLE IF EXISTS PartTimeShifts;
CREATE TABLE PartTimeShifts (
    workDay INTEGER,
    startHour INTEGER,
    endHour INTEGER,
    workHours INTEGER NOT NULL,
    PRIMARY KEY (startHour, endHour, workDay),
);

DROP TABLE IF EXISTS FullTimeShifts;
CREATE TABLE FullTimeShifts (
    workDay INTEGER,
    startHour INTEGER,
    endHour INTEGER,
    breakStart INTEGER NOT NULL,
    PRIMARY KEY (workDay, startHour, endHour),
);

DROP TABLE IF EXISTS MonthlyWorkSched;
CREATE TABLE MonthlyWorkSched (
    username VARCHAR(64) REFERENCES FullTimers ON DELETE CASCADE,
    workDay INTEGER REFERENCES FullTimeShifts,
    startHour INTEGER REFERENCES FullTimeShifts,
    endHour INTEGER REFERENCES FullTimeShifts,
    PRIMARY KEY (username, workDay, startHour, endHour),
);

DROP TABLE IF EXISTS WeeklyWorkSched;
CREATE TABLE WeeklyWorkSched (
    username VARCHAR(64) REFERENCES PartTimers ON DELETE CASCADE,
    workDay INTEGER REFERENCES PartTimeShifts,
    startHour INTEGER REFERENCES PartTimeShifts,
    endHour INTEGER REFERENCES PartTimeShifts,
    PRIMARY KEY (username, workDay, startHour, endHour),
);

CREATE OR REPLACE FUNCTION check_total_hours_trigger () RETURNS TRIGGER AS $$
DECLARE
    totalHours INTEGER;
BEGIN
    SELECT PT.workHours INTO totalHours
        FROM PartTimers PT
        WHERE PT.username = NEW.username
    IF totalHours > 48 OR totalHours < 10 THEN
        RAISE EXCEPTION '% cannot work for more than 48 hours or less than 10 hours per week', NEW.username;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_hours_part_time () RETURNS TRIGGER AS $$
DECLARE
    totalHour INTEGER
BEGIN
    SELECT PTS.workHours INTO totalHour
        FROM PartTimeShifts PTS
        WHERE PTS.workDay = NEW.workDay
        AND PTS.startHour = NEW.startHour
        AND PTS.endHour = NEW.endHour
    BEGIN
        UPDATE PartTimers
        SET workHours = workHours + totalHour,
        WHERE username = NEW.username;
    COMMIT;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION part_time_break_check() RETURN TRIGGER AS $$
DECLARE
    endHour INTEGER
BEGIN
    SELECT WWS.endHour INTO endHour
        FROM WeeklyWorkSched WWS
        WHERE WWS.username = NEW.username
    IF endHour = NEW.startHour THEN
        RAISE EXCEPTION '% does not have an hour break between 2 cosecutive interval', NEW.username;
    END IF;
    RETURN NULL;
END;
$$LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS part_time_break_check ON WeeklyWorkSched CASCADE;
CREATE CONSTRAINT TRIGGER part_time_break_check
    AFTER UPDATE OF username, workDay,startHour, endHour OR INSERT ON WeeklyWorkSched
    DEFERRABLE INITIALLY DEFERED
    FOR EACH ROW
    EXECUTE FUNCTION part_time_break_check();

DROP TRIGGER IF EXISTS update_hours_part_time ON WeeklyWorkSched CASCADE;
CREATE CONSTRAINT TRIGGER update_hours_part_time
    AFTER UPDATE OF username, workDay,startHour, endHour OR INSERT ON WeeklyWorkSched
    DEFERRABLE INITIALLY DEFERED
    FOR EACH ROW
    EXECUTE FUNCTION update_hours_part_time();

DROP TRIGGER IF EXISTS check_total_hours_trigger ON PartTimers CASCADE;
CREATE CONSTRAINT TRIGGER check_total_hours_trigger
    AFTER UPDATE OF username, workHours ON PartTimers
    DEFERRABLE INITIALLY DEFERED
    FOR EACH ROW
    EXECUTE FUNCTION check_total_hours_trigger();
    