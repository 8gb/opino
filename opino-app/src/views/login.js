import React, {
  useContext,
  useEffect,
  useState
} from 'react';
import { UserContext } from "../UserProvider";
import { useRouter } from 'next/navigation';
import { message, Input, Button } from "antd";
import authService, { currentProvider } from '../services/auth';
import { Turnstile } from '@marsidev/react-turnstile';

const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value,
});


const Login = (props) => {
  const router = useRouter();
  useEffect(() => {

  }, []);

  const user = useContext(UserContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);


  function onSubmit() {

    switch (form) {
      case 'forgot':
        message.info("Sending email...")
        authService.resetPassword(email, { 
          redirectTo: window.location.origin + '/account?reset=true',
          captchaToken
        })
          .then(() => {
            message.destroy();
            message.success("Password reset email sent! Please check your inbox.");
            setForm('');
          })
          .catch(er => {
            message.destroy();
            message.error(er.message);
          });
        break;
      case 'signup':
        message.info("Creating account...")
        authService.register(email, password, captchaToken)
          .then((e) => {
            // Normalize token retrieval
            const getToken = () => {
              if (e.user && typeof e.user.getIdToken === 'function') {
                return e.user.getIdToken();
              }
              if (e.session && e.session.access_token) {
                return Promise.resolve(e.session.access_token);
              }
              return Promise.resolve(null);
            };

            getToken().then(k => {
              console.log(k)
              if (k) localStorage.setItem("opino-id-token", k);
              
              if (e.user && typeof e.user.sendEmailVerification === 'function') {
                 e.user.sendEmailVerification().then(function () {
                  // Email sent.
                  console.log("322 account...")
                }).catch(function (error) {
                  // An error happened.
                  console.log("555 account...")
                });
              }
            })

            setEmail('')
            setPassword('')
            message.destroy()
            message.success('Welcome!')
            // router.push(from) // Let AuthGuard handle it
          })
          .catch(er => {
            message.destroy()
            message.error(er.message)
          });
        break;

      default:
        message.info("Logging in...")
        authService.login(email, password, captchaToken)
          .then((e) => {
             // Normalize token retrieval
            const getToken = () => {
              if (e.user && typeof e.user.getIdToken === 'function') {
                return e.user.getIdToken();
              }
              if (e.session && e.session.access_token) {
                return Promise.resolve(e.session.access_token);
              }
              return Promise.resolve(null);
            };

            getToken().then(e => {
              console.log(e)
              if (e) localStorage.setItem("opino-id-token", e);
            })

            setEmail('')
            setPassword('')
            message.destroy()
            message.success('Welcome!')
            // router.push(from)
          })
          .catch(er => {
            message.destroy()
            message.error(er.message)
          });
        break;
    }
  }

  function populate() {
    console.log()
    setEmail(process.env.NEXT_PUBLIC_EMAIL)
    setPassword(process.env.NEXT_PUBLIC_PW)
  }

  function signup() {
    setForm('signup')
    setCaptchaToken(null)
  }

  function signin() {
    setForm('')
    setCaptchaToken(null)
  }
  function forgot() {
    setForm('forgot')
    setCaptchaToken(null)
  }
  const handleKey = (event) => {
    // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
    if (event.key === 'Enter') {
      if (email !== "" && password !== "") {
        event.preventDefault();
        event.stopPropagation();
        onSubmit();
      }
    }
  }

  const from = props.lastLocation || '/'



  const isInvalid =
    email === '' ||
    (form !== 'forgot' && password === '');

  if (user)
    return (
      <div>404</div>
    )
    
  return (
    <div className="loginform" onKeyDown={handleKey}>
      {process.env.NODE_ENV !== 'production' ?
        <Button onClick={populate}>populate</Button> :
        <div />
      }
      <div id='logoimg'>
        <h1>opino</h1>
      </div>
      {(form == 'forgot') && (
        <div>
          <form className="inputforma">
            <Input
              size="large"
              className="inputforma"
              value={email}
              onChange={event => setEmail(event.target.value)}
              type="text"
              placeholder="Email Address"
            />
            <Button type="primary" size="large" className="buttona" disabled={isInvalid} onClick={onSubmit}>
              Reset Password
       </Button>
          </form>
          <br />
          <br />
          <Button onClick={signin}>Sign In</Button>
        </div>
      )}
      {(form == 'signup') && (
        <div>
          <form className="inputforma">
            <Input
              size="large"
              className="inputforma"
              value={email}
              onChange={event => setEmail(event.target.value)}
              type="text"
              placeholder="Email Address"
            />
            <Input
              size="large"
              className="inputforma"
              value={password}
              onChange={event => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
            />

            {currentProvider === 'supabase' && (
              <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'center' }}>
                <Turnstile 
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                  onSuccess={setCaptchaToken} 
                />
              </div>
            )}

            <Button type="primary" size="large" className="buttona" disabled={isInvalid} onClick={onSubmit}>
              Create Account
       </Button>
          </form>
          <br />
          <br />
          <Button onClick={signin}>Sign In</Button>
        </div>
      )}
      {(form == '') && (
        <div>
          <form className="inputforma">
            <Input
              size="large"
              className="inputforma"
              value={email}
              onChange={event => setEmail(event.target.value)}
              type="text"
              placeholder="Email Address"
            />
            <Input
              size="large"
              className="inputforma"
              value={password}
              onChange={event => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
            />

            {currentProvider === 'supabase' && (
              <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'center' }}>
                <Turnstile 
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                  onSuccess={setCaptchaToken} 
                />
              </div>
            )}

            <Button type="primary" size="large" className="buttona" disabled={isInvalid} onClick={onSubmit}>
              Sign In
        </Button>
          </form>
          <br />
          <br />
          <Button onClick={signup}>Create an account</Button>
          <br />
          <br />
          <Button onClick={forgot}>Forgot password</Button>
        </div>
      )}
      <br />
      <br />
      
      <a className='properp' href='https://opino.ongclement.com'>
        back to main site
            </a>

    </div>
  )
}

export default Login;