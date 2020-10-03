let height = 0;
let counter = 0;
const t = Handlebars.compile(`
  <div id="message" data-idp="{{idp}}"style="padding: 20px;position: relative;width: 50%;top: {{top}};left:{{left}};border: 2px solid black;background-color: {{color}}">
      {{content}}
      <hr style="border-top: 2px solid black;">
      <span style="margin-left: 250px">-By {{author}}</span>
  </div>
`);
const last = Handlebars.compile(`
  <div id="messago" data-idp="{{idp}}" style="padding: 20px;position: relative;width: 50%;margin-bottom: 100px;top: {{top}};left:{{left}};border: 2px solid black;background-color: {{color}}">
      {{content}}
      <hr style="border-top: 2px solid black;">
      <span style="margin-left: 250px">-By {{author}}</span>
  </div>
`);
let selected = "";
var socket = io.connect('http://'+document.domain+':'+location.port);


class mainframe_controller
{
  #channel1_template = Handlebars.compile(`
    <div class="channel1" data-name="{{name}}">
        <img src="{{link}}" id="group1">
        <span id="channel1-text">
              {{ contents }}
        </span>
    </div>`);
  #rest_channels_template = Handlebars.compile(`
    <div class="channel-list" data-name="{{name}}">
        <img src="{{link}}" id="groups">
        <span id="channel-list-text">
            {{contents}}
        </span>
    </div
    `);
  #private1 = Handlebars.compile(`
    <div class="private1" data-name="{{name}}">
            <img src="{{link}}" id="private1">
        <span id="private1-text">
            {{contents}}
        </span>
    </div>
    `);
  #private_list = Handlebars.compile(`
    <div class="private-list" data-name="{{name}}">
        <img src="{{link}}" id="privates">
        <span id="private-list-text">
            {{contents}}
        </span>
    </div>
    `);
  manage_navigations()
  {
      let present_channel_background_color = "#4CAF50";
      let present_private_background_color = "#333";
      document.querySelector('#core').hidden = false;
      document.querySelector('#welcome').innerHTML = `Welcome back ${localStorage.getItem('username')}`;
      const channels_nav = document.querySelector('#channels-nav');
      const privates_nav = document.querySelector('#privates-nav');
      const channel_wrapper = document.querySelector('.channels-wrapper');
      const private_wrapper = document.querySelector('.privates-wrapper');
      channels_nav.style.color = "white";
      privates_nav.style.color = "white";
      channels_nav.style.backgroundColor = "#4CAF50";
      privates_nav.style.backgroundColor = "#333";
      document.querySelector('.privates-wrapper').style.height = "0px";
      channels_nav.onclick = () =>
      {
        channels_nav.style.backgroundColor = "#4CAF50";
        privates_nav.style.backgroundColor = "#333";
        present_channel_background_color = "#4CAF50";
        present_private_background_color = "#333";
        channel_wrapper.style.height = String(window.innerHeight -  (document.querySelector('.bar').offsetHeight + document.querySelector('#channels-heading').offsetHeight)+30) + "px";
        private_wrapper.style.height = "0px";
      };
      privates_nav.onclick = () =>
      {
        privates_nav.style.backgroundColor = "#4CAF50";
        channels_nav.style.backgroundColor = "#333";
        present_channel_background_color = "#333";
        present_private_background_color = "#4CAF50";
        channel_wrapper.style.height = "0px";
        private_wrapper.style.height = String(window.innerHeight - ( document.querySelector('.bar').offsetHeight + document.querySelector('#channels-heading').offsetHeight)+30) + "px";
      };
      channels_nav.onmouseover = () =>
      {
        channels_nav.style.backgroundColor = "#111";
      };
      privates_nav.onmouseover = () =>
      {
        privates_nav.style.backgroundColor = "#111";
      };
      channels_nav.onmouseleave = () =>
      {
        if(present_channel_background_color === "#4CAF50")
        {
          channels_nav.style.backgroundColor = present_channel_background_color;
        }
        else
        {
          channels_nav.style.backgroundColor = "#333";
        }
      };
      privates_nav.onmouseleave = () =>
      {
        if(present_private_background_color === "#4CAF50")
        {
          privates_nav.style.backgroundColor = present_private_background_color;
        }
        else
        {
          privates_nav.style.backgroundColor = "#333";
        }
      };
    }
  add_privates(list)
  {
    for(let index=0;index<list.length;index++)
    {
      let post;
      if(index === 0)
      {
        post = this.#private1({'contents':list[index], 'link':document.querySelector('#privates-image').src, 'name':list[index]});
        document.querySelector('#private1-container').innerHTML = post;
      }
      else
      {
        post = this.#private_list({'contents':list[index], 'link':document.querySelector('#privates-image').src, 'name':list[index]});
        document.querySelector('#privates-container').innerHTML += post;
      }
    }

    document.querySelector('.private1').onclick = () =>
    {
      selected = document.querySelector('.private1').dataset.name;
      height = 0;
      if(document.querySelector('#message') != null && document.querySelector('#messago') != null)
      {
        console.log('this one might work!');
        document.querySelectorAll('#message').forEach(message =>
        {
            message.remove();
        });
        document.querySelector('#messago').remove();
      }
      else if(document.querySelector('#message') != null && document.querySelector('#messago') === null)
      {
        console.log('this is one might work!');
        document.querySelectorAll('#message').forEach(message =>
        {
            message.remove();
        });
      }
      socket.emit('get all privates', {'username':localStorage.getItem('username'), 'private':selected});
    };
    document.querySelectorAll('.private-list').forEach(priv =>
    {
      priv.onclick = () =>
      {
        selected = priv.dataset.name;
        height = 0;
        if(document.querySelector('#message') != null && document.querySelector('#messago') != null)
        {
          document.querySelectorAll('#message').forEach(message =>
          {
              message.remove();
          });
          document.querySelector('#messago').remove();
        }
        else if(document.querySelector('#message') != null && document.querySelector('#messago') === null)
        {
          document.querySelectorAll('#message').forEach(message =>
          {
              message.remove();
          });
        }
        socket.emit('get all privates', {'username':localStorage.getItem('username'), 'private':selected});
      };
    });
  }
  add_channels(list)
  {
    for(let index=0;index<list.length;index++)
    {
      let post;
      if(index === 0)
      {
        post = this.#channel1_template({'contents':list[index], 'link':document.querySelector('#channels-image').src, 'name':list[index]});
        document.querySelector('#channel1-container').innerHTML = post;
      }
      else
      {
        post = this.#rest_channels_template({'contents':list[index], 'link':document.querySelector('#channels-image').src, 'name':list[index]});
        document.querySelector('#channels-container').innerHTML += post;
      }
    }


    document.querySelector('.channel1').onclick = () =>
    {
      selected = document.querySelector('.channel1').dataset.name;
      height = 0;
      if(document.querySelector('#message') != null && document.querySelector('#messago') != null)
      {
        document.querySelectorAll('#message').forEach(message =>
        {
            message.remove();
        });
        document.querySelector('#messago').remove();
      }
      else if(document.querySelector('#message') != null && document.querySelector('#messago') === null)
      {
        document.querySelectorAll('#message').forEach(message =>
        {
            message.remove();
        });
      }
      socket.emit('get all messages', selected);
    };
    document.querySelectorAll('.channel-list').forEach(channel =>
    {
      channel.onclick = () =>
      {
        selected = channel.dataset.name;
        height = 0;
        if(document.querySelector('#message') != null && document.querySelector('#messago') != null)
        {
          document.querySelectorAll('#message').forEach(message =>
          {
              message.remove();
          });
          document.querySelector('#messago').remove();
        }
        else if(document.querySelector('#message') != null && document.querySelector('#messago') === null)
        {
          document.querySelectorAll('#message').forEach(message =>
          {
              message.remove();
          });
        }
        socket.emit('get all messages', selected);
      };
    });
  }
  remove_all_channels()
  {
    document.querySelector('#channel1-container').innerHTML = '';
    document.querySelector('#channels-container').innerHTML = '';
  }
  remove_all_privates()
  {
    document.querySelector('#private1-container').innerHTML = '';
    document.querySelector('#privates-container').innerHTML = '';
  }
  add_post(content, top, left, color, number, author)
  {
    let div = t({'content':content, 'top':top+"px", 'left':left, 'color':color, 'idp':String(number), 'author':author});
    document.querySelector('.message-view').innerHTML += div;
    height += 50;
  }
  add_last_post(content, top, left, color, number, author)
  {
    let div = last({'content':content, 'top':top+"px", 'left':left, 'color':color, 'idp':String(number), 'author':author});
    document.querySelector('.message-view').innerHTML += div;
    height += 50;
    var myDiv = document.querySelector('.message-view');
    myDiv.scrollTop = myDiv.scrollHeight;
  }
  delete_messages()
  {
    document.querySelectorAll('#message').forEach(message =>
    {
      message.remove();
    });
    document.querySelector('#messago').remove();
    height = 0;
  }
  jka_manipulater()
  {
    let jka = document.querySelector('#messago');
    jka.style.marginBottom = "0px";
    jka.id = "message";
  }
  initialize()
  {
    document.querySelector('#send-message').style.top = (window.innerHeight - 80)+"px";
    document.querySelector('.message-view').style.height = String(window.innerHeight - (document.querySelector('#welcome').style.height + document.querySelector('.horizontal-divider').style.height)-115) + "px";
    document.querySelector('.channels-wrapper').style.height = String(window.innerHeight -  (document.querySelector('.bar').offsetHeight + document.querySelector('#channels-heading').offsetHeight)+30) + "px";
    document.querySelector('.privates-wrapper').style.height = "0px";
  }
  secondary_initialize()
  {
    document.querySelector('#send-message').style.top = (window.innerHeight - 80)+"px";
    document.querySelector('.message-view').style.height = String(window.innerHeight - (document.querySelector('#welcome').style.height + document.querySelector('.horizontal-divider').style.height)-115) + "px";
    let channels = document.querySelector('.channels-wrapper');
    let privates = document.querySelector('.privates-wrapper');
    if(channels.style.height === "0px")
    {
        privates.style.height = String(window.innerHeight -  (document.querySelector('.bar').offsetHeight + document.querySelector('#channels-heading').offsetHeight)+30) + "px";
    }
    else
    {
      channels.style.height = String(window.innerHeight - (document.querySelector('.bar').offsetHeight + document.querySelector('#channels-heading').offsetHeight)+30) + "px";
    }
  }
}

document.addEventListener('DOMContentLoaded', ()=>
{
  if(localStorage.getItem('username') == null)
  {
    window.location.replace('http://flackx.herokuapp.com/');
  }
  else
  {
    socket.emit('update my session id', localStorage.getItem('username'));
  }
  selected = "FlackX";
  const body = document.querySelector('body');
  const robot = document.querySelector('#robot');
  const loader1 = document.querySelector('#loader1');
  const loader2 = document.querySelector('#loader2');
  const loader3 = document.querySelector('#loader3');
  const loader4 = document.querySelector('#loader4');
  const img = document.querySelector('#img');
  const image = document.querySelector('#image');
  const add_channel = document.querySelector('#add-channel-button');
  const add_private = document.querySelector('#add-private-button');
  const button = document.querySelector('#sendo');
  const input = document.querySelector('#message-receive');
  const logout_button = document.querySelector('#logout');

  let username, channels, privates, password;
  const mainframe = new mainframe_controller();
  document.querySelector('#core').hidden = true;
  mainframe.initialize();
  document.querySelector('#send-message').style.top = (window.innerHeight - 80)+"px";


  socket.on('connect', () =>
  {
    if(!localStorage.getItem('username'))
    {
      console.log('You have not signed in yet!');
    }
    else
    {
      let username = localStorage.getItem('username');
      socket.emit('get details', {'username':username});
    }
  });
  socket.on('user details', user_json =>
  {
    username = user_json["username"];
    password = user_json["password"];
    privates = user_json["privates"];
  });
  socket.on('all channels currently active', channel_list =>
  {
    channels = channel_list;
    mainframe.manage_navigations();
    mainframe.remove_all_channels();
    mainframe.add_channels(channels);
  });
  socket.on('disconnect', () =>
  {
  });
  socket.on('added a channel', channel_list =>
  {
    channels = channel_list;
    mainframe.remove_all_channels();
    mainframe.add_channels(channels);
  });
  socket.on('added a private chat', private_list =>
  {
    privates = private_list;
    mainframe.remove_all_privates();
    mainframe.add_privates(privates);
  });
  socket.on('private chat send', chat_details =>
  {
    let privatter = chat_details['private'];
    let messages = chat_details['messages'];
    console.log(chat_details);
    if(privatter == selected)
    {
      try
      {
        mainframe.delete_messages();
      }
      catch(e){}
      for(let i=0;i<messages.length;i++)
      {
        if(messages.length-1 == i)
        {
          if(messages[i]['from'] == localStorage.getItem('username'))
          {
            mainframe.add_last_post(messages[i]['message'], height, '45%', '#e66060', counter, messages[i]['from'], privatter)
          }
          else
          {
              mainframe.add_last_post(messages[i]['message'], height, '0%', 'springgreen', counter, messages[i]['from'], privatter);
          }
          break;
        }

        if(messages[i]['from'] == localStorage.getItem('username'))
        {
          mainframe.add_post(messages[i]['message'], height, '45%', '#e66060', counter, messages[i]['from'], privatter);
        }
        else
        {
          mainframe.add_post(messages[i]['message'], height, '0%', 'springgreen', counter, messages[i]['from'], privatter);
        }
      }
      console.log(chat_details);
    }
  });
  socket.on('channel message broadcast', mm =>
  {
    let channelname = mm['channel'];
    let chn_pack = mm['messages'];
    if(channelname == selected)
    {
      try
      {
        mainframe.delete_messages();
      }
      catch(e){}
      for(let i = 0; i<chn_pack.length;i++)
      {
        if(chn_pack.length-1 == i)
        {
          if(chn_pack[i]['by'] == localStorage.getItem('username'))
          {
            mainframe.add_last_post(chn_pack[i]['message'], height, '45%', '#e66060', counter, chn_pack[i]['by'], chn_pack[i]['channel']);
          }
          else
          {
            mainframe.add_last_post(chn_pack[i]['message'], height, '0%', 'springgreen', counter, chn_pack[i]['by'], chn_pack[i]['channel']);
          }
          break;
        }
        if(chn_pack[i]['by'] == localStorage.getItem('username'))
        {
          mainframe.add_post(chn_pack[i]['message'], height, '45%', '#e66060', counter, chn_pack[i]['by'], chn_pack[i]['channel']);
        }
        else
        {
          mainframe.add_post(chn_pack[i]['message'], height, '0%', 'springgreen', counter, chn_pack[i]['by'], chn_pack[i]['channel']);
        }
      }
    }
  });
  socket.on('message history', message_history=>
  {
      try
      {
        mainframe.delete_messages();
      }
      catch(e){}
      for(let i=0;i<message_history.length;i++)
      {
        if(message_history.length-1 == i)
        {
          if(message_history[i]['by'] == localStorage.getItem('username'))
          {
            mainframe.add_last_post(message_history[i]['message'], height, '45%', '#e66060', counter, message_history[i]['by'], message_history[i]['channel']);
          }
          else
          {
            mainframe.add_last_post(message_history[i]['message'], height, '0%', 'springgreen', counter, message_history[i]['by'], message_history[i]['channel']);
          }
          break;
        }
        if(message_history[i]['by'] == localStorage.getItem('username'))
        {
          mainframe.add_post(message_history[i]['message'], height, '45%', '#e66060', counter, message_history[i]['by'], message_history[i]['channel']);
        }
        else
        {
          mainframe.add_post(message_history[i]['message'], height, '0%', 'springgreen', counter, message_history[i]['by'], message_history[i]['channel']);
        }
      }
  });

  if(body.offsetWidth > 800)
  {
    robot.style.animationPlayState = "running";
    loader1.style.animationPlayState = "paused";
    loader2.style.animationPlayState = "paused";
    loader3.style.animationPlayState = "paused";
    loader4.style.animationPlayState = "paused";
  }
  else
  {
    loader1.style.animationPlayState = "running";
    loader2.style.animationPlayState = "running";
    loader3.style.animationPlayState = "running";
    loader4.style.animationPlayState = "running";
    robot.style.animationPlayState = "paused";
  }

  add_channel.onclick = () =>
  {
    let channel_name = prompt(`Name of the new Channel: `);
    if(channel_name === "")
    {
      return;
    }
    else if(channel_name === null)
    {
      return;
    }
    else
    {
      socket.emit('add a channel', {'channel':channel_name});
    }
  };

  add_private.onclick = () =>
  {
    let private_name = prompt(`Name of the new Private chat:`);
    if(private_name === "")
    {
      return;
    }
    else
    {
      socket.emit('add a private chat', {'private':private_name, 'username':localStorage.getItem('username')});
    }
  };

  logout_button.onclick = () =>
  {
    localStorage.removeItem('username');
    window.location.replace('http://flackx.herokuapp.com/');
  }

  robot.addEventListener('animationend', () =>
  {
    robot.remove();
    img.remove();
    image.remove();
    loader1.remove();
    loader2.remove();
    loader3.remove();
    loader4.remove();
    mainframe.manage_navigations();
    socket.emit('get all messages', selected);
    try
    {
      mainframe.add_privates(privates);
    }
    catch(e){}
    socket.emit('get all channels');
    button.onclick = () =>
    {
      let messg = input.value;
      let k;
      if(messg == "")
        return;
      for(let i = 0;i<privates.length; i++)
      {
        if(selected == privates[i])
        {
          k = {'to':selected, 'message':messg, 'from':localStorage.getItem('username')};
          socket.emit('send private message', k);
          return;
        }
      }
      k = {'from':localStorage.getItem('username'), 'message':messg, 'channel':selected};
      socket.emit('send channel message', k);
    };
  });
  loader4.addEventListener('animationend', () =>
  {
    robot.remove();
    img.remove();
    image.remove();
    loader1.remove();
    loader2.remove();
    loader3.remove();
    loader4.remove();
    mainframe.manage_navigations();
    mainframe.add_privates(privates);
  });
});

window.addEventListener('resize', () =>
{
  const body = document.querySelector('body');
  const robot = document.querySelector('#robot');
  const loader1 = document.querySelector('#loader1');
  const loader2 = document.querySelector('#loader2');
  const loader3 = document.querySelector('#loader3');
  const loader4 = document.querySelector('#loader4');


  if(body.offsetWidth > 800)
  {
    robot.style.animationPlayState = "running";
    loader1.style.animationPlayState = "paused";
    loader2.style.animationPlayState = "paused";
    loader3.style.animationPlayState = "paused";
    loader4.style.animationPlayState = "paused";
  }
  else
  {
    loader1.style.animationPlayState = "running";
    loader2.style.animationPlayState = "running";
    loader3.style.animationPlayState = "running";
    loader4.style.animationPlayState = "running";
    robot.style.animationPlayState = "paused";
  }
});
window.addEventListener('load', event =>
{

});
