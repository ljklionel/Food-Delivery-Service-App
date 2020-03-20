DROP TABLE IF EXISTS Riders;
CREATE TABLE Riders (
    username VARCHAR(64) PRIMARY KEY REFERENCES Users ON DELETE CASCADE, 
    salary INTEGER;
);

DROP TABLE IF EXISTS partTimers;
CREATE TABLE partTimers (
    username VARCHAR(64) PRIMARY KEY REFERENCES Riders ON DELETE CASCADE,
    workHours INTEGER,
);

DROP TABLE IF EXISTS fullTimers;
CREATE TABLE fullTimers (
    username VARCHAR(64) PRIMARY KEY REFERENCES Riders ON DELETE CASCADE,
);

DROP TABLE IF EXISTS partTimeShifts;
CREATE TABLE partTimeShifts (
    workDay INTEGER,
    startHour INTEGER,
    endHour INTEGER,
    workHours INTEGER NOT NULL,
    PRIMARY KEY (startHour, endHour, workDay),
);

DROP TABLE IF EXISTS fullTimeShifts;
CREATE TABLE fullTimeShifts (
    workDay INTEGER,
    startHour INTEGER,
    endHour INTEGER,
    breakStart INTEGER NOT NULL,
    PRIMARY KEY (workDay, startHour, endHour),
);

DROP TABLE IF EXISTS monthlyWorkSched;
CREATE TABLE monthlyWorkSched (
    username VARCHAR(64) REFERENCES fullTimers ON DELETE CASCADE,
    workDay INTEGER REFERENCES fullTimeShifts,
    startHour INTEGER REFERENCES fullTimeShifts,
    endHour INTEGER REFERENCES fullTimeShifts,
    PRIMARY KEY (username, workDay, startHour, endHour),
);

DROP TABLE IF EXISTS weeklyWorkSched;
CREATE TABLE weeklyWorkSched (
    username VARCHAR(64) REFERENCES partTimers ON DELETE CASCADE,
    workDay INTEGER REFERENCES partTimeShifts,
    startHour INTEGER REFERENCES partTimeShifts,
    endHour INTEGER REFERENCES partTimeShifts,
    PRIMARY KEY (username, workDay, startHour, endHour),
);

CREATE OR REPLACE FUNCTION checkTotalHours () RETURNS TRIGGER AS $$
DECLARE
    totalHours INTEGER;
BEGIN
    SELECT PT.workHours INTO totalHours
        FROM partTimers PT
        WHERE PT.username = NEW.username
    IF totalHours > 48 OR totalHours < 10 THEN
        RAISE EXCEPTION '% cannot work for more than 48 hours or less than 10 hours per week', NEW.username;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION updateHoursPartTime () RETURNS TRIGGER AS $$
DECLARE
    totalHour INTEGER
BEGIN
    SELECT PTS.workHours INTO totalHour
        FROM partTimeShifts PTS
        WHERE PTS.workDay = NEW.workDay
        AND PTS.startHour = NEW.startHour
        AND PTS.endHour = NEW.endHour
    BEGIN
        UPDATE partTimers
        SET workHours = workHours + totalHour,
        WHERE username = NEW.username;
    COMMIT;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION partTimeBreakCheck() RETURN TRIGGER AS $$
DECLARE
    endHour INTEGER
BEGIN
    SELECT WWS.endHour INTO endHour
        FROM weeklyWorkSched WWS
        WHERE WWS.username = NEW.username
    IF endHour = NEW.startHour THEN
        RAISE EXCEPTION '% does not have an hour break between 2 cosecutive interval', NEW.username;
    END IF;
    RETURN NULL;
END;
$$LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS partTimeBreakCheck ON weeklyWorkSched CASCADE;
CREATE CONSTRAINT TRIGGER partTimeBreakCheck
    AFTER UPDATE OF username, workDay,startHour, endHour OR INSERT ON weeklyWorkSched
    DEFERRABLE INITIALLY DEFERED
    FOR EACH ROW
    EXECUTE FUNCTION partTimeBreakCheck();

DROP TRIGGER IF EXISTS updateHoursPartTime ON weeklyWorkSched CASCADE;
CREATE CONSTRAINT TRIGGER updateHoursPartTime
    AFTER UPDATE OF username, workDay,startHour, endHour OR INSERT ON weeklyWorkSched
    DEFERRABLE INITIALLY DEFERED
    FOR EACH ROW
    EXECUTE FUNCTION updateHoursPartTime();

DROP TRIGGER IF EXISTS checkTotalHours ON partTimers CASCADE;
CREATE CONSTRAINT TRIGGER updateHoursPartTime
    AFTER UPDATE OF username, workHours ON partTimers
    DEFERRABLE INITIALLY DEFERED
    FOR EACH ROW
    EXECUTE FUNCTION updateHoursPartTime();
    