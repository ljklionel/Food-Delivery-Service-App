riders = []
f = open("./full_time_rider_names.txt", "r")
f1 = f.readlines()
for x in f1:
    c = x.rstrip().split(' ')
    if c in riders:
        c[0] = c[0] + "n"
        print(c)
    riders.append(c)


# 42 each time, each timing now has '42' riders
for name in riders:
        username = name[0]
        print(username, ',7', ',10', ',19') 
        print(username, ',1', ',11', ',20')
        print(username, ',2', ',12', ',21')
        print(username, ',3', ',13', ',22')
        print(username, ',4', ',10', ',19')