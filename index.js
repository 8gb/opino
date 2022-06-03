import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import styles from './index.css';

// const LINK = `http://localhost:5000`
const LINK = `https://api.opino.ongclement.com`
const CMSLINK = "https://app.opino.ongclement.com"

const SITENAME = document.querySelector('#cmt').dataset.opinoSite
console.log(`${SITENAME}`)

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/&/g, '-and-')
    .replace(/[\s\W-]+/g, '-')
    .replace(/[^a-zA-Z0-9-_]+/g, '');
}

console.log(slugify(window.location.pathname));

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


//todo: xss filter
function Example() {

  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [commentorName, setCommentorName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [listItems, setListItems] = React.useState([]);


  function ListItem(props) {
    var obj = props.value
    return (
      <div
        className={styles.msgbox}
        >
        <p
        className={styles.commentorDetails}
        ><a href={'#' + props.id}>{obj.author}</a> • {timeSince(obj.timestamp)} ago</p>
        {obj.message}
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

      const resp = await axios.get(url)
      arr = resp.data

    } catch (error) {
      if (error.response) {
        setError(error.response.data)
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      }
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

    let name = commentorName || 'Guest'

    let url = `${LINK}/add`
    let data = {
      siteName: SITENAME,
      pathName: slugify(window.location.pathname),
      message: message,
      author: name,
      parent: ''
    }

    let mm = 'unspecified error'
    try {

      const resp = await axios.post(url, data)
      console.log(resp.status);
      mm = 'done'
    } catch (error) {
      if (error.response) {
        mm = error.response.data
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      }
    }
    alert(mm)
    setMessage('')
    getComments()
  }

  React.useEffect(() => {
    getComments()
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
      <iframe src={CMSLINK} title="" style={{ position: 'absolute', width: 0, height: 0, border: 0 }}></iframe>
    </div>
  );
}

ReactDOM.render(<Example />, document.getElementById('cmt'));