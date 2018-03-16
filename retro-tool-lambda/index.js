import dao from './mongo-dao';

exports.doClean = (event, context, callback) => {
  console.log('start purge');
  dao.findPurgeCandidates()
    .then((candidates) => {
      console.log('got candidates: %s', candidates);
      dao.purgeSessionsAndSockets(candidates)
        .then(() => {
          console.log('purge done');
        })
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
};
