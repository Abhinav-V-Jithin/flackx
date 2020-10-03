document.addEventListener('DOMContentLoaded', ()=>
{
  document.querySelector('#login-alert').style.opacity = 0;
  document.querySelector('#login-success').style.opacity = 0;


  var socket = io.connect('http://'+document.domain+':'+location.port);
  /*if(localStorage.getItem('flackincomplete'))
  {
    document.querySelector('#login-alert').style.opacity = 1;
    document.querySelector('#login-alert-message').innerHTML = 'Sorry, We for the inconvenience.\n Please register once again, if the success message had not prompted.';
    document.querySelector('#login-alert-button').onclick = () =>
    {
      document.querySelector('#login-alert').style.opacity = 0;
    };
    localStorage.removeItem('flackincomplete');
  }*/
  socket.on("connect", ()=>
  {
    document.querySelector('#register-form').onsubmit = () =>
    {
      let username = document.querySelector('#register-username').value;
      let password = document.querySelector('#register-password').value;
      socket.emit('register', {'username':username, 'password':password});
      return false;
    };
  });

  socket.on("error", error=>
  {
    console.log('able to receive responses...');
    document.querySelector('#login-alert').style.opacity = 1;
    document.querySelector('#login-alert-message').innerHTML = error.message;
    document.querySelector('#login-alert-button').onclick = () =>
    {
      document.querySelector('#login-alert').style.opacity = 0;
    };
  });
  socket.on("success", success=>
  {
    if (Notification.permission === 'granted') {
      var notify = new Notification('Greetings from FlackX!', {
      body: 'You have successfully registered!',
      icon: 'https://bit.ly/2DYqRrh',
      });
    } else {
        // request permission from user
        Notification.requestPermission().then(function(p) {
           if(p === 'granted') {
               // show notification here
           } else {
               console.log('User blocked notifications.');
           }
        }).catch(function(err) {
            console.error(err);
        });
    }

    document.querySelector('#login-success').style.opacity = 1;
    document.querySelector('#login-success-message').innerHTML = success.message;
    document.querySelector('#login-success-button').onclick = () =>
    {
      document.querySelector('#login-success').style.opacity = 0;
    };
  });

  socket.on('disconnect', ()=>
  {
    /*document.querySelector('#login-alert').style.opacity = 1;
    document.querySelector('#login-alert-message').innerHTML = 'Sorry, We could not connect to the server.\n Retrying...';
    document.querySelector('#login-alert-button').onclick = () =>
    {
      document.querySelector('#login-alert').style.opacity = 0;
    };
    localStorage.setItem('flackincomplete', "yes");
    window.location.replace('http://flackx.herokuapp.com/register');*/
  });

  document.querySelector('#register-submit').disabled = true;
  document.querySelector('#register-username').onkeyup = ()=>
  {
    check_register_forms();
    if(document.querySelector('#register-username').value.length > 0 && document.querySelector('#register-password') > 0)
    {
      document.querySelector('#register-submit').disabled = false;
    }
    else
    {
      document.querySelector('#register-submit').disabled = true;
    }
  };
  document.querySelector('#register-password').onkeyup = () =>
  {
    check_register_forms();
    if(document.querySelector('#register-username').value.length > 0 && document.querySelector('#register-password').value.length > 0)
    {
      document.querySelector('#register-submit').disabled = false;
    }
    else
    {
      document.querySelector('#register-submit').disabled = true;
    }
  };
});


function check_register_forms()
{
  if(document.querySelector('#register-username').value.length == 0)
  {
    document.querySelector('#register-username').style.border = '1px solid red';
  }
  else
  {
    document.querySelector('#register-username').style.border = '1px solid blue';
  }

  if(document.querySelector('#register-password').value.length == 0)
  {
    document.querySelector('#register-password').style.border = '1px solid red';
  }
  else
  {
    document.querySelector('#register-password').style.border = '1px solid blue';
  }
}
