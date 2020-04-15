riders = []
f = open("./full_time_rider_names.txt", "r")
f1 = f.readlines()
for x in f1:
    c = x.rstrip().split(' ')
    if c in riders:
        c[0] = c[0] + "n"
        print(c)
    riders.append(c)

for name in riders:
        username = name[0]
        print(username, ',1000')