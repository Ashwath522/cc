const { mongo } = require('../../../init');

async function clearCollections(db) {
  let collections = await db.listCollections().toArray();
  let allPrs = [];

  for (let c of collections) {
    allPrs.push(db.collection(c.name).deleteMany({}));
  }
  await Promise.all(allPrs);
}

async function cleanup() {
  await clearCollections(mongo.host.db);
}

module.exports = {
  cleanup,
  clearCollections,
};
