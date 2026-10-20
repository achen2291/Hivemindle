import json
import requests

# 236 total posts in top 300 flaired with NTA, YTA, ESH, or NAH

# TODO: 

f = open('topAITA100.json', 'r')

# load json file into data
data = json.load(f)

# create empty file
open("demofile.txt", "w").close()

# gets first post from data variable, loaded from topAITA100.json
currentPost = data["data"]["children"][0]["data"]
id = currentPost["id"]

# for loop that loops through all posts in topAITA100.json
# if post is flaired with proper flair, writes title, body, id, and url to demofile
count = 0
for i in range(0, data["data"]["dist"]):
    currentPost = data["data"]["children"][i]["data"]
    if (currentPost["link_flair_text"] == "Asshole" or currentPost["link_flair_text"] == "Not the A-hole") or (currentPost["link_flair_text"] == "Everyone Sucks Here") or (currentPost["link_flair_text"] == "No A-holes here"):
        with open("demofile.txt", "a") as f:
            f.write("title: " + currentPost["title"] + "\n")
            f.write("body: " + currentPost["selftext"] + "\n")
            f.write("id: " + currentPost["id"] + "\n") #t3_{id} is search string for post
            f.write("url: " + currentPost["url"] + "\n")
            count += 1

# TODO: assign currentPost values to variables instead, construct json from variables in following format
# TODO: go through for loop, if flair is valid, pull title, body, url from currentPost
# TODO: pull id from currentPost and call arcticshift API to get comments for post
# TODO: parse through arcticshift API response, count number of verdict (1 per comment)
# TODO: calculate percentage of each verdict, assign to variables
# TODO: construct json with title, body, url, and verdict percentages for each post
'''
{
    "game-1": {
        "title": title,
        "body": selftext,
        "url": url
        "NTA": percentageNTA,
        "YTA": percentageYTA,
        "ESH": percentageESH,
        "NAH": percentageNAH
    },
    "game-2": {
        "title": title2,
        "body": selftext2,
        "url": url2
        "NTA": percentageNTA2,
        "YTA": percentageYTA2,
        "ESH": percentageESH2,
        "NAH": percentageNAH2
    }
}




'''
print("number of valid posts: " + str(count))

request = f"https://arctic-shift.photon-reddit.com/api/comments/tree?link_id=t3_{id}&limit=9999"

response = requests.get(request)

'''with open("demojson.json", "w") as f:
    json.dump(response.json(), f, indent=4)
'''

# gets comments from demojson, contains comments from first post
# commentFile = open('demojson.json', 'r')

# load json file into commentData
# commentData = json.load(commentFile)

# gets first comment from response
currentComment = response.json()["data"][0]
# prints body of first comment
# print(currentComment["data"]["body"])

# initializes counters for each verdict at 0
countNTA = 0
countYTA = 0
countESH = 0
countNAH = 0

# loops through all comments, increments counter if verdict is in comment (max 1 per comment)
# e.g. if comment contains "NTA" and "YTA", both countNTA and countYTA increment by 1
for comment in response.json()["data"]:
    if "NTA" in comment["data"]["body"]:
        countNTA += 1
    if "YTA" in comment["data"]["body"]:
        countYTA += 1
    if "ESH" in comment["data"]["body"]:
        countESH += 1
    if "NAH" in comment["data"]["body"]:
        countNAH += 1

# prints count of each verdict
print("NTA: " + str(countNTA))
print("YTA: " + str(countYTA))
print("ESH: " + str(countESH))
print("NAH: " + str(countNAH))

# converts count to percentage based on total comments
percentageNTA = (countNTA / (countNTA + countYTA + countESH + countNAH)) * 100
percentageYTA = (countYTA / (countNTA + countYTA + countESH + countNAH)) * 100
percentageESH = (countESH / (countNTA + countYTA + countESH + countNAH)) * 100
percentageNAH = (countNAH / (countNTA + countYTA + countESH + countNAH)) * 100

# prints percentage of each verdict
print("NTA Percentage: " + str(round(percentageNTA, 2)))
print("YTA Percentage: " + str(round(percentageYTA, 2)))
print("ESH Percentage: " + str(round(percentageESH, 2)))
print("NAH Percentage: " + str(round(percentageNAH, 2)))

# prints sum of percentages
# TODO: if sum is off by 1, make margin of error +-1
print(str(round(percentageNTA + percentageYTA + percentageESH + percentageNAH, 2)))