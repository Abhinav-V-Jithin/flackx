import os
from flask import Flask, render_template, request, session, redirect, url_for
from flask_session import Session
from flask_socketio import SocketIO, emit, disconnect

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["TEMPLATES_AUTO_RELOAD"] = True
Session(app)
socketio = SocketIO(app, manage_session = True)
registered_users = []
private_container= []
channels = [{'name':"FlackX", 'messages':[{'by':'Abhinav', 'message':'Welcome to FlackX.'}]}]

@app.route("/", methods=["GET", "POST"])
def index():
    print("returning index.html")
    return render_template("index.html")
# This returns the login page of the site.
# Under maintanance.

@app.route("/mainframe", methods=["GET","POST"])
def mainframe():
    print("returning mainframe.html")
    return render_template("mainframe.html")

@app.route("/register", methods=["POST", "GET"])
def register():
    print("returning register.html")
    return render_template("register.html")

# This returns the register page of the site.
# under maintanance.


@socketio.on("validate user")
def validate(datapack):
    print("calling validate user socket")
    username = datapack["username"]
    password = datapack["password"]
    index = 0
    print("the list of registered users is:", registered_users)
    for user in registered_users:
        if user["username"] == username:
            if user["password"] == password:
                session["username"] = username
                registered_users[index] = {"username":username, "password":password, "sid":request.sid, "namespace":request.namespace}
                emit("error", {"message":"You have successfully signed in!", "status":"success", "username": username}, broadcast=False)
                return
            else:
                emit("error", {'message':'Invalid username or password', "status":"fail"}, broadcast=False)
                return
        index += 1

    emit('error', {'message':'Invalid username or password!', 'status':'fail'}, broadcast=False)

#   This one is incomplete since we have to make sure registration form is ready.
#   Under maintanance.
@socketio.on('register')
def register(datapack):
    print("calling register socket")
    username = datapack["username"]
    password = datapack["password"]
    if registered_users != []:
        for user in registered_users:
            if user["username"] == username:
                print("this username exists")
                emit('error', {'message':'This username is already taken!', 'status':'fail'}, broadcast=False)
                return
    registered_users.append({"username":username, "password":password, "sid":request.sid})
    print("successful registration")
    emit('success', {'message':'You have successfully registered. Congratulations!', 'status':'success'}, broadcast=False) # here there is a major change tp be done!
# This one tells the client there is an error. The rest of the magic happens in the client.
# Under maintanance

@socketio.on('get details')
def getUserDetails(datapack):
    print("get details socket fired")
    username = datapack["username"]
    index = 0
    nothing = False
    user_detailer = {}
    for user in registered_users:
        print(user["username"])
        if user["username"] == username:
            try:
                m = user['privates']
            except:
                user_detailer = {'username':username, 'password':user['password'], 'sid':request.sid, 'privates':[]}
                registered_users[index] = user_detailer
                break
            user_detailer = {'username':username, 'password':user['password'], 'sid':request.sid, 'privates':user['privates']}
            registered_users[index] = user_detailer
            print(user_detailer)
            break
        index += 1
    print("user details:", user_detailer)
    emit('user details', user_detailer, broadcast=False)

@socketio.on('get all channels')
def allChannels():
    print("get all channels fired")
    channeller = []
    for ch in channels:
        channeller.append(ch['name'])
    emit('all channels currently active', channeller, broadcast=False)

@socketio.on('add a channel')
def addChannel(channel_pack):
    print("add a channel fired")
    channel_name = channel_pack["channel"]
    channels.append({'name':channel_name, 'messages':[]})
    channeller = []
    for ch in channels:
        channeller.append(ch['name'])
    emit('added a channel', channeller, broadcast=True)

@socketio.on('add a private chat')
def addPrivateChat(dataset):
    print("add a private chat fired")
    username = dataset["username"]
    private_to_add = dataset["private"]
    existing_privates = []
    to_existing_privates = []
    sid_private_to_add = ''
    invalid = False
    index = 0

    for user in registered_users:
        if user["username"] == private_to_add:
            invalid = False
            sid_private_to_add = user["sid"]
            to_existing_privates = user['privates']
            to_existing_privates.append(username)
            registered_users[index] = {'username':private_to_add, 'password':user['password'], 'sid':request.sid, 'privates':to_existing_privates}
            break
        else:
            invalid = True
        index += 1

    if invalid == True:
        return
    """These lines is meant for updating the privates of the person to whom the Message
    is going to be send"""


    index = 0
    for user in registered_users:
        if user["username"] == username:
            existing_privates = user["privates"]
            existing_privates.append(private_to_add)
            registered_users[index] = {'username':username, 'password':user['password'], 'sid':request.sid, 'privates':existing_privates}
            invalid = False
            break
        else:
            invalid = True
        index += 1
    if invalid == True:
        return
    """These lines are for updating the private list of the person who sends the message"""


    emit('added a private chat', to_existing_privates, room=sid_private_to_add)
    emit('added a private chat', existing_privates, broadcast=False)

@socketio.on('send private message')
def sendMessage(dataset):
    print("send private message fired")
    to_send = dataset['to']
    message = dataset['message']
    from_send= dataset['from']
    room_to_send = ''
    room_to_send2 = ''
    private_container.append({'from':from_send, 'to':to_send, 'message':message})
    print(" this is the private container: ", private_container)
    messages = []


    for user in registered_users:
        if user["username"] == to_send:
            room_to_send = user['sid']
            break
    """Find the session id of the person to whom the message is send"""

    for user in registered_users:
        if user["username"] == from_send:
            room_to_send2 = user['sid']
            break
    """Find the session id of the person who sends the message"""
    print("here are the pri values...")
    for pri in private_container:
        print(pri)
        if (pri['from'] == from_send and pri['to'] == to_send) or (pri['from'] == to_send and pri['to'] == from_send):
            messages.append(pri)

    """Find the messages which are corresponding to the user who is sending the message or receiving the message..."""

    print("The messages are ", messages)
    emit('private chat send', {'private':from_send, 'messages':messages}, room=room_to_send)
    emit('private chat send', {'private':to_send, 'messages':messages}, room=room_to_send2)

@socketio.on('send channel message')
def channelMessage(datapack):
    print("send channel message fired")
    by = datapack['from']
    message = datapack['message']
    channelname = datapack['channel']
    messages = []
    messg = []
    index = 0
    for ch in channels:
        if ch['name'] == channelname:
            messg = ch['messages']
            for mess in messg:
                messages.append({'by':mess['by'], 'message':mess['message'], 'channel':channelname})
            messg.append({'by':by, 'message':message})
            messages.append({'by':by, 'message':message, 'channel':channelname})
            chd = {'name':channelname, 'messages':messg}
            channels[index] = chd
            break
        index += 1
    print(messages)
    emit('channel message broadcast', {'messages':messages, 'channel':channelname}, broadcast=True)

@socketio.on('get all messages')
def previous(data):
    print("get all messages fired")
    channelname = data
    channeller = []
    for ch in channels:
        if ch['name'] == channelname:
            print("reaching here")
            channeller = ch['messages']
            break

    emit('message history', channeller, broadcast=False)

@socketio.on('get all privates')
def getPreviousMessages(data):
    print("get all privates fired")
    print(data)
    username = data['username']
    private  = data['private']
    room_to_send = ''
    messages = []


    for pri in private_container:
        if (pri['from'] == username and pri['to'] == private) or (pri['to'] == username and pri['from'] == private):
            messages.append(pri)

    for user in registered_users:
        if user["username"] == username:
            room_to_send = user['sid']
            break

    emit('private chat send', {'private':private, 'messages':messages}, room=room_to_send)

@socketio.on('update my session id')
def updateSessionId(username):
    print("update my session id fired")
    index = 0

    for user in registered_users:
        if user['username'] == username:
            registered_users[index] = {'username':user['username'], 'password':user['password'], 'sid':request.sid, 'privates':user['privates']}
            break
        index += 1


if __name__ == "__main__":
    socketio.run(app)
