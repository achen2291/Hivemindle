import json
import requests

# 236 total posts in top 300 flaired with NTA, YTA, ESH, or NAH

f = open('topAITA100.json', 'r')

data = json.load(f)

open("demofile.txt", "w").close()

currentPost = data["data"]["children"][0]["data"]
id = currentPost["id"]

commentFile = open('demojson.json', 'r')

commentData = json.load(commentFile)

currentComment = commentData["data"][0]
print(currentComment["data"]["body"])

countNTA = 0
countYTA = 0
countESH = 0
countNAH = 0

for i in commentData["data"]:
    if "NTA" in i["data"]["body"]:
        countNTA += 1
    if "YTA" in i["data"]["body"]:
        countYTA += 1
    if "ESH" in i["data"]["body"]:
        countESH += 1
    if "NAH" in i["data"]["body"]:
        countNAH += 1

print("NTA: " + str(countNTA))
print("YTA: " + str(countYTA))
print("ESH: " + str(countESH))
print("NAH: " + str(countNAH))

percentageNTA = (countNTA / (countNTA + countYTA + countESH + countNAH)) * 100
percentageYTA = (countYTA / (countNTA + countYTA + countESH + countNAH)) * 100
percentageESH = (countESH / (countNTA + countYTA + countESH + countNAH)) * 100
percentageNAH = (countNAH / (countNTA + countYTA + countESH + countNAH)) * 100

print("NTA Percentage: " + str(round(percentageNTA, 2)))
print("YTA Percentage: " + str(round(percentageYTA, 2)))
print("ESH Percentage: " + str(round(percentageESH, 2)))
print("NAH Percentage: " + str(round(percentageNAH, 2)))

print(str(round(percentageNTA + percentageYTA + percentageESH + percentageNAH, 2)))

'''
request = f"https://arctic-shift.photon-reddit.com/api/comments/tree?link_id=t3_{id}&limit=9999"

response = requests.get(request)

with open("demojson.json", "w") as f:
    json.dump(response.json(), f, indent=4)
'''
count = 0
for i in range(0, 100):
    currentPost = data["data"]["children"][i]["data"]
    if (currentPost["link_flair_text"] == "Asshole" or currentPost["link_flair_text"] == "Not the A-hole") or (currentPost["link_flair_text"] == "Everyone Sucks Here") or (currentPost["link_flair_text"] == "No A-holes here"):
        with open("demofile.txt", "a") as f:
            f.write("title: " + currentPost["title"] + "\n")
            f.write("body: " + currentPost["selftext"] + "\n")
            f.write("id: " + currentPost["id"] + "\n") #t3_{id} is search string for post
            f.write("url: " + currentPost["url"] + "\n")
            count += 1

print(count)