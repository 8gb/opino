import React from 'react'
import ReactDOM from 'react-dom'
import DOMPurify from 'dompurify'
import styles from './index.css';

// const LINK = `http://localhost:5000`
const LINK = `https://api.opino.ongclement.com`

const SITENAME = document.querySelector('#cmt').dataset.opinoSite
const TURNSTILE_SITE_KEY = document.querySelector('#cmt').dataset.opinoTurnstile || ''

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/&/g, '-and-')
    .replace(/[\s\W-]+/g, '-')
    .replace(/[^a-zA-Z0-9-_]+/g, '');
}

function timeSince(date) {

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}


function Example() {

  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [commentorName, setCommentorName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [listItems, setListItems] = React.useState([]);
  const [captchaToken, setCaptchaToken] = React.useState(null);
  const turnstileRef = React.useRef(null);


  function ListItem(props) {
    var obj = props.value

    // Sanitize author - strip ALL HTML
    var safeAuthor = DOMPurify.sanitize(obj.author || 'Anonymous', {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });

    // Sanitize message - allow limited safe HTML
    var safeMessage = DOMPurify.sanitize(obj.message || '', {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'a', 'code', 'pre', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href'],
      ALLOW_DATA_ATTR: false
    });

    return (
      <div
        className={styles.msgbox}
        >
        <p
        className={styles.commentorDetails}
        ><a href={'#' + props.id}>{safeAuthor}</a> • {timeSince(obj.timestamp)} ago</p>
        <div dangerouslySetInnerHTML={{ __html: safeMessage }} />
        {/* <p class="has-text-right">reply</p> */}
      </div>
    );
  }


  async function getComments() {
    if (!SITENAME || SITENAME == '') {
      setError('missing sitename attribute')
      return false
    }

    let siteName = SITENAME

    let pathName = slugify(window.location.pathname)

    let host = `${LINK}/thread`
    let param = `?siteName=${siteName}&pathName=${pathName}`
    let url = host + param
    let arr = []
    try {

      const resp = await fetch(url)
      if (!resp.ok) throw new Error(resp.statusText)
      arr = await resp.json()

    } catch (error) {
      setError(error.message || 'Error loading comments')
    }

    setLoading(false)

    //sorting
    arr.sort((a, b) => b.timestamp - a.timestamp)

    const listItems = arr.map((el) =>
      <ListItem key={el.id} id={el.id} value={el} />
    );
    setListItems(listItems)
  }

  async function addComment() {

    if (!message) {
      alert('missing msg')
      return
    }

    // Check captcha if configured
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      alert('Please complete the captcha verification')
      return
    }

    let name = commentorName || 'Guest'

    let url = `${LINK}/add`
    let data = {
      siteName: SITENAME,
      pathName: slugify(window.location.pathname),
      message: message,
      author: name,
      parent: '',
      captchaToken: captchaToken
    }

    let mm = 'unspecified error'
    try {

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!resp.ok) {
        const errorText = await resp.text()
        mm = errorText || resp.statusText
      } else {
        mm = 'done'
      }
    } catch (error) {
      mm = error.message || 'Error posting comment'
    }
    alert(mm)
    setMessage('')
    setCaptchaToken(null)
    // Reset Turnstile widget if it exists
    if (TURNSTILE_SITE_KEY && window.turnstile && turnstileRef.current) {
      window.turnstile.reset(turnstileRef.current)
    }
    getComments()
  }

  React.useEffect(() => {
    getComments()

    // Load Turnstile script if configured
    if (TURNSTILE_SITE_KEY && !window.turnstile) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, []);

  if (error) {
    return (
      <div
        className={styles.error}
      >
        <p
          className={styles.name}
        >opino.ongclement.com error: {error}</p>
      </div>
    )
  }

  return (
    <div
      className={styles.main}
    >
      <div
        className={styles.textareaWrapper}
      >
        <textarea
          className={styles.textarea}
          placeholder="Type your comment"
          value={message}
          onChange={e => setMessage(e.target.value)}
          disabled={loading}
        ></textarea>
      </div>
      {message &&
        <div
        >
          <input className={styles.name} type="text" placeholder="Your name" value={commentorName} onChange={e => setCommentorName(e.target.value)}></input>
          {TURNSTILE_SITE_KEY && (
            <div
              ref={turnstileRef}
              className="cf-turnstile"
              data-sitekey={TURNSTILE_SITE_KEY}
              data-callback={(token) => setCaptchaToken(token)}
              data-theme="light"
            ></div>
          )}
          <button
            className={styles.button}
            disabled={loading}
            onClick={async () => addComment()}>Post</button>
        </div>
      }
      {!loading &&
        <div>
          <hr></hr>
          <p
            className={styles.marginLeft}
          >{listItems.length} comments</p>
          {listItems}
        </div>
      }
    </div>
  );
}

ReactDOM.render(<Example />, document.getElementById('cmt'));