document.addEventListener('DOMContentLoaded', ()=>
{
  var socket = io.connect('http://'+document.domain+':'+location.port);
  const voices2 = window.speechSynthesis.getVoices();
  /*if(localStorage.getItem('username'))
  {
    socket.emit('update my session id', localStorage.getItem('username'));
    window.location.replace('http://127.0.0.1:5000/mainframe');
  }*/
  console.log(localStorage.getItem('username'));
  document.querySelector('#login-alert').style.opacity = 0;

    socket.on('connect', ()=>
    {
      console.log('able to connect...');
      document.querySelector('#login-form').onsubmit = () =>
      {
        let username = document.querySelector('#login-username').value;
        let password = document.querySelector('#login-password').value;
        socket.emit('validate user', {'username':username, 'password':password});
        return false;
      };
    });

    socket.on("error", error=>
    {
      document.querySelector('#login-alert').style.opacity = 1;
      document.querySelector('#login-alert-message').innerHTML = error.message;
      let boolean = false;
      if(error.status == "success")
      {
        var msg = new SpeechSynthesisUtterance();
        msg.text = `${error.username}, Welcome back to Flack X`;
        voices = speechSynthesis.getVoices();
        console.log(voices);
        msg.voice = voices[3];
        window.speechSynthesis.speak(msg);
        console.log(`This one's working2`);
        localStorage.setItem('username', error.username);
        window.location.replace('http://flackx.herokuapp.com/mainframe');
      }
      console.log(localStorage.getItem('username'));
      document.querySelector('#login-alert-button').onclick = () =>
      {
        document.querySelector('#login-alert').style.opacity = 0;
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
      window.location.replace('http://flackx.herokuapp.com')*/
    });



  document.querySelector('#login-submit').disabled = true;
  document.querySelector('#login-username').onkeyup = ()=>
  {
    check_login_forms();
    if(document.querySelector('#login-username').value.length > 0 && document.querySelector('#login-password') > 0)
    {
      document.querySelector('#login-submit').disabled = false;
    }
    else
    {
      document.querySelector('#login-submit').disabled = true;
    }
  };
  document.querySelector('#login-password').onkeyup = () =>
  {
    check_login_forms();
    if(document.querySelector('#login-username').value.length > 0 && document.querySelector('#login-password').value.length > 0)
    {
      document.querySelector('#login-submit').disabled = false;
    }
    else
    {
      document.querySelector('#login-submit').disabled = true;
    }
  };
});

function check_login_forms()
{
  if(document.querySelector('#login-username').value.length == 0)
  {
    document.querySelector('#login-username').style.border = '1px solid red';
  }
  else
  {
    document.querySelector('#login-username').style.border = '1px solid blue';
  }

  if(document.querySelector('#login-password').value.length == 0)
  {
    document.querySelector('#login-password').style.border = '1px solid red';
  }
  else
  {
    document.querySelector('#login-password').style.border = '1px solid blue';
  }
}
