import sys

for line in sys.stdin:
    myArray = line.split(',')
    try:
        val = int(myArray[4].rstrip())
        val = round(val / 2, 0)
        if (val >= 20):
            val = round(val / 2, 0)
        if (val % 2 == 1):
            val = val - 1
        # print(str(val)[-3])
        if (str(val)[-3] == '4'):
            # print(val)
            val = val + 1
        val = str(val)[0: -2]
        # print(myArray)
        myArray[4] = val
        # print(myArray)

        print(",".join(myArray))
    except:
        continue
