exports = function(arg) {
  let collection = context.services
    .get("mongodb-atlas")
    .db("printer")
    .collection("jobs");
  let docs = collection.find({ isPrinted: false });

  return docs;
};
