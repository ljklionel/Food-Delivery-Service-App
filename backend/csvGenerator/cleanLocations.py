import sys

data = []
for line in sys.stdin:
    if line == "\n" or line in data:
        continue

    try: 
        test = int(line.rstrip()[-1])
    except:
        data.append(line)
        sys.stdout.write(line)
        continue
