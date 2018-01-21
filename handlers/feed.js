import https from 'https';
import { parseString } from 'xml2js';

class Feed {
  static HOST = 'feeds.feedburner.com';

  constructor(callback, id) {
    this.callback = callback;
    this.requestOptions = {
      method: 'GET',
      host: Feed.HOST,
      path: `/nasa/${id}`
    };
  }

  request() {
    https.request(
      this.requestOptions,
      (res) => this.parseResponse(res)
    ).end();
  }

  response(json) {
    this.callback(
      null,
      {
        statusCode: 200,
        body: JSON.stringify(this.filterFeed(json))
      }
    );
  }

  filterFeed(json) {
    return json.rss.channel[0].item.map((item) => {
      return {
        thumbnail: item['media:thumbnail'][0].$.url,
        image: item['media:content'][0].$.url,
        timestamp: new Date(item.pubDate)
      };
    });
  }

  parseResponse(res) {
    let body = '';
    res.setEncoding('utf8');
    res
      .on('data', chunk => body += chunk)
      .on('end', () => {
        parseString(body, (err, object) => this.response(object));
      });
  }
}

export default ({ pathParameters }, context, callback) => {
  new Feed(callback, pathParameters.id).request();
};
