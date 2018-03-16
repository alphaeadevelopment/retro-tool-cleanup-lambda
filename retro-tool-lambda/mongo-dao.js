/* eslint-disable no-unused-vars */
import { MongoClient } from 'mongodb';
import omit from 'lodash/omit';

class MongoDao {
  sessionsCollection = 'sessions'
  socketsCollection = 'sockets'
  constructor(dbName, url) {
    console.info('Creating Mongo DAO %s at %s', dbName, url);
    this.dbName = dbName;
    this.url = url;
  }
  withCollection = (collection, fn) => {
    const self = this;
    let client;
    return new Promise((res, rej) => {
      MongoClient.connect(this.url)
        .then((c) => {
          client = c;
          const db = client.db(this.dbName);
          const coll = db.collection(collection);
          try {
            fn.call(self, coll)
              .then((d) => {
                client.close();
                res(d);
              })
              .catch((e) => {
                client.close();
                rej(e);
              });
          }
          catch (e) {
            client.close();
            rej(e);
          }
        })
        .catch(e => {
          if (client) client.close();
          rej(e);
        })
    });
  }

  findPurgeCandidates = token => this.withCollection(
    this.sessionsCollection,
    (coll) => {
      const query = {
        connectedParticipants: 0,
      };
      return coll.find(query).batchSize(30).project({ _id: 1 }).toArray();
    })
    .then(r => r.map(i => i._id))
    .catch(e => e);

  purgeSessionsAndSockets = sessionIds => new Promise((res, rej) => {
    this.withCollection(
      this.sessionsCollection,
      (coll) => {
        console.log('delete sessions: %s', sessionIds);
        const query = {
          _id: { $in: sessionIds },
        }
        return coll.deleteMany(query)
          .then(r => console.log('deleted %i sessions', r.result.n))
          .catch(e => e);
      },
    )
      .then(() => {
        this.withCollection(
          this.socketsCollection,
          (coll) => {
            const query = {
              sessionId: { $in: sessionIds },
            }
            return coll.deleteMany(query)
              .then(r => console.log('deleted %i sockets', r.result.n))
              .catch(e => e);
          },
        )
          .then(r => res(r))
          .catch(e => rej(e));
      })
      .catch(e => rej(e));
  });
}
export default new MongoDao(process.env.DATABASE_NAME || 'sessions', process.env.MONGODB_URL);
