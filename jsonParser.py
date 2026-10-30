import json
from time import sleep
import requests

# 236 total posts in top 300 flaired with NTA, YTA, ESH, or NAH

# for loop that loops through all posts in topAITA100.json
# if post is flaired with proper flair, writes title, body, id, and url to demofile
game_count = 1
post_num = 0
title = ""
body = ""
url = ""
gameData = []
# stopped halfway through 101-200, continue with 200-500 for now
gameFiles = ["topAITA100.json", "topAITA101-200.json", "topAITA201-300.json", "topAITA301-400.json", "topAITA401-500.json"]


# TODO: add try/except for API request, if fails, print error code and post id, then break loop
# DONE: find a way to loop through all files in a folder and add to gameData dict then write to demofile.json
for file in gameFiles:
    f = open(file, 'r')
    data = json.load(f)
    for i in range(0, data["data"]["dist"]):
        post_num += 1
        print("===============================")
        print ("Post number: " + str(post_num))
        currentPost = data["data"]["children"][i]["data"]
        id = currentPost["id"]
        if currentPost["link_flair_text"] == "Asshole" or currentPost["link_flair_text"] == "Not the A-hole" or currentPost["link_flair_text"] == "Everyone Sucks" or currentPost["link_flair_text"] == "No A-holes here" or currentPost["link_flair_text"] == "Not the A-hole POO Mode" or currentPost["link_flair_text"] == "Asshole POO Mode":
            # variable declaration
            title = currentPost["title"]
            body = currentPost["selftext"]
            url = currentPost["url"]
            countNTA = 0
            countYTA = 0
            countESH = 0
            countNAH = 0
            sum_verdicts = 0
            margin_of_error = 0
            # requests comments from arcticshift API for current post (only if flair is valid)
            request = f"https://arctic-shift.photon-reddit.com/api/comments/tree?link_id=t3_{id}&limit=9999"
            response = requests.get(request)
            if response.status_code != 200:
                print("Error: " + str(response.status_code))
                print(id)
                break
            print("Response time: " + str(response.elapsed.total_seconds()))
            # loops through all comments, increments verdict counter if string is found in comment (max once per comment)
            for comment in response.json()["data"]:
                if "NTA" in comment["data"]["body"]:
                    countNTA += 1
                if "YTA" in comment["data"]["body"]:
                    countYTA += 1
                if "ESH" in comment["data"]["body"]:
                    countESH += 1
                if "NAH" in comment["data"]["body"]:
                    countNAH += 1
            # print count of each verdict
            sum_verdicts = countNTA + countYTA + countESH + countNAH
            print("NTA: " + str(countNTA))
            print("YTA: " + str(countYTA))
            print("ESH: " + str(countESH))
            print("NAH: " + str(countNAH))


            # converts count to percentage based on total comments with verdicts and rounds
            percentageNTA = round((countNTA / (countNTA + countYTA + countESH + countNAH)) * 100)
            percentageYTA = round((countYTA / (countNTA + countYTA + countESH + countNAH)) * 100)
            percentageESH = round((countESH / (countNTA + countYTA + countESH + countNAH)) * 100)
            percentageNAH = round((countNAH / (countNTA + countYTA + countESH + countNAH)) * 100)
            # sum of percentages (if sum is not exactly 100, margin of error based on difference)
            sumPercentage = percentageNTA + percentageYTA + percentageESH + percentageNAH

            # prints percentage of each verdict
            print("NTA Percentage: " + str(percentageNTA))
            print("YTA Percentage: " + str(percentageYTA))
            print("ESH Percentage: " + str(percentageESH))
            print("NAH Percentage: " + str(percentageNAH))

            # prints sum of percentages
            # TODO: if sum is off by 1, make margin of error +-1
            if (sumPercentage) != 100:
                margin_of_error = abs(sumPercentage - 100)
                print("Sum of percentages: " + str(sumPercentage))
                print("Margin of error: " + str(margin_of_error))
            # collates game data into a dict
            game_dict = {
                "title": title,
                "body": body,
                "url": url,
                "NTA": percentageNTA,
                "YTA": percentageYTA,
                "ESH": percentageESH,
                "NAH": percentageNAH,
                "NTA_Count": countNTA,
                "YTA_Count": countYTA,
                "ESH_Count": countESH,
                "NAH_Count": countNAH,
                "verdict_sum": sum_verdicts,
                "margin_of_error": margin_of_error,
            }
            # adds game data to list
            gameData.append({f"game-{game_count}": game_dict})
            game_count += 1
            # sleep for 60 seconds to not overload API upon successful API call
            sleep(60)
            
        else:
            print("invalid flair: " + currentPost["link_flair_text"])
    else:
        continue
    break

# opens json file, clears it, writes data
demofile = open("demofile.json", "w")
json.dump(gameData, demofile, indent=4)
# close json file
demofile.close()
print("Total number of games: " + str(game_count))

# DONE: assign currentPost values to variables instead, construct json from variables in following format
# DONE: go through for loop, if flair is valid, pull title, body, url from currentPost
# DONE: pull id from currentPost and call arcticshift API to get comments for post
# DONE: parse through arcticshift API response, count number of verdict (1 per comment)
# DONE: calculate percentage of each verdict, assign to variables
# DONE: construct json with title, body, url, and verdict percentages for each post
'''
{
    "game-1": {
        "title": title,
        "body": body,
        "url": url,
        "NTA": percentageNTA,
        "YTA": percentageYTA,
        "ESH": percentageESH,
        "NAH": percentageNAH
    },
    "game-2": {
        "title": title2,
        "body": body2,
        "url": url2,
        "NTA": percentageNTA2,
        "YTA": percentageYTA2,
        "ESH": percentageESH2,
        "NAH": percentageNAH2
    }
}
'''
