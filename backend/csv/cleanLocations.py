import sys

data = []
for line in sys.stdin:
    if line == "\n" or line in data:
        # print(line)
        continue

    try: 
        test = int(line.rstrip()[-1])
    except:
        # print(line.rstrip())
        data.append(line)
        sys.stdout.write(line)
        continue
