import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

// const LINK = `http://localhost:5000`
const LINK = `https://api.opino.io`
const CMSLINK = "https://app.opino.io"

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
  const [listItems, setListItems] = React.useState([]);


  function ListItem(props) {
    var obj = props.value
    return (
      <article class="message is-dark">
        <div class="message-body">
          <small class="mb-3 is-flex"><a href="" alt={props.id}>{obj.author}</a> • {timeSince(obj.timestamp)} ago</small>
          {obj.message}
          {/* <p class="has-text-right">reply</p> */}
        </div>
      </article>
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

    let url = `${LINK}/add`
    let data = {
      siteName: SITENAME,
      pathName: slugify(window.location.pathname),
      message: message,
      author: 'guest',
      parent: ''
    }
    try {

      const resp = await axios.post(url, data)
      console.log(resp.status);

    } catch (error) {
      console.log(error);
    }
    alert('done')
    setMessage('')
    getComments()
  }

  React.useEffect(() => {
    getComments()
  }, []);

  if (error) {
    return (
      <div>{error}</div>
    )
  }

  return (
    <div>
      <textarea class="textarea" placeholder="Type your comment" value={message} onChange={e => setMessage(e.target.value)}></textarea>
      <button class="button" onClick={async () => addComment()}>Comment</button>
      <hr></hr>
      <p>{listItems.length} comments</p>
      {listItems}
      <iframe src={CMSLINK} title="" style={{ position: 'absolute', width: 0, height: 0, border: 0 }}></iframe>
    </div>
  );
}

ReactDOM.render(<Example />, document.getElementById('cmt'));