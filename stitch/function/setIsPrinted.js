exports = function(jobId) {
  var collection = context.services
    .get("mongodb-atlas")
    .db("printer")
    .collection("jobs");

  let updateDoc = { $set: { isPrinted: true } };

  collection
    .updateOne({ _id: jobId }, updateDoc)
    .then(result => {
      const { matchedCount, modifiedCount } = result;
      if (matchedCount && modifiedCount) {
        console.log(`Successfully updated job.` + jobId);
      }
    })
    .catch(err => console.error(`Failed to update job: ${err}`));

  return collection.findOne({ _id: jobId });
};
