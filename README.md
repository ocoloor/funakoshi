# funakoshi

[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-image]][daviddm-url]

A bot for ocoloor.

## Configuration

```
# for hubot-github-contribution-stats
HUBOT_GITHUB_CONTRIBUTION_STATS_GYAZO_TOKEN: <GYAZO_TOKEN>

# for hubot-google-image
HUBOT_GOOGLE_CSE_ID: <CSE_ID>
HUBOT_GOOGLE_CSE_KEY: <GOOGLE_API_TOKEN>

# for @moqada/hubot-hatena-counting
HUBOT_HATENA_COUNTING_GYAZO_TOKEN: <GYAZO_TOKEN>
HUBOT_HATENA_COUNTING_COUNTDOWN_PERIODS: '0d,1d,2d,3d,4d,5d,10d,*/50d'
HUBOT_HATENA_COUNTING_COUNTUP_PERIODS: '100d,500d,*/1000d,*/1y'
HUBOT_HATENA_COUNTING_ROOM: <bot room>
HUBOT_HATENA_COUNTING_SCHEDULE: '0 9 * * *'

# for hubot-xmpp
HUBOT_XMPP_USERNAME: funakoshi@<SLACK_TEAM_NAME>.xmpp.slack.com
HUBOT_XMPP_PASSWORD: <XMPP PASSWORD>
HUBOT_XMPP_ROOMS: <SLACK_ROOM>,<SLACK_ROOM>
HEROKU_URL: http://<HEROKU_APP_NAME>.herokuapp.com

# for hubot-youtube
HUBOT_YOUTUBE_API_KEY: <GOOGLE_API_TOKEN>

# etc
TZ: Asia/Tokyo
```

[travis-url]: https://travis-ci.org/ocoloor/funakoshi
[travis-image]:  https://img.shields.io/travis/ocoloor/funakoshi.svg?style=flat-square
[daviddm-url]: https://david-dm.org/ocoloor/funakoshi
[daviddm-image]: https://img.shields.io/david/ocoloor/funakoshi.svg?style=flat-square
