---
layout: page
---

# opino.io
Simple comment system for static site generator.

---

### Open Source
[Audit the code](https://github.com/8gb/opino), improve it to your liking.

### Free
Free backend database hosting, fair usage applies.

### Privacy
No ads and trackers.

### Easy
Add two lines of code, it's just that simple.

---

## Guide
1. [Register an account](https://app.opino.io/settings)
2. Go to settings > add site > and obtain the unique `SITE_ID`.
3. In the settings page, enter the domain name of you website, this is to ensure the comment box to only appear in the website you specified.
4. Add the following code to the page you want the comment box to appear, replace `<<SITE_ID>>` with the one on step 2.

```
<div id="cmt" data-opino-site="<<SITE_ID>>"></div>
<script src="https://cdn.jsdelivr.net/gh/8gb/opino/dist/main.js"></script>
```
<br/>
Your comment widget is now live!



---

## Demo
Try it out. 👇
<br/>
    
<div id="cmt" data-opino-site="001"></div>
<script src="https://cdn.jsdelivr.net/gh/8gb/opino/dist/main.js"></script>
